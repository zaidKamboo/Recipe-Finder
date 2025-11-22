// controllers/recipe.controllers.js
const mongoose = require("mongoose");
const Recipe = require("../models/recipe.model");
const Ingredient = require("../models/ingredient.model");
const Admin = require( "../models/admin.model" ); 

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

    // skip invalid item
  }

  return resolved;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
    
exports.createRecipe = async (req, res) => {
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

    // resolve ingredients (create/find Ingredient docs as needed)
    const ingredients = await resolveIngredients(rawIngredients);

    const recipe = new Recipe({
      title,
      description,
      instructions,
      cuisine,
      category,
      ingredients,
      createdByAdmin: req.admin?.id || req.user?.id || undefined,
    });

    await recipe.save();

    // populate before returning
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

/* ===========================================================
   GET RECIPE BY ID
=========================================================== */
exports.getRecipe = async (req, res) => {
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

/* ===========================================================
   LIST RECIPES (pagination + search + filter)
   Query params:
     - page, pageSize, q (text), cuisine, category, ingredientId
=========================================================== */
exports.listRecipes = async (req, res) => {
  try {
    let {
      page = 1,
      pageSize = 12,
      q,
      cuisine,
      category,
      ingredientId,
    } = req.query;
    page = Math.max(1, Number(page));
    pageSize = Math.min(100, Number(pageSize) || 12);

    const filter = {};

    if (q) {
      filter.$text = { $search: q };
    }

    if (cuisine) filter.cuisine = cuisine;
    if (category) filter.category = category;
    if (ingredientId && mongoose.Types.ObjectId.isValid(ingredientId)) {
      filter["ingredients.ingredient"] = mongoose.Types.ObjectId(ingredientId);
    }

    const skip = (page - 1) * pageSize;

    const [total, recipes] = await Promise.all([
      Recipe.countDocuments(filter),
      Recipe.find(filter)
        .sort({ createdAt: -1 })
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

/* ===========================================================
   UPDATE RECIPE
   - Accepts same body as create
   - Reconciles ingredients (creates new Ingredients by name)
=========================================================== */
exports.updateRecipe = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const existing = await Recipe.findById(id);
    if (!existing) return res.status(404).json({ message: "Recipe not found" });

    // Optionally enforce admin ownership or role checks here

    const {
      title,
      description,
      instructions,
      cuisine,
      category,
      ingredients: rawIngredients,
    } = req.body;

    // if ingredients present, resolve them
    let ingredients;
    if (Array.isArray(rawIngredients)) {
      ingredients = await resolveIngredients(rawIngredients);
    }

    // build update object
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (instructions !== undefined) update.instructions = instructions;
    if (cuisine !== undefined) update.cuisine = cuisine;
    if (category !== undefined) update.category = category;
    if (ingredients !== undefined) update.ingredients = ingredients;

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

/* ===========================================================
   DELETE RECIPE
=========================================================== */
exports.deleteRecipe = async (req, res) => {
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
