import { createSlice } from "@reduxjs/toolkit";

const menuBadgeSlice = createSlice({
  name: "menuBadge",
  initialState: {
    badges: {},
  },
  reducers: {
    setMenuBadge(state, action) {
      const { path, value } = action.payload;
      state.badges[path] = value;
    },
    setMenuBadges(state, action) {
      action.payload.forEach(({ path, value }) => {
        state.badges[path] = value;
      });
    },
    clearMenuBadge(state, action) {
      delete state.badges[action.payload];
    },
    decreaseMenuBadge(state, action) {
      const path = action.payload;
      if (typeof state.badges[path] === "number") {
        state.badges[path] = Math.max(0, state.badges[path] - 1);
        if (state.badges[path] === 0) {
          delete state.badges[path];
        }
      }
    },
    clearAllMenuBadge(state) {
      state.badges = {};
    },
  },
});

export const {
  setMenuBadge,
  setMenuBadges,
  clearMenuBadge,
  decreaseMenuBadge,
  clearAllMenuBadge,
} = menuBadgeSlice.actions;

export default menuBadgeSlice.reducer;
