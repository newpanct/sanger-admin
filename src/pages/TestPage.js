// src/pages/TestPage.js
import React from 'react';
import { Card } from 'antd';
import { Outlet } from 'react-router-dom'; 

const TestPage = () => {
  return (
    <div>
      <h2>测试页面</h2>
      <Card title="测试页面" style={{ margin: '16px 0' }}>
        测试页面
      </Card>
      <Outlet /> {/* 用于渲染子路由内容 */}
    </div>
  );
};

export default TestPage;