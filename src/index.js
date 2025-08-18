import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import './index.css';
import App from './App';
import 'antd/dist/reset.css';
import reportWebVitals from './reportWebVitals';
const theme = {
  token: {
    // 主色调，会影响按钮、链接、标签等组件的颜色
    colorPrimary: '#f9e454',
    // 成功状态颜色
    colorSuccess: '#52c41a',
    // 警告状态颜色
    colorWarning: '#faad14',
    // 错误状态颜色
    colorError: '#ff4d4f',
    // 信息状态颜色
    colorInfo: '#1677ff',
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    // <App />
  // </React.StrictMode>
  
  // <ConfigProvider theme={theme}>
    <App />
  // </ConfigProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
