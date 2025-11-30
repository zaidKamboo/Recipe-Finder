const mongoose = require("mongoose");
const Recipe = require("../models/recipe.model");
const Ingredient = require("../models/ingredient.model");

function filesToImageUrls(files = []) {
  return (files || [])
    .map((f) => {
      if (!f) return null;
      return (
        f.path ||
        f.location ||
        f.secure_url ||
        f.path ||
        (f.filename ? `/uploads/${f.filename}` : null)
      );
    })
    .filter(Boolean);
}

async function resolveIngredients(recipeIngredients = []) {
  if (!Array.isArray(recipeIngredients)) return [];

  const resolved = [];

  for (const item of recipeIngredients) {
    if (item && item.ingredient) {
      const ingId = mongoose.Types.ObjectId.isValid(item.ingredient)
        ? item.ingredient
        : null;
      if (ingId) {
        const ingDoc = await Ingredient.findById(ingId).select("name").lean();
        resolved.push({
          ingredient: ingId,
          name: item.name || (ingDoc ? ingDoc.name : undefined),
          qty: item.qty,
          unit: item.unit,
          notes: item.notes,
        });
        continue;
      }
    }

    if (item && item.name) {
      const name = String(item.name).trim();
      if (!name) continue;

      let ing = await Ingredient.findOne({
        name: new RegExp("^" + escapeRegExp(name) + "$", "i"),
      });
      if (!ing) {
        ing = new Ingredient({ name });
        await ing.save();
      }

      resolved.push({
        ingredient: ing._id,
        name: item.name,
        qty: item.qty,
        unit: item.unit,
        notes: item.notes,
      });
      continue;
    }
  }

  return resolved;
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      cuisine,
      category,
      ingredients: rawIngredients,
    } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const ingredients = await resolveIngredients(rawIngredients);

    let images = filesToImageUrls(req.files);
    if (!images.length) images = [];

    const recipe = new Recipe({
      title,
      description,
      instructions,
      cuisine,
      category,
      ingredients,
      images,
      createdByAdmin: req.admin?.id || req.user?.id || undefined,
    });

    await recipe.save();

    const populated = await Recipe.findById(recipe._id)
      .populate("createdByAdmin", "username")
      .populate("ingredients.ingredient", "name")
      .lean();

    return res
      .status(201)
      .json({ message: "Recipe created", recipe: populated });
  } catch (err) {
    console.error("createRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getRecipe = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const recipe = await Recipe.findById(id)
      .populate("createdByAdmin", "username")
      .populate("ingredients.ingredient", "name category")
      .lean();

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    return res.status(200).json(recipe);
  } catch (err) {
    console.error("getRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const listRecipes = async (req, res) => {
  try {
    let {
      page = 1,
      pageSize = 12,
      q,
      cuisine,
      category,
      ingredientId,
      trending,
      featured,
    } = req.query;

    page = Math.max(1, Number(page));
    pageSize = Math.min(100, Number(pageSize) || 12);

    const baseFilter = {};

    // Full-text search
    if (q) baseFilter.$text = { $search: q };

    // Existing filters
    if (cuisine) baseFilter.cuisine = cuisine;
    if (category) baseFilter.category = category;

    if (ingredientId && mongoose.Types.ObjectId.isValid(ingredientId)) {
      baseFilter["ingredients.ingredient"] =
        mongoose.Types.ObjectId(ingredientId);
    }

    // We'll build an effective filter and sort based on trending/featured flags.
    let effectiveFilter = { ...baseFilter };
    let sort = { createdAt: -1 }; // default: newest first

    // Helper: a "score" field — use popularity if available, else fallback to views+likes (if you have them).
    // For sorting we prefer to sort by popularity desc, then createdAt desc.
    const trendingSort = { popularity: -1, createdAt: -1 };

    // ---------- FEATURED (dynamic top-percent selection) ----------
    if (featured === "true") {
      // Compute top X% cutoff using popularity within the current baseFilter.
      // We'll fetch the popularity value at the percentile index and then filter by popularity >= cutoff.
      // If 'popularity' doesn't exist on docs, this degenerates to returning the top N by whatever numeric field exists.
      const totalMatching = await Recipe.countDocuments(effectiveFilter);

      if (totalMatching === 0) {
        // nothing to return
        return res.status(200).json({
          data: [],
          meta: { total: 0, page, pageSize, totalPages: 0 },
        });
      }

      // choose topPercent — change this value to tune "featured" share
      const TOP_PERCENT = 0.1; // top 10%
      const cutoffIndex = Math.max(
        0,
        Math.ceil(totalMatching * TOP_PERCENT) - 1
      ); // zero-based

      // Find the popularity value at cutoffIndex (descending). If popularity missing, fallback to 0.
      // We protect against missing/popularity null -> treat as 0 via $ifNull in aggregation OR use find sort and skip.
      const cutoffDoc = await Recipe.find(effectiveFilter)
        .sort({ popularity: -1 })
        .skip(cutoffIndex)
        .limit(1)
        .select({ popularity: 1 })
        .lean();

      let cutoffPopularity = 0;
      if (
        Array.isArray(cutoffDoc) &&
        cutoffDoc.length > 0 &&
        cutoffDoc[0].popularity != null
      ) {
        cutoffPopularity = Number(cutoffDoc[0].popularity) || 0;
      } else {
        // If no popularity values present, fallback to selecting top N by createdAt (we'll implement using IDs)
        // In that case, we will fetch top (cutoffIndex+1) ids and filter by them.
        const topDocsByDate = await Recipe.find(effectiveFilter)
          .sort({ createdAt: -1 })
          .limit(cutoffIndex + 1)
          .select({ _id: 1 })
          .lean();

        const topIds = topDocsByDate.map((d) => d._id).filter(Boolean);
        // restrict to those ids
        effectiveFilter._id = { $in: topIds };
      }

      // If we have a meaningful cutoffPopularity, restrict to popularity >= cutoffPopularity
      if (!("_id" in effectiveFilter) && cutoffPopularity > 0) {
        // Use $gte: keep all recipes with popularity >= cutoffPopularity
        effectiveFilter.popularity = { $gte: cutoffPopularity };
      }

      // After narrowing to featured set, we will sort by trending when requested, else newest
      sort = trending === "true" ? trendingSort : { createdAt: -1 };
    } else if (trending === "true") {
      // ---------- TRENDING (dynamic sorting by score) ----------
      // If only trending requested, just sort by popularity (or fallback) to return most active recipes first.
      sort = trendingSort;
    }

    // If neither featured nor trending specified, keep default sort (newest first).
    const skip = (page - 1) * pageSize;

    // Count after applying effectiveFilter
    const [total, recipes] = await Promise.all([
      Recipe.countDocuments(effectiveFilter),
      Recipe.find(effectiveFilter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .populate("createdByAdmin", "username")
        .populate("ingredients.ingredient", "name")
        .lean(),
    ]);

    return res.status(200).json({
      data: recipes,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error("listRecipes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const existing = await Recipe.findById(id);
    if (!existing) return res.status(404).json({ message: "Recipe not found" });

    const {
      title,
      description,
      instructions,
      cuisine,
      category,
      ingredients: rawIngredients,
      // optional flag: replaceImages=true means replace existing images
      replaceImages,
    } = req.body;

    let ingredients;
    if (Array.isArray(rawIngredients))
      ingredients = await resolveIngredients(rawIngredients);

    const uploadedImages = filesToImageUrls(req.files);
    let imagesToSave;
    if (uploadedImages.length) {
      if (replaceImages === "true" || replaceImages === true)
        imagesToSave = uploadedImages;
      else
        imagesToSave = Array.isArray(existing.images)
          ? existing.images.concat(uploadedImages)
          : uploadedImages;
    }

    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (instructions !== undefined) update.instructions = instructions;
    if (cuisine !== undefined) update.cuisine = cuisine;
    if (category !== undefined) update.category = category;
    if (ingredients !== undefined) update.ingredients = ingredients;
    if (imagesToSave !== undefined) update.images = imagesToSave;

    const updated = await Recipe.findByIdAndUpdate(id, update, { new: true })
      .populate("createdByAdmin", "username")
      .populate("ingredients.ingredient", "name")
      .lean();

    return res.status(200).json({ message: "Recipe updated", recipe: updated });
  } catch (err) {
    console.error("updateRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await Recipe.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: "Recipe not found" });

    return res.status(200).json({ message: "Recipe deleted" });
  } catch (err) {
    console.error("deleteRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  listRecipes,
};
