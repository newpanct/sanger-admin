import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Button,
  Badge,
  Skeleton,
  message,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import PageCard from "../components/PageCard";
import { getDownWosNum, statDashboard } from "../server/api";
import { Bar } from "@ant-design/charts"; // 改为导入Bar组件

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [downWosNum, setDownWosNum] = useState(0);
  const [statistics, setStatistics] = useState({
    todaySingle: 0,
    todayMoney: 0,
    monthSingle: 0,
    monthMoney: 0,
    totalSingle: 0,
    totalMoney: 0,
  });
  const [statMoon, setStatMoon] = useState({});
  const [wosTotalNum, setWosTotalNum] = useState([]);

  useEffect(() => {
    handleWosTotalNum();
    handleStatOrder();
  }, []);

  // 条形图
  const handleWosTotalNum = async () => {
    try {
      const res = await fetch("/data/getWosTotalNum.json");
      if (!res.ok) throw new Error("读取 WOS 总数失败");
      const data = await res.json();
      setWosTotalNum(data);
    } catch (error) {
      console.error("获取 WOS 总数失败:", error);
      message.error("获取 WOS 总数失败");
    }
  };

  // 订单统计
  const handleStatOrder = async () => {
    try {
      setLoading(true);
      const response = await statDashboard();
      if (response.code === 200) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 月份统计
  const handleStatMoon = async () => {
    try {
      setLoading(true);
      const response = await statMoon();
      if (response.code === 200) {
        setStatMoon(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: "今日单数",
      value: statistics.todaySingle ?? 0,
      suffix: "单",
      color: "#3f8600",
    },
    {
      title: "今日营收",
      value: statistics.todayMoney ?? 0,
      suffix: "元",
      color: "#1E9FFF",
    },
    {
      title: "本月单数",
      value: statistics.monthSingle ?? 0,
      suffix: "单",
      color: "#2F4056",
    },
    {
      title: "本月营收",
      value: statistics.monthMoney ?? 0,
      suffix: "元",
      color: "#FFB800",
    },
    {
      title: "累计单数",
      value: statistics.totalSingle ?? 0,
      suffix: "单",
      color: "#FF5722",
    },
    {
      title: "累计营收",
      value: statistics.totalMoney ?? 0,
      suffix: "元",
      color: "#009688",
    },
  ];

  // 配置条形图
  const barConfig = {
    data: wosTotalNum,
    xField: "title",
    yField: "total",
    colorField: "title",
    style: {
      maxWidth: 20,
    },
    label: {
      text: "total",
    },
  };

  return (
    <PageCard
      title="仪表盘"
      extraActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={handleStatOrder}
        >
          刷新仪表盘
        </Button>
      }
    >
      {/* 关键指标 */}
      <Row gutter={8}>
        {metrics.map((m, i) => (
          <Col span={4} key={i}>
            <Badge.Ribbon text="实时" color={m.color}>
              <Card>
                <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                  <Statistic {...m} valueStyle={{ color: m.color }} />
                </Skeleton>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>

      {/* WOS 总数条形图 */}
      <Card title="WOS 总数统计" style={{ marginTop: 12 }}>
        <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
          <Bar {...barConfig} />
        </Skeleton>
      </Card>
    </PageCard>
  );
};

export default DashboardPage;
