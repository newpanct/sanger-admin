import { configureStore, createSlice, combineReducers } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import menuBadgeReducer from "./menuBadgeSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// ---- auth slice ----
const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    role: null,
    wechatName:null,
    username: null,
    merchantId: null,
    merchantBalance: null,
  },
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.username = action.payload.username;
      state.wechatName = action.payload.wechatName;
      state.merchantId = action.payload.merchantId;
      state.merchantBalance = action.payload.merchantBalance;
    },
    clearAuth: (state) => {
      state.token = null;
      state.role = null;
      state.wechatName = null;
      state.username = null;
      state.merchantId = null;
      state.merchantBalance = null;
    },
    updateMerchantBalance: (state, action) => {
      state.merchantBalance = action.payload;
    },
  },
});

export const { setAuth, clearAuth, updateMerchantBalance } = authSlice.actions;

// ---- 组合 reducer ----
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  theme: themeReducer,
  menuBadge: menuBadgeReducer,
});

// ---- 持久化配置 ----
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "theme", "menuBadge"],
};

// ---- 持久化后的 reducer ----
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ---- store ----
const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 redux-persist 内部 actions，否则会报错
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// ---- 导出 persistor ----
export const persistor = persistStore(store);
export default store;
