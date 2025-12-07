const mongoose = require("mongoose");
const Recipe = require("../models/recipe.model");
const Ingredient = require("../models/ingredient.model");

function filesToImageUrls(files = []) {
  if (!Array.isArray(files)) return [];

  return files.map((f) => ({
    url: f.path, 
    publicId: f.filename,
    originalName: f.originalname,
  }));
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
      excludeIds, // optional: comma-separated ids from client
      excludeTrending, // optional flag: 'true' to have server exclude top trending from featured
    } = req.query;

    page = Math.max(1, Number(page));
    pageSize = Math.min(100, Number(pageSize) || 12);

    const baseFilter = {};
    if (q) baseFilter.$text = { $search: q };
    if (cuisine) baseFilter.cuisine = cuisine;
    if (category) baseFilter.category = category;
    if (ingredientId && mongoose.Types.ObjectId.isValid(ingredientId)) {
      baseFilter["ingredients.ingredient"] =
        mongoose.Types.ObjectId(ingredientId);
    }

    let effectiveFilter = { ...baseFilter };
    let sort = { createdAt: -1 };
    const trendingSort = { popularity: -1, createdAt: -1 };

    // If client provided explicit excludeIds, apply them now (client-driven exclusion)
    if (excludeIds) {
      const ids = excludeIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) =>
          mongoose.Types.ObjectId.isValid(s) ? mongoose.Types.ObjectId(s) : null
        )
        .filter(Boolean);
      if (ids.length) effectiveFilter._id = effectiveFilter._id || {};
      if (ids.length)
        effectiveFilter._id.$nin = (effectiveFilter._id.$nin || []).concat(ids);
    }

    // If featured requested and server-side exclusion of trending is desired:
    if (featured === "true") {
      const totalMatching = await Recipe.countDocuments(effectiveFilter);
      if (totalMatching === 0) {
        return res.status(200).json({
          data: [],
          meta: { total: 0, page, pageSize, totalPages: 0 },
        });
      }

      const TOP_PERCENT = 0.1;
      const cutoffIndex = Math.max(
        0,
        Math.ceil(totalMatching * TOP_PERCENT) - 1
      );

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
        const topDocsByDate = await Recipe.find(effectiveFilter)
          .sort({ createdAt: -1 })
          .limit(cutoffIndex + 1)
          .select({ _id: 1 })
          .lean();

        const topIds = topDocsByDate.map((d) => d._id).filter(Boolean);
        if (topIds.length) {
          effectiveFilter._id = effectiveFilter._id || {};
          effectiveFilter._id.$in = topIds;
        }
      }

      if (!("_id" in effectiveFilter) && cutoffPopularity > 0) {
        effectiveFilter.popularity = { $gte: cutoffPopularity };
      }

      // server-side exclusion: if excludeTrending flag passed, compute top trending ids and exclude them
      if (excludeTrending === "true") {
        // compute top trending ids (limit to a reasonable number)
        const trendingLimit = Math.max(pageSize * 2, 6);
        const topTrendingDocs = await Recipe.find(baseFilter)
          .sort(trendingSort)
          .limit(trendingLimit)
          .select({ _id: 1 })
          .lean();

        const trendingIds = topTrendingDocs.map((d) => d._id).filter(Boolean);
        if (trendingIds.length) {
          effectiveFilter._id = effectiveFilter._id || {};
          // ensure we don't overwrite an existing $in (featured selection) — prefer $nin to exclude trending
          effectiveFilter._id.$nin = (effectiveFilter._id.$nin || []).concat(
            trendingIds
          );
        }
      }

      sort = trending === "true" ? trendingSort : { createdAt: -1 };
    } else if (trending === "true") {
      sort = trendingSort;
    }

    const skip = (page - 1) * pageSize;

    const [total, recipesRaw] = await Promise.all([
      Recipe.countDocuments(effectiveFilter),
      Recipe.find(effectiveFilter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .select(
          "title description cuisine category images createdAt updatedAt ingredients createdByAdmin popularity"
        )
        .populate({ path: "createdByAdmin", select: "username" })
        .populate({ path: "ingredients.ingredient", select: "name" })
        .lean(),
    ]);

    const recipes = (Array.isArray(recipesRaw) ? recipesRaw : []).map((r) => {
      const images = Array.isArray(r.images) ? r.images : [];
      const image = images.length ? images[0] : null;

      const ingredients = Array.isArray(r.ingredients)
        ? r.ingredients.map((ig) => ({
            id: ig.ingredient?._id ?? null,
            name: ig.ingredient?.name ?? ig.name ?? null,
            qty: ig.qty ?? null,
            unit: ig.unit ?? null,
            notes: ig.notes ?? null,
          }))
        : [];

      return {
        id: r._id,
        title: r.title ?? "",
        description: r.description ?? "",
        cuisine: r.cuisine ?? "",
        category: r.category ?? "",
        images,
        image,
        ingredients,
        ingredientsCount: ingredients.length,
        ingredientsPreview: ingredients
          .slice(0, 2)
          .map((i) => i.name)
          .filter(Boolean),
        createdByAdmin: r.createdByAdmin
          ? { id: r.createdByAdmin._id, username: r.createdByAdmin.username }
          : null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        popularity: r.popularity ?? null,
      };
    });

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
