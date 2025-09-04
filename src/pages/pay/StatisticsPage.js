import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Button, Skeleton, message } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/charts";
import PageCard from "../../components/PageCard";
import { showIwAndIthCountDay, showIwAndIthCountMonth } from "../../server/api";
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orders, setOrders] = useState([]);
  const [monthIncome, setMonthIncome] = useState([]);
  const [dailyIncome, setDailyIncome] = useState([]);
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    fetchMoneyByDay();
    fetchMoneyByMonth();
  };

  const totalMoney = monthIncome.reduce((sum, o) => sum + o.money, 0);

  const typeSummary = orderTypes.map((type) => {
    const typeOrders = orders.filter((o) => o.orderType === type);
    const total = typeOrders.reduce((sum, o) => sum + o.money, 0);
    return { type, total, count: typeOrders.length };
  });

  console.log("typeSummary",typeSummary);

  // 柱状图配置
  const columnConfig = {
    data: monthIncome,
    xField: "money",
    yField: "money",
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
    data: monthIncome.filter((d) => d.money > 0),
    angleField: "money",
    colorField: "type",
    radius: 0.8,
    label: {
      text: "type",
      style: { fontWeight: "bold" },
    },
    interactions: [{ type: "element-active" }],
  };

  const fetchMoneyByMonth = async () => {
    try {
      setErrorMsg("");
      setLoading(true);
      const response = await showIwAndIthCountMonth();
      if (response.code === 200) {
        const iwList = response.data.iw.map( _ => ({..._ , type : "iw"}));
        const ithList = response.data.ith.map( _ => ({..._ , type : "ith"}));
        const list = iwList.concat(ithList);
        setMonthIncome(list);
      } else {
        message.warning(response.msg || "查询月收入错误");
      }
    } catch (error) {
      const errMsg = error?.message || "获取数据失败，请重试";
      setErrorMsg(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoneyByDay = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await showIwAndIthCountDay();
      if (response.code === 200) {
        setDailyIncome(response.data.data);
      } else {
        message.warning(response.msg || "查询日收入错误");
      }
    } catch (error) {
      const errMsg = error?.message || "获取数据失败，请重试";
      setErrorMsg(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageCard
      title="金额统计"
      extraActions={
        <Button type="primary" icon={<ReloadOutlined />} onClick={refreshData}>
          刷新数据
        </Button>
      }
    >
      {errorMsg ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>{errorMsg}</p>
          <Button onClick={refreshData} icon={<ReloadOutlined />}>
            重新加载
          </Button>
        </div>
      ) : (
        <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Card variant="bordered">
                <Statistic
                  title="总金额"
                  value={totalMoney}
                  prefix="¥"
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card variant="bordered">
                <Statistic
                  title="平均金额"
                  prefix="¥"
                  valueStyle={{ color: "#3f8600" }}
                />
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
        </Skeleton>
      )}
    </PageCard>
  );
};

export default StatisticsPage;
