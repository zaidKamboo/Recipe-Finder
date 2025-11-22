// routes/recipe.routes.js
const express = require("express");
const router = express.Router();

const recipeController = require("../controllers/recipe.controllers");
const { isAdmin } = require("../middlewares/admin.middleware");

router.get("/", recipeController.listRecipes);
router.get("/:id", recipeController.getRecipe);

router.post("/", isAdmin, recipeController.createRecipe);
router.put("/:id", isAdmin, recipeController.updateRecipe);
router.delete("/:id", isAdmin, recipeController.deleteRecipe);

module.exports = router;
