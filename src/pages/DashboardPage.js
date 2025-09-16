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
import { getDownWosNum } from "../server/api";
import { Bar } from "@ant-design/charts"; // 改为导入Bar组件

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [downWosNum, setDownWosNum] = useState(0);
  const [statistics, setStatistics] = useState({});
  const [wosTotalNum, setWosTotalNum] = useState([]);

  useEffect(() => {
    handleRefresh();
    handleWosTotalNum(); // 初始化时加载 wos 数据
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [wosRes, statRes] = await Promise.all([
        getDownWosNum(),
        fetch("/data/getStatistics.json"),
      ]);

      if (wosRes?.status === 200) setDownWosNum(wosRes.data);
      if (statRes.ok) setStatistics(await statRes.json());
      else throw new Error("读取静态数据失败");
    } catch (err) {
      console.error(err);
      message.error("数据获取失败");
    } finally {
      setLoading(false);
    }
  };

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

  const metrics = [
    { title: "下载期刊信息", value: downWosNum, suffix: "次", color: "#3f8600" },
    { title: "当日新增用户", value: statistics.dataAdd, suffix: "人", color: "#1E9FFF" },
    { title: "昨日活跃用户", value: statistics.dataActive, suffix: "人", color: "#2F4056" },
    { title: "当日订单统计", value: statistics.dataOrderNum, suffix: "单", color: "#FFB800" },
    { title: "当日支付统计", value: statistics.dataOrderCount, prefix: "¥", color: "#FF5722" },
    { title: "当日查重统计", value: statistics.dataThesisCount, suffix: "次", color: "#009688" },
    { title: "站内查重统计", value: statistics.dataOtherThesisCount, suffix: "次", color: "#FF0000" },
    { title: "查重可用余额", value: statistics.thesisBalance, prefix: "¥", precision: 2, color: "#7CEE75" },
  ];

  // 配置条形图
  const barConfig = {
    data: wosTotalNum, 
    xField: "title", 
    yField: "total", 
    colorField: 'title',
    style: {
      maxWidth: 20,
    },
    label: {
      text: 'total',
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
          onClick={handleRefresh}
        >
          刷新仪表盘
        </Button>
      }
    >
      {/* 关键指标 */}
      <Row gutter={8}>
        {metrics.map((m, i) => (
          <Col span={3} key={i}>
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
