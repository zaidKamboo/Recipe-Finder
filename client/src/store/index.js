import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/auth.slice";
import recipes from "./slices/recipes.slice";
import recipe from "./slices/recipe.slice";
import trending from "./slices/trending_recipes.slice";
import featured from "./slices/featured_recipes.slice";
import admin from "./slices/admin.slice";
const store = configureStore({
  reducer: {
    auth,
    recipes,
    recipe,
    trending,
    featured,
    admin,
  },
});

export default store;
