import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Button, message } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/charts";
const orderTypes = ["ithenciate", "imagetwin", "sanger"];
const generateRandomOrders = (count = 40) => {
  return Array.from({ length: count }, (_, index) => {
    const type = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    return {
      id: `${Date.now()}-${index}`,
      orderType: type,
      money: Math.floor(Math.random() * 1000 + 100),
      create_time: new Date(
        Date.now() - Math.floor(Math.random() * 1000000000)
      ).toLocaleDateString(),
    };
  });
};

const StatisticsPage = () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const data = generateRandomOrders(40);
    setOrders(data);
    message.success("已刷新随机统计数据");
  };

  const totalMoney = orders.reduce((sum, o) => sum + o.money, 0);
  const avgMoney =
    orders.length > 0 ? (totalMoney / orders.length).toFixed(2) : 0;

  const typeSummary = orderTypes.map((type) => {
    const typeOrders = orders.filter((o) => o.orderType === type);
    const total = typeOrders.reduce((sum, o) => sum + o.money, 0);
    return { type, total, count: typeOrders.length };
  });

  // 柱状图配置
  const columnConfig = {
    data: typeSummary,
    xField: "type",
    yField: "total",
    color: "#1677ff",
    label: {
      position: "inside",
      style: { fill: "#fff" },
      layout: [
        { type: "interval-adjust-position" },
        { type: "interval-hide-overlap" },
      ],
    },
  };

  // 饼图配置
  const pieConfig = {
    // appendPadding: 10,
    data: typeSummary.filter((d) => d.total > 0), // 只保留有值的类型
    angleField: "total",
    colorField: "type",
    radius: 0.8,
    label: {
      text: "type",
      style: { fontWeight: "bold" },
    },
    // label: {
    //   offset: "-30%",
    //   content: ({ percent }) => {
    //     const val = Number(percent);
    //     return isNaN(val) ? "0%" : `${(val * 100).toFixed(1)}%`;
    //   },
    //   style: {
    //     fontSize: 14,
    //     textAlign: "center",
    //   },
    // },
    interactions: [{ type: "element-active" }],
  };

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="bordered">
            <Statistic
              title="总金额"
              value={totalMoney}
              prefix="¥"
              valueStyle={{ color: "#3f8600" }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="bordered">
            <Statistic
              title="平均金额"
              value={avgMoney}
              prefix="¥"
              valueStyle={{ color: "#cf1322" }}
              suffix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="bordered">
            <Statistic title="订单数量" value={orders.length} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="订单类型金额分布（柱状图）">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="金额占比（饼图）">
            {/* <DemoPie /> */}
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Button type="primary" icon={<ReloadOutlined />} onClick={refreshData}>
          刷新数据
        </Button>
      </div>
    </div>
  );
};

export default StatisticsPage;
