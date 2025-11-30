import { configureStore } from "@reduxjs/toolkit";
import user from "./slices/user.slice";
import recipes from "./slices/recipes.slice";
import trending from "./slices/trending_recipes.slice";
const store = configureStore({
  reducer: {
    user,
    recipes,
    trending,
  },
});

export default store;
