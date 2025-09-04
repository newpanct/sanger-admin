import { App as AntdApp, message } from 'antd'; // 重命名避免冲突
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';

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
      <Router>
        <AppRoutes />
      </Router>
    </AntdApp>
  );
}

export default RootApp;