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
    roleId: null,
    roleName: null,
    id: null,
    wechatName: null,
    username: null,
    avatar: null,
    email: null,
    phone: null,
    isBindWechat: null,
    menus: [],
    merchantId: null,
    merchantBalance: null,
  },
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.roleId = action.payload.roleId;
      state.roleName = action.payload.roleName;
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.avatar = action.payload.avatar;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.isBindWechat = action.payload.isBindWechat;
      state.menus = action.payload.menus || [];
      state.wechatName = action.payload.wechatName;
      state.merchantId = action.payload.merchantId;
      state.merchantBalance = action.payload.merchantBalance;
    },
    clearAuth: (state) => {
      state.token = null;
      state.role = null;
      state.roleId = null;
      state.roleName = null;
      state.id = null;
      state.wechatName = null;
      state.username = null;
      state.avatar = null;
      state.email = null;
      state.phone = null;
      state.isBindWechat = null;
      state.menus = [];
      state.merchantId = null;
      state.merchantBalance = null;
    },
    updateMerchantBalance: (state, action) => {
      state.merchantBalance = action.payload;
    },
    updateMenus: (state, action) => {
      state.menus = action.payload || [];
    },
  },
});

export const { setAuth, clearAuth, updateMerchantBalance, updateMenus } = authSlice.actions;

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
