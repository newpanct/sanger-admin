import { configureStore, createSlice } from '@reduxjs/toolkit';
import themeReducer from './themeSlice'; // 新增的主题reducer

// 创建一个 slice 管理 auth 状态
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    role: null,
    username: null,
  },
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.username = action.payload.username;
    },
    clearAuth: (state) => {
      state.token = null;
      state.role = null;
      state.username = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;

// 创建 store
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    theme: themeReducer,
  },
});

export default store;
