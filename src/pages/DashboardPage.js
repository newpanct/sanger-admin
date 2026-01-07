import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFailed, statDashboard, statMoon } from "../server/api";
import { Column } from "@ant-design/charts";
import { Card, Col, Row, Statistic, Button, Badge, Skeleton } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { setMenuBadges } from "../store/menuBadgeSlice";
import PageCard from "../components/PageCard";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const badgeMap = useSelector((state) => state.menuBadge.badges);
  const [statistics, setStatistics] = useState({
    todaySingle: 0,
    todayMoney: 0,
    monthSingle: 0,
    monthMoney: 0,
    totalSingle: 0,
    totalMoney: 0,
  });
  const [statMoonOrder, setStatMoonOrder] = useState([]);
  const [failedStat, setFailedStat] = useState({
    paperCount: 0,
    imageCount: 0,
    turnitinCount: 0,
  });

  useEffect(() => {
    onInit();
    // 异常订单
    setFailedStat({
      paperCount: badgeMap["/scan/crosscheck/abnormal-orders"] || 0,
      imageCount: badgeMap["/scan/imagetwin/abnormal-orders"] || 0,
      turnitinCount: badgeMap["/scan/history/abnormal-orders"] || 0,
    });
  }, []);

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

  // 月度统计
  const handleStatMoon = async () => {
    try {
      setLoading(true);
      const response = await statMoon();
      if (response.code === 200) {
        setStatMoonOrder(response.data || []); // 确保是数组
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 异常订单
  // const handleFailedOrder = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await getFailed();
  //     if (res?.code === 200) {
  //       const data = res.data || {};

  //       setFailedStat({
  //         paperCount: data.paperCount || 0,
  //         imageCount: data.imageCount || 0,
  //         turnitinCount: data.turnitinCount || 0,
  //       });

  //       dispatch(
  //         setMenuBadges([
  //           {
  //             path: "/scan/crosscheck/abnormal-orders",
  //             value: data.paperCount,
  //           },
  //           {
  //             path: "/scan/imagetwin/abnormal-orders",
  //             value: data.imageCount,
  //           },
  //           {
  //             path: "/scan/history/abnormal-orders",
  //             value: data.turnitinCount,
  //           },
  //           {
  //             path: "/recommend/journals",
  //             value: 10,
  //           },
  //         ])
  //       );
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onInit = () => {
    handleStatOrder();
    handleStatMoon();
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

  // 月订单数柱状图
  const moonSingleConfig = {
    data: statMoonOrder || [],
    xField: "month",
    yField: "single",
    color: "#1677ff",
    label: {
      position: "top",
    },
    yAxis: {
      title: {
        text: "订单数（单）",
      },
    },
  };

  // 月营收柱状图
  const moonAmountConfig = {
    data: statMoonOrder || [],
    xField: "month",
    yField: "amount",
    color: "#52c41a",
    label: {
      position: "top",
      formatter: (v) => `￥${v}`,
    },
    yAxis: {
      title: {
        text: "营收（元）",
      },
    },
  };

  return (
    <PageCard
      title="仪表盘"
      rightActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={onInit}
        >
          刷新仪表盘
        </Button>
      }
    >
      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        {metrics.map((m, i) => (
          <Col xs={24} sm={12} md={8} lg={4} key={i}>
            <Badge.Ribbon text="实时" color={m.color}>
              <Card hoverable>
                <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                  <Statistic {...m} valueStyle={{ color: m.color }} />
                </Skeleton>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>

      {/* 异常订单提示 */}
      {(failedStat.paperCount > 0 ||
        failedStat.imageCount > 0 ||
        failedStat.turnitinCount > 0) && (
        <Card  size="small"  title="异常订单" style={{ marginTop: 12, padding: 12 }}>
          <Row gutter={[16, 16]}>
            {failedStat.paperCount > 0 && (
              <Col xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  onClick={() => navigate("/scan/crosscheck/abnormal-orders")}
                >
                  <Statistic
                    title="CrossCheck 异常订单"
                    value={failedStat.paperCount}
                    suffix="条"
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
            )}

            {failedStat.imageCount > 0 && (
              <Col xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  onClick={() => navigate("/scan/imagetwin/abnormal-orders")}
                >
                  <Statistic
                    title="imagetwin 异常订单"
                    value={failedStat.imageCount}
                    suffix="条"
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
            )}

            {failedStat.turnitinCount > 0 && (
              <Col xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  onClick={() => navigate("/scan/history/abnormal-orders")}
                >
                  <Statistic
                    title="turnitin 异常订单"
                    value={failedStat.turnitinCount}
                    suffix="条"
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Card>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* 月度订单柱状图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        <Col xs={24} md={12}>
          <Card size="small" title="月订单数">
            <Column {...moonSingleConfig} />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="月营收">
            <Column {...moonAmountConfig} />
          </Card>
        </Col>
      </Row>
    </PageCard>
  );
};

export default DashboardPage;
