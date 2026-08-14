import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import reportWebVitals from "./reportWebVitals";
import { ConfigProvider } from "antd";
import App from "./App";
import zhCN from "antd/locale/zh_CN";
import { Provider, useSelector } from "react-redux";
import store, { persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { applyThemeVars } from "./utils/theme";
import "./index.css";

const ThemeContainer = () => {
  const { token } = useSelector((state) => state.theme);

  useEffect(() => {
    applyThemeVars(token);
  }, [token]);

  return (
    <ConfigProvider locale={zhCN} theme={{ token }}>
      <App />
    </ConfigProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeContainer />
    </PersistGate>
  </Provider>
);

reportWebVitals();
