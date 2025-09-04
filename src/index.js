import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import App from "./App";
import "antd/dist/reset.css";
import reportWebVitals from "./reportWebVitals";
import zhCN from "antd/locale/zh_CN";
import { Provider, useSelector } from "react-redux"; // 引入useSelector
import store from "./store";

// 封装一个主题容器组件
const ThemeContainer = () => {
  const { token } = useSelector((state) => state.theme); // 从Redux获取主题配置
  return (
    <ConfigProvider locale={zhCN} theme={{ token }}>
      <App />
    </ConfigProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ThemeContainer />
  </Provider>
);

reportWebVitals();