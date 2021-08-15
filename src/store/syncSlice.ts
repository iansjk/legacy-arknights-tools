/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

export const syncSlice = createSlice({
  name: "sync",
  initialState: { dirty: false },
  reducers: {
    setDirty: (state) => {
      state.dirty = true;
    },
    clearDirty: (state) => {
      state.dirty = false;
    },
  },
});

export const { setDirty, clearDirty } = syncSlice.actions;

export default syncSlice.reducer;
