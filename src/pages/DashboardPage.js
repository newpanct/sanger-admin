import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Button,
  List,
  Skeleton,
  Divider,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import PageCard from "../components/PageCard";

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);

  // 仪表盘关键指标
  const [stats, setStats] = useState({
    newUsers: 0,
    orders: 0,
    totalUsers: 0,
    income: 0,
  });

  // 最新动态
  const [recentActivities, setRecentActivities] = useState([]);

  // 模拟刷新逻辑
  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        newUsers: Math.floor(Math.random() * 200),
        orders: Math.floor(Math.random() * 100),
        totalUsers: 8000 + Math.floor(Math.random() * 3000),
        income: 100000 + Math.floor(Math.random() * 100000),
      });

      const activities = [
        "用户 李四 购买了商品 B",
        "用户 王五 提交了反馈",
        "库存告警：商品 C 仅剩 1 件",
        "管理员更新了系统配置",
      ];
      setRecentActivities(
        Array.from(
          { length: 3 },
          () => activities[Math.floor(Math.random() * activities.length)]
        )
      );

      setLoading(false);
    }, 1000);
  };

  // 初始化时执行一次刷新
  useEffect(() => {
    refresh();
  }, []);

  return (
    <PageCard
      title="仪表盘"
      extraActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={refresh}
          loading={loading}
        >
          刷新数据
        </Button>
      }
    >
      {/* 关键指标 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="今日新增用户"
                value={stats.newUsers}
                valueStyle={{ color: "#3f8600" }}
                prefix={<ArrowUpOutlined />}
                suffix="人"
              />
            </Skeleton>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="今日订单数"
                value={stats.orders}
                valueStyle={{ color: "#3f8600" }}
                prefix={<ArrowUpOutlined />}
                suffix="单"
              />
            </Skeleton>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="总用户数"
                value={stats.totalUsers}
                suffix="人"
              />
            </Skeleton>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="总收入"
                value={stats.income}
                precision={2}
                prefix="¥"
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Card
        title="数据趋势（示例占位图）"
        style={{ marginTop: 12, height: 300 }}
      >
        <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
          <div
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#999",
              border: "1px dashed #ccc",
            }}
          >
            静态数据......
          </div>
        </Skeleton>
      </Card>

      <Row gutter={16} style={{ marginTop: 12 }}>
        {/* 最新动态 */}
        <Col span={12}>
          <Card title="最新动态">
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <List
                dataSource={recentActivities}
                renderItem={(item, index) => (
                  <List.Item key={index}>{item}</List.Item>
                )}
              />
            </Skeleton>
          </Card>
        </Col>

        {/* 快捷操作 */}
        <Col span={12}>
          <Card title="快捷操作">
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Button type="primary" style={{ marginRight: 8 }}>
                新增用户
              </Button>
              <Button type="dashed" style={{ marginRight: 8 }}>
                新建订单
              </Button>
              <Button danger>系统设置</Button>
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </PageCard>
  );
};

export default DashboardPage;
