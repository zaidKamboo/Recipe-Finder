// src/features/recipes/trendingSlice.js
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import BASE_URL from "../../api";
import { GET_RECIPES_ROUTE } from "../../utils/backend_routes.utils";

const trendingAdapter = createEntityAdapter({
  selectId: (r) => r.id ?? r._id,
  sortComparer: (a, b) => {
    // prefer popularity desc, fallback to createdAt
    const pa = a.popularity ?? 0;
    const pb = b.popularity ?? 0;
    if (pa !== pb) return pb - pa;
    if (a.createdAt && b.createdAt)
      return b.createdAt.localeCompare(a.createdAt);
    return 0;
  },
});

/**
 * Fetch trending recipes for home widgets
 * params: { page, pageSize, q, category, cuisine } - all optional
 * defaults: page=1, pageSize=6
 */
export const fetchTrendingRecipes = createAsyncThunk(
  "trending/fetchTrendingRecipes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = {
        trending: true,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 6,
        // forward optional filters if provided
        ...(params.q ? { q: params.q } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(params.cuisine ? { cuisine: params.cuisine } : {}),
      };

      const res = await BASE_URL.get(GET_RECIPES_ROUTE, {
        params: query,
        withCredentials: true,
      });
      console.log(res)
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

const initialState = trendingAdapter.getInitialState({
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  total: 0,
  lastFetchParams: null,
});

const trendingSlice = createSlice({
  name: "trending",
  initialState,
  reducers: {
    clearTrendingError(state) {
      state.error = null;
    },
    resetTrendingState(state) {
      trendingAdapter.removeAll(state);
      state.status = "idle";
      state.error = null;
      state.total = 0;
      state.lastFetchParams = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTrendingRecipes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTrendingRecipes.fulfilled, (state, action) => {
        const { items, total = 0, params } = action.payload;
        // replace current trending list with latest fetch
        trendingAdapter.setAll(state, items);
        state.total = total;
        state.status = "succeeded";
        state.lastFetchParams = params ?? null;
      })
      .addCase(fetchTrendingRecipes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearTrendingError, resetTrendingState } = trendingSlice.actions;
export default trendingSlice.reducer;

/* ---------- Selectors ---------- */

export const {
  selectAll: selectAllTrendingRecipes,
  selectById: selectTrendingById,
  selectIds: selectTrendingIds,
  selectEntities: selectTrendingEntities,
  selectTotal: selectTrendingEntitiesCount,
} = trendingAdapter.getSelectors((state) => state.trending);

export const selectTrendingStatus = (state) => state.trending.status;
export const selectTrendingError = (state) => state.trending.error;
export const selectTrendingTotal = (state) => state.trending.total;
export const selectTrendingLastParams = (state) =>
  state.trending.lastFetchParams;
