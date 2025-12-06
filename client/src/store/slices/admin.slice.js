// src/store/slices/admin.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

/**
 * Thunks
 * - All thunks return res.data from the backend.
 * - Errors use rejectWithValue(err.response?.data?.message || err.message)
 */

export const registerAdmin = createAsyncThunk(
  "admin/registerAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/register", payload, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Registration failed"
      );
    }
  }
);

export const loginAdmin = createAsyncThunk(
  "admin/loginAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/login", payload, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Login failed"
      );
    }
  }
);

export const fetchAdminProfile = createAsyncThunk(
  "admin/fetchAdminProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/profile", { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch admin profile"
      );
    }
  }
);

export const updateAdmin = createAsyncThunk(
  "admin/updateAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      // payload can be { username, password } or FormData if you later support files
      const res = await api.put("/admin", payload, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Update failed"
      );
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  "admin/deleteAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete("/admin", { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Delete failed"
      );
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  "admin/logoutAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post(
        "/admin/logout",
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Logout failed"
      );
    }
  }
);

/**
 * New: fetchAdminDashboard
 * Backend expected response: { message: "Dashboard details", data: { totalRecipes, totalUsers, totalAdmins, recipesByCategory, recentRecipes, topRecipes, ... } }
 */
export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchAdminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/dashboard", { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch dashboard details"
      );
    }
  }
);

/**
 * Slice
 */
const initialState = {
  admin: null,
  status: "idle", // general status for actions like login/register/update
  profileStatus: "idle", // specifically for profile fetch
  dashboard: null,
  dashboardStatus: "idle",
  error: null,
  lastAction: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
    clearAdmin(state) {
      state.admin = null;
      state.status = "idle";
      state.error = null;
      state.lastAction = "clear";
    },
    clearAdminDashboard(state) {
      state.dashboard = null;
      state.dashboardStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    // registerAdmin
    builder
      .addCase(registerAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.lastAction = "register";
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        // backend returns { message, admin: { id, username } }
        state.admin = action.payload?.admin ?? state.admin;
        state.error = null;
        state.lastAction = "register";
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error?.message ?? "Registration failed";
        state.lastAction = "register";
      })

      // loginAdmin
      .addCase(loginAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.lastAction = "login";
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.admin = action.payload?.admin ?? state.admin;
        state.error = null;
        state.lastAction = "login";
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error?.message ?? "Login failed";
        state.lastAction = "login";
      })

      // fetchAdminProfile
      .addCase(fetchAdminProfile.pending, (state) => {
        state.profileStatus = "loading";
        state.error = null;
        state.lastAction = "fetchProfile";
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        // backend returns { id, username } or { admin: {...} } — handle both
        state.admin =
          action.payload?.admin ??
          (action.payload?.id ? action.payload : state.admin);
        state.error = null;
        state.lastAction = "fetchProfile";
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.admin = null;
        state.error =
          action.payload ?? action.error?.message ?? "Not authenticated";
        state.lastAction = "fetchProfile";
      })

      // updateAdmin
      .addCase(updateAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.lastAction = "update";
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.admin = action.payload?.admin ?? state.admin;
        state.error = null;
        state.lastAction = "update";
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error?.message ?? "Update failed";
        state.lastAction = "update";
      })

      // deleteAdmin
      .addCase(deleteAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.lastAction = "delete";
      })
      .addCase(deleteAdmin.fulfilled, (state) => {
        state.status = "succeeded";
        state.admin = null;
        state.error = null;
        state.lastAction = "delete";
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error?.message ?? "Delete failed";
        state.lastAction = "delete";
      })

      // logoutAdmin
      .addCase(logoutAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.lastAction = "logout";
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.status = "succeeded";
        state.admin = null;
        state.error = null;
        state.lastAction = "logout";
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error?.message ?? "Logout failed";
        state.lastAction = "logout";
      })

      // fetchAdminDashboard
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.dashboardStatus = "loading";
        state.error = null;
        state.lastAction = "fetchDashboard";
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.dashboardStatus = "succeeded";
        // backend returns { message, data }
        state.dashboard = action.payload?.data ?? action.payload ?? null;
        state.error = null;
        state.lastAction = "fetchDashboard";
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.dashboardStatus = "failed";
        state.dashboard = null;
        state.error =
          action.payload ??
          action.error?.message ??
          "Failed to fetch dashboard";
        state.lastAction = "fetchDashboard";
      });
  },
});

export const { clearAdminError, clearAdmin, clearAdminDashboard } =
  adminSlice.actions;

/**
 * Selectors
 */
export const selectAdmin = (state) => state.admin.admin;
export const selectAdminStatus = (state) => state.admin.status;
export const selectAdminProfileStatus = (state) => state.admin.profileStatus;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminLastAction = (state) => state.admin.lastAction;

export const selectAdminDashboard = (state) => state.admin.dashboard;
export const selectAdminDashboardStatus = (state) =>
  state.admin.dashboardStatus;

export default adminSlice.reducer;
