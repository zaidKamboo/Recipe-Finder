import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import BASE_URL from "../../api";
import { GET_RECIPES_ROUTE } from "../../utils/backend_routes.utils";

const featuredAdapter = createEntityAdapter({
  selectId: (r) => r.id ?? r._id,
  sortComparer: (a, b) => {
    const pa = a.popularity ?? 0;
    const pb = b.popularity ?? 0;
    if (pa !== pb) return pb - pa;
    if (a.createdAt && b.createdAt)
      return b.createdAt.localeCompare(a.createdAt);
    return 0;
  },
});

export const fetchFeaturedRecipes = createAsyncThunk(
  "featured/fetchFeaturedRecipes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = {
        featured: true,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 6,
        ...(params.q ? { q: params.q } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(params.cuisine ? { cuisine: params.cuisine } : {}),
      };

      const res = await BASE_URL.get(GET_RECIPES_ROUTE, {
        params: query,
        withCredentials: true,
      });

      const payload = res.data ?? res;
      const items = payload.data ?? [];
      const meta = payload.meta ?? {
        total: items.length,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? items.length,
      };

      return {
        items,
        total: meta.total ?? items.length,
        meta,
        params: query,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

const initialState = featuredAdapter.getInitialState({
  status: "idle",
  error: null,
  total: 0,
  lastFetchParams: null,
});

const featuredSlice = createSlice({
  name: "featured",
  initialState,
  reducers: {
    clearFeaturedError(state) {
      state.error = null;
    },
    resetFeaturedState(state) {
      featuredAdapter.removeAll(state);
      state.status = "idle";
      state.error = null;
      state.total = 0;
      state.lastFetchParams = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFeaturedRecipes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFeaturedRecipes.fulfilled, (state, action) => {
        const { items, total = 0, params } = action.payload;
        featuredAdapter.setAll(state, items);
        state.total = total;
        state.status = "succeeded";
        state.lastFetchParams = params ?? null;
      })
      .addCase(fetchFeaturedRecipes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearFeaturedError, resetFeaturedState } = featuredSlice.actions;
export default featuredSlice.reducer;

export const {
  selectAll: selectAllFeaturedRecipes,
  selectById: selectFeaturedById,
  selectIds: selectFeaturedIds,
  selectEntities: selectFeaturedEntities,
  selectTotal: selectFeaturedEntitiesCount,
} = featuredAdapter.getSelectors((state) => state.featured);

export const selectFeaturedStatus = (state) => state.featured.status;
export const selectFeaturedError = (state) => state.featured.error;
export const selectFeaturedTotal = (state) => state.featured.total;
export const selectFeaturedLastParams = (state) =>
  state.featured.lastFetchParams;
