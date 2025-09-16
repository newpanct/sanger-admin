import { App as AntdApp, message } from 'antd'; // 重命名避免冲突
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/routes';
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
    <AntdApp> 
      <MessageInitializer /> 
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AntdApp>
  );
}

export default RootApp;