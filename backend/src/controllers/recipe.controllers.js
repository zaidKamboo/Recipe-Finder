const mongoose = require("mongoose");
const Recipe = require("../models/recipe.model");
const Ingredient = require("../models/ingredient.model");
const { detectVegFromIngredients } = require("../utils/index.utils");

function filesToImageUrls(files = []) {
  if (!Array.isArray(files)) return [];

  return files.map((f) => ({
    url: f.path, 
    publicId: f.filename,
    originalName: f.originalname,
  }));
}

async function resolveIngredients(recipeIngredients = []) {
  if (!Array.isArray(recipeIngredients) || !recipeIngredients.length) return [];

  // 1️⃣ Collect names & IDs
  const names = [];
  const ids = [];

  for (const item of recipeIngredients) {
    if (item?.ingredient && mongoose.Types.ObjectId.isValid(item.ingredient)) {
      ids.push(item.ingredient);
    } else if (item?.name) {
      names.push(item.name.trim());
    }
  }

  // 2️⃣ Fetch existing ingredients in ONE query
  const existing = await Ingredient.find({
    $or: [{ _id: { $in: ids } }, { name: { $in: names } }],
  }).lean();

  const byId = new Map(existing.map((i) => [String(i._id), i]));
  const byName = new Map(existing.map((i) => [i.name.toLowerCase(), i]));

  // 3️⃣ Create missing ingredients (bulk-safe)
  const toCreate = [];
  for (const name of names) {
    if (!byName.has(name.toLowerCase())) {
      toCreate.push({ name });
    }
  }

  if (toCreate.length) {
    const created = await Ingredient.insertMany(toCreate, { ordered: false });
    created.forEach((i) => byName.set(i.name.toLowerCase(), i));
  }

  // 4️⃣ Build final ingredients array
  return recipeIngredients
    .map((item) => {
      let ingDoc = null;

      if (item?.ingredient && byId.has(String(item.ingredient))) {
        ingDoc = byId.get(String(item.ingredient));
      } else if (item?.name) {
        ingDoc = byName.get(item.name.toLowerCase());
      }

      if (!ingDoc) return null;

      return {
        ingredient: ingDoc._id,
        name: ingDoc.name, // ✅ ALWAYS present
        qty: item.qty ?? null,
        unit: item.unit ?? null,
        notes: item.notes ?? null,
      };
    })
    .filter(Boolean);
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
      ingredients: rawIngredients = [],
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const ingredients = await resolveIngredients(rawIngredients);

    const images = filesToImageUrls(req.files) || [];

    const recipe = await Recipe.create({
      title,
      description,
      instructions,
      cuisine,
      category,
      ingredients,
      images,
      createdByAdmin: req.admin?.id || req.user?.id,
    });

    const created = await Recipe.findById(recipe._id)
      .populate("createdByAdmin", "username")
      .lean();

    return res.status(201).json({
      message: "Recipe created",
      recipe: created,
    });
  } catch (err) {
    console.error("createRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getRecipe = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const recipe = await Recipe.findById(id)
      .populate("createdByAdmin", "username")
      .populate("ingredients.ingredient", "name category")
      .lean();

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const isVeg = detectVegFromIngredients(recipe.ingredients);

    return res.status(200).json({
      ...recipe,
      isVeg,
      diet: isVeg ? "veg" : "nonveg",
    });
  } catch (err) {
    console.error("getRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ------------------------------------------------------------------
   LIST RECIPES (PAGINATED + FILTERS)
------------------------------------------------------------------- */

const listRecipes = async (req, res) => {
  try {
    let {
      page,
      pageSize,
      q,
      cuisine,
      category,
      ingredientId,
      trending,
      featured,
      excludeIds,
      excludeTrending,
    } = req.query;

    /* ---------------- Base Filters ---------------- */
    const baseFilter = {};

    if (q) baseFilter.$text = { $search: q };
    if (cuisine) baseFilter.cuisine = cuisine;
    if (category) baseFilter.category = category;

    if (ingredientId && mongoose.Types.ObjectId.isValid(ingredientId)) {
      baseFilter["ingredients.ingredient"] = new mongoose.Types.ObjectId(
        ingredientId
      );
    }

    let effectiveFilter = { ...baseFilter };

    /* ---------------- Exclude IDs ---------------- */
    if (excludeIds) {
      const ids = excludeIds
        .split(",")
        .map((id) =>
          mongoose.Types.ObjectId.isValid(id)
            ? new mongoose.Types.ObjectId(id)
            : null
        )
        .filter(Boolean);

      if (ids.length) {
        effectiveFilter._id = { $nin: ids };
      }
    }

    /* ---------------- Sorting ---------------- */
    let sort = { createdAt: -1 };
    const trendingSort = { popularity: -1, createdAt: -1 };

    if (trending === "true") {
      sort = trendingSort;
    }

    /* ---------------- Pagination (OPTIONAL) ---------------- */
    const usePagination = page && pageSize;

    const pageNum = Math.max(1, Number(page || 1));
    const limitNum = Math.min(1000, Number(pageSize || 1000));
    const skip = (pageNum - 1) * limitNum;

    /* ---------------- Query ---------------- */
    const query = Recipe.find(effectiveFilter)
      .sort(sort)
      .select(
        "title description cuisine category images ingredients popularity createdAt updatedAt createdByAdmin"
      )
      .populate("createdByAdmin", "username")
      .populate("ingredients.ingredient", "name");

    if (usePagination) {
      query.skip(skip).limit(limitNum);
    }

    const recipesRaw = await query.lean();
    const total = await Recipe.countDocuments(effectiveFilter);

    /* ---------------- Normalize ---------------- */
    const recipes = recipesRaw.map((r) => {
      const ingredients = (r.ingredients || []).map((ig) => ({
        id: ig.ingredient?._id ?? null,
        name: ig.ingredient?.name ?? ig.name ?? null,
        qty: ig.qty ?? null,
        unit: ig.unit ?? null,
        notes: ig.notes ?? null,
      }));

      const isVeg = detectVegFromIngredients(r.ingredients);

      return {
        id: r._id,
        title: r.title,
        description: r.description,
        cuisine: r.cuisine,
        category: r.category,
        images: r.images || [],
        image: r.images?.[0] ?? null,
        ingredients,
        ingredientsCount: ingredients.length,
        ingredientsPreview: ingredients.slice(0, 2).map((i) => i.name),
        isVeg,
        diet: isVeg ? "veg" : "nonveg",
        createdByAdmin: r.createdByAdmin
          ? {
              id: r.createdByAdmin._id,
              username: r.createdByAdmin.username,
            }
          : null,
        popularity: r.popularity ?? 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return res.status(200).json({
      data: recipes,
      meta: {
        total,
        page: usePagination ? pageNum : 1,
        pageSize: usePagination ? limitNum : total,
        totalPages: usePagination ? Math.ceil(total / limitNum) : 1,
      },
    });
  } catch (err) {
    console.error("listRecipes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const existing = await Recipe.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const {
      title,
      description,
      instructions,
      cuisine,
      category,
      ingredients: rawIngredients,
      replaceImages,
    } = req.body;

    const update = {};

    // ---------- Scalar fields ----------
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (instructions !== undefined) update.instructions = instructions;
    if (cuisine !== undefined) update.cuisine = cuisine;
    if (category !== undefined) update.category = category;

    // ---------- Ingredients ----------
    if (Array.isArray(rawIngredients)) {
      update.ingredients = await resolveIngredients(rawIngredients);
    }

    // ---------- Images ----------
    const uploadedImages = Array.isArray(req.files)
      ? filesToImageUrls(req.files)
      : [];

    if (uploadedImages.length) {
      update.images =
        replaceImages === true || replaceImages === "true"
          ? uploadedImages
          : [...(existing.images || []), ...uploadedImages];
    }

    const updated = await Recipe.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    )
      .populate("createdByAdmin", "username")
      .lean();

    return res.status(200).json({
      message: "Recipe updated",
      recipe: updated,
    });
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
