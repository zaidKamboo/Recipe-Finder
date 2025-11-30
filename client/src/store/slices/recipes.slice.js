// src/features/recipes/recipesSlice.js
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
// import * as recipeAPI from "../../api/recipeService"; // adjust path to your service
import BASE_URL from "../../api";
import { GET_RECIPES_ROUTE } from "../../utils/backend_routes.utils";


const recipesAdapter = createEntityAdapter({
  selectId: (r) => r.id ?? r._id,
  sortComparer: (a, b) => {
    if (a.createdAt && b.createdAt)
      return b.createdAt.localeCompare(a.createdAt);
    return 0;
  },
});


export const fetchRecipes = createAsyncThunk(
  "recipes/fetchRecipes",
  async (params = {}, { rejectWithValue }) => {
    try {
      BASE_URL.get(GET_RECIPES_ROUTE, { withCredentials: true })
        .then((res) => {
          const payload = res.data ?? res; // { data, meta }
          const items = payload.data ?? [];
          const meta = payload.meta ?? {
            total: items.length,
            page: params.page || 1,
            pageSize: params.pageSize || items.length,
          };

          console.log(res);
          return {
            items,
            total: meta.total ?? items.length,
            meta,
            params,
          };
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const fetchRecipe = createAsyncThunk(
  "recipes/fetchRecipe",
  async (id, { rejectWithValue }) => {
    try {
      const res = await recipeAPI.getRecipe(id);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

/**
 * payload: { data: { title, ingredients, ... }, imageFile?: File }
 * If imageFile present and you have an upload endpoint, either:
 * - upload it separately via uploadImage thunk before calling createRecipe, or
 * - send multipart form in this thunk (below supports FormData if imageFile)
 */
export const createRecipe = createAsyncThunk(
  "recipes/createRecipe",
  async (payload, { rejectWithValue }) => {
    try {
      // if backend accepts multipart
      if (payload?.imageFile) {
        const fd = new FormData();
        Object.entries(payload.data || {}).forEach(([k, v]) => {
          // arrays/objects should be JSON.stringified
          if (Array.isArray(v) || typeof v === "object")
            fd.append(k, JSON.stringify(v));
          else fd.append(k, v);
        });
        fd.append("image", payload.imageFile);
        const res = await recipeAPI.createRecipe(fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data ?? res;
      }

      // normal JSON create
      const res = await recipeAPI.createRecipe(payload.data ?? payload);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const updateRecipe = createAsyncThunk(
  "recipes/updateRecipe",
  async ({ id, data, imageFile }, { rejectWithValue }) => {
    try {
      if (imageFile) {
        const fd = new FormData();
        Object.entries(data || {}).forEach(([k, v]) => {
          if (Array.isArray(v) || typeof v === "object")
            fd.append(k, JSON.stringify(v));
          else fd.append(k, v);
        });
        fd.append("image", imageFile);
        const res = await recipeAPI.updateRecipe(id, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data ?? res;
      }

      const res = await recipeAPI.updateRecipe(id, data);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  "recipes/deleteRecipe",
  async (id, { rejectWithValue }) => {
    try {
      const res = await recipeAPI.deleteRecipe(id);
      return { id, data: res.data ?? res };
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

/** Optional upload image thunk, if you have a dedicated uploads endpoint */
export const uploadRecipeImage = createAsyncThunk(
  "recipes/uploadRecipeImage",
  async (file, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await recipeAPI.uploadImage(fd); // implement this in api/service
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

/* ---------- Slice ---------- */

const initialState = recipesAdapter.getInitialState({
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  fetchStatus: "idle", // separate for list
  error: null,
  total: 0,
  // pagination & filters
  page: 1,
  pageSize: 12,
  filters: {},
  lastFetchParams: null,
});

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setPageSize(state, action) {
      state.pageSize = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetRecipesState(state) {
      recipesAdapter.removeAll(state);
      state.status = "idle";
      state.fetchStatus = "idle";
      state.error = null;
      state.total = 0;
      state.page = 1;
      state.pageSize = 12;
      state.filters = {};
      state.lastFetchParams = null;
    },
    // optimistic add (client-side) if you want to append immediately
    addLocalRecipe(state, action) {
      recipesAdapter.addOne(state, action.payload);
      state.total += 1;
    },
  },
  extraReducers(builder) {
    // fetchRecipes
    builder
      .addCase(fetchRecipes.pending, (state, action) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        const { items, total = 0, params } = action.payload;
        // replace all items (pagination) - if you prefer append for infinite scroll, adapt here
        recipesAdapter.setAll(state, items);
        state.total = total;
        state.fetchStatus = "succeeded";
        state.lastFetchParams = params ?? null;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload ?? action.error.message;
      })

      // fetchRecipe
      .addCase(fetchRecipe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRecipe.fulfilled, (state, action) => {
        recipesAdapter.upsertOne(state, action.payload);
        state.status = "succeeded";
      })
      .addCase(fetchRecipe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })

      // createRecipe
      .addCase(createRecipe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        recipesAdapter.addOne(state, action.payload);
        state.total += 1;
        state.status = "succeeded";
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })

      // updateRecipe
      .addCase(updateRecipe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        recipesAdapter.upsertOne(state, action.payload);
        state.status = "succeeded";
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })

      // deleteRecipe
      .addCase(deleteRecipe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        const { id } = action.payload;
        recipesAdapter.removeOne(state, id);
        state.total = Math.max(0, state.total - 1);
        state.status = "succeeded";
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })

      // uploadRecipeImage (optional)
      .addCase(uploadRecipeImage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadRecipeImage.fulfilled, (state, action) => {
        // returns { url, id, ... } - up to you how to use it
        state.status = "succeeded";
      })
      .addCase(uploadRecipeImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});

/* ---------- Exports ---------- */

export const {
  setFilters,
  setPage,
  setPageSize,
  clearError,
  resetRecipesState,
  addLocalRecipe,
} = recipesSlice.actions;

export default recipesSlice.reducer;

/* ---------- Selectors ---------- */

// entity adapter selectors
export const {
  selectAll: selectAllRecipes,
  selectById: selectRecipeById,
  selectIds: selectRecipeIds,
  selectEntities: selectRecipeEntities,
  selectTotal: selectRecipeEntitiesCount, // this counts entities in state
} = recipesAdapter.getSelectors((state) => state.recipes);

// other selectors
export const selectRecipesStatus = (state) => state.recipes.status;
export const selectRecipesFetchStatus = (state) => state.recipes.fetchStatus;
export const selectRecipesError = (state) => state.recipes.error;
export const selectRecipesTotal = (state) => state.recipes.total;
export const selectRecipesPage = (state) => state.recipes.page;
export const selectRecipesPageSize = (state) => state.recipes.pageSize;
export const selectRecipesFilters = (state) => state.recipes.filters;
export const selectHasMoreRecipes = (state) =>
  state.recipes.total > Object.keys(state.recipes.entities).length;
