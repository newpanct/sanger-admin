import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import reportWebVitals from "./reportWebVitals";
import { ConfigProvider } from "antd";// 全局配置组件
import App from "./App";// 根App组件
import zhCN from "antd/locale/zh_CN";// antd 默认配置中文
import { Provider, useSelector } from "react-redux"; // 引入useSelector
import store from "./store";// rudux状态

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
