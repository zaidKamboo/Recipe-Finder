import { createSlice } from "@reduxjs/toolkit";

const initialState = {};
const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    setUser: (_, u) => u,
    unsetUser: (_) => initialState,
  },
});

export default userSlice.reducer;
