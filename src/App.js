import { App as AntdApp, ConfigProvider, message } from "antd"; // 重命名避免冲突
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import "dayjs/locale/zh-cn";
import zhCN from "antd/locale/zh_CN";
// 全局消息提示
const MessageInitializer = () => {
  const [messageApi, contextHolder] = message.useMessage();
  message.success = messageApi.success;
  message.error = messageApi.error;
  message.info = messageApi.info;
  message.warning = messageApi.warning;
  message.loading = messageApi.loading;
  return contextHolder;
};

function RootApp() {
  return (
    <ConfigProvider locale={zhCN}>
    <AntdApp>
      <MessageInitializer />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AntdApp>
    </ConfigProvider>
  );
}

export default RootApp;
