// src/store/themeSlice.js（需安装redux-toolkit）
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: {
    colorPrimary: '#1677ff', // 默认主色
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
  },
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeToken: (state, action) => {
      state.token = { ...state.token, ...action.payload };
    },
  },
});

export const { setThemeToken } = themeSlice.actions;
export default themeSlice.reducer;