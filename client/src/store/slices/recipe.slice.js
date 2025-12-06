import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import api from "../../api";

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
      const res = await api.get("/recipes", { params, withCredentials: true });
      const payload = res.data ?? {};
      const items = payload.data ?? payload.items ?? [];
      const meta = payload.meta ?? {
        total: items.length,
        page: params.page || 1,
        pageSize: params.pageSize || items.length,
      };
      return { items, total: meta.total ?? items.length, meta, params };
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const fetchRecipe = createAsyncThunk(
  "recipes/fetchRecipe",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/recipes/${id}`, { withCredentials: true });
      const payload = res.data ?? res;
      const item = payload.data ?? payload;
      return item;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const createRecipe = createAsyncThunk(
  "recipes/createRecipe",
  async (payload, { rejectWithValue }) => {
    try {
      if (payload?.imageFile || payload?.images?.length) {
        const fd = new FormData();
        const data = payload.data ?? payload;
        Object.entries(data || {}).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object" && !(v instanceof File))
            fd.append(k, JSON.stringify(v));
          else fd.append(k, v);
        });
        if (payload.imageFile) fd.append("image", payload.imageFile);
        if (Array.isArray(payload.images))
          payload.images.forEach((f) => fd.append("images", f));
        const res = await api.post("/recipes", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        const item = res.data?.data ?? res.data ?? res;
        return item;
      }
      const res = await api.post("/recipes", payload.data ?? payload, {
        withCredentials: true,
      });
      const item = res.data?.data ?? res.data ?? res;
      return item;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);


export const updateRecipe = createAsyncThunk(
  "recipes/updateRecipe",
  async (
    { id, data = {}, images = [], replaceImages } = {},
    { rejectWithValue }
  ) => {
    try {
      if (!id) throw new Error("Missing recipe id");

      const hasFiles = Array.isArray(images) && images.length > 0;
      if (hasFiles) {
        const fd = new FormData();

        Object.entries(data).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object" && !(v instanceof File)) {
            fd.append(k, JSON.stringify(v));
          } else {
            fd.append(k, v);
          }
        });

        if (typeof replaceImages !== "undefined") {
          fd.append("replaceImages", String(replaceImages));
        }

        images.forEach((file) => {
          fd.append("recipe-images", file);
        });

        const res = await api.put(`/recipes/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

        const payload = res.data?.recipe ?? res.data?.data ?? res.data ?? res;
        return payload;
      }

      const body = {
        ...data,
      };
      if (typeof replaceImages !== "undefined")
        body.replaceImages = replaceImages;

      const res = await api.put(`/recipes/${id}`, body, {
        withCredentials: true,
      });

      const payload = res.data?.recipe ?? res.data?.data ?? res.data ?? res;
      return payload;
    } catch (err) {
      return rejectWithValue(
        err.response?.data ?? err.message ?? "Update failed"
      );
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  "recipes/deleteRecipe",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/recipes/${id}`, { withCredentials: true });
      const payload = res.data ?? res;
      return { id, data: payload };
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const uploadRecipeImage = createAsyncThunk(
  "recipes/uploadRecipeImage",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = id
        ? await api.post(`/recipes/${id}/images`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          })
        : await api.post(`/recipes/uploads`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });
      const payload = res.data?.data ?? res.data ?? res;
      return payload;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

const initialState = recipesAdapter.getInitialState({
  status: "idle",
  fetchStatus: "idle",
  error: null,
  total: 0,
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
    addLocalRecipe(state, action) {
      recipesAdapter.addOne(state, action.payload);
      state.total += 1;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        const { items, total = 0, params } = action.payload;
        recipesAdapter.setAll(state, items);
        state.total = total;
        state.fetchStatus = "succeeded";
        state.lastFetchParams = params ?? null;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload ?? action.error?.message;
      })
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
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(createRecipe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        recipesAdapter.addOne(state, action.payload);
        state.total = (state.total || 0) + 1;
        state.status = "succeeded";
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
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
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(deleteRecipe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        recipesAdapter.removeOne(state, action.payload.id);
        state.total = Math.max(0, (state.total || 0) - 1);
        state.status = "succeeded";
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      })
      .addCase(uploadRecipeImage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadRecipeImage.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(uploadRecipeImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message;
      });
  },
});

export const {
  setFilters,
  setPage,
  setPageSize,
  clearError,
  resetRecipesState,
  addLocalRecipe,
} = recipesSlice.actions;

export default recipesSlice.reducer;

export const {
  selectAll: selectAllRecipes,
  selectById: selectRecipeById,
  selectIds: selectRecipeIds,
  selectEntities: selectRecipeEntities,
  selectTotal: selectRecipeEntitiesCount,
} = recipesAdapter.getSelectors((state) => state.recipes);

export const selectRecipesStatus = (state) => state.recipes.status;
export const selectRecipesFetchStatus = (state) => state.recipes.fetchStatus;
export const selectRecipesError = (state) => state.recipes.error;
export const selectRecipesTotal = (state) => state.recipes.total;
export const selectRecipesPage = (state) => state.recipes.page;
export const selectRecipesPageSize = (state) => state.recipes.pageSize;
export const selectRecipesFilters = (state) => state.recipes.filters;
export const selectHasMoreRecipes = (state) =>
  state.recipes.total > Object.keys(state.recipes.entities).length;
