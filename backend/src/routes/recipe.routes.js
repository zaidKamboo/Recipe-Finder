const express = require("express");
const router = express.Router();

const recipeController = require( "../controllers/recipe.controllers" );

const { isAdmin } = require("../middlewares/admin.middleware");
const uploadRecipeImagesMiddleware = require("../middlewares/upload-recipe-image.middleware");

router.get("/", recipeController.listRecipes);
router.get("/:id", recipeController.getRecipe);

router.post(
  "/",
  isAdmin,
  uploadRecipeImagesMiddleware,
  recipeController.createRecipe
);

router.put(
  "/:id",
  isAdmin,
  uploadRecipeImagesMiddleware,
  recipeController.updateRecipe
);

router.delete("/:id", isAdmin, recipeController.deleteRecipe);

module.exports = router;
