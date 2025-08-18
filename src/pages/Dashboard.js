// src/pages/Dashboard.js
import React from 'react';
import { Card } from 'antd';

const Dashboard = () => {
  return (
    <div>
      <h2>系统仪表盘</h2>
      <Card title="关键数据概览" style={{ margin: '16px 0' }}>
        这里显示统计图表/关键指标（示例内容）
      </Card>
    </div>
  );
};

export default Dashboard;