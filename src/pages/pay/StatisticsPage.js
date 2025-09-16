import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Skeleton,
  Segmented,
  message,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Pie, Line } from "@ant-design/charts";
import PageCard from "../../components/PageCard";
import { showIwAndIthCountDay, showIwAndIthCountMonth } from "../../server/api";

// 生成从起始月份到当前月份的所有月份
const generateMonthsRange = (startMonth, currentMonth) => {
  const months = [];
  const start = new Date(startMonth);
  const end = new Date(currentMonth);

  let current = new Date(start);

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    months.push(`${year}-${month}`);

    current.setMonth(current.getMonth() + 1);
  }

  return months;
};

// 补全月份数据，确保每个月份都有记录
const completeMonthData = (originalData, monthsRange) => {
  // 按「月份 + 类型」分组汇总数据
  const dataByMonthAndType = {};
  originalData.forEach((item) => {
    const month = item.date;
    const type = item.type;
    // 初始化层级结构：dataByMonthAndType[月份][类型] = { date, money, type }
    if (!dataByMonthAndType[month]) {
      dataByMonthAndType[month] = {};
    }
    if (!dataByMonthAndType[month][type]) {
      dataByMonthAndType[month][type] = {
        date: month,
        money: 0,
        type: type,
      };
    }
    // 累加同月份、同类型的收入
    dataByMonthAndType[month][type].money += item.money;
  });

  // 获取所有存在的类型（如 "iw"、"ith"）
  const allTypes = [...new Set(originalData.map((item) => item.type))];
  const result = [];

  // 为每个月份、每个类型生成完整数据（无数据则 money 为 0）
  monthsRange.forEach((month) => {
    // 用于计算当月所有类型的总和
    let monthlyTotal = 0;

    allTypes.forEach((type) => {
      let item;
      if (dataByMonthAndType[month] && dataByMonthAndType[month][type]) {
        item = dataByMonthAndType[month][type];
      } else {
        item = {
          date: month,
          money: 0,
          type: type,
        };
      }
      result.push(item);
      // 累加至当月总和
      monthlyTotal += item.money;
    });

    // 添加类型为"all"的记录，金额为该月所有类型的总和
    result.push({
      date: month,
      money: monthlyTotal,
      type: "all",
    });
  });

  return result;
};

const StatisticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orders, setOrders] = useState([]);
  const [chartType, setChartType] = useState("month");
  const [monthIncome, setMonthIncome] = useState([]); // 月收入
  const [dailyIncome, setDailyIncome] = useState([]); // 日收入
  const [completeMonthIncome, setCompleteMonthIncome] = useState([]);

  // 定义月份范围：从2025-07到当前月份
  const startMonth = "2025-07";
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;
  const monthsRange = generateMonthsRange(startMonth, currentMonth);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    // 当原始月份数据变化时，补全所有月份数据
    if (monthIncome.length > 0) {
      setCompleteMonthIncome(completeMonthData(monthIncome, monthsRange));
    }
  }, [monthIncome]);

  const refreshData = () => {
    fetchMoneyByDay();
    fetchMoneyByMonth();
  };

  const totalMoney = monthIncome.reduce((sum, o) => sum + o.money, 0);
  const averageMoney =
  monthIncome.length > 0
      ? (totalMoney / 3 ).toFixed(2)
      : 0;
  // 折线图配置
  const lineConfig = {
    data: completeMonthIncome,
    xField: "date",
    yField: "money",
    colorField: "type",
    seriesField: "type", // 按 type 区分多系列（iw、ith 各一条线）
    point: {
      size: 5,
      shape: "diamond",
      style: {
        fill: "#fff",
        lineWidth: 2,
      },
    },
    label: {
      style: {
        fill: "#aaa",
      },
    },
    xAxis: {
      label: {
        autoRotate: true,
      },
      tickCount: monthsRange.length, // 强制显示所有月份
    },
    yAxis: {
      label: {
        formatter: (value) => `¥${value}`,
      },
      min: 0, // Y轴从0开始，避免趋势失真
    },
  };

  // 饼图配置
  const pieConfig = {
    data: monthIncome,
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
        const iwList = response.data.iw.map((_) => ({
          ..._,
          type: "iw",
          date: _.mouth,
        }));
        const ithList = response.data.ith.map((_) => ({
          ..._,
          type: "ith",
          date: _.mouth,
        }));
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
                  title="至今总收入"
                  value={totalMoney}
                  prefix="¥"
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card variant="bordered">
                <Statistic
                  title="平均月收入"
                  value={averageMoney}
                  prefix="¥"
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 20 }}>
            <Col span={12}>
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      gap: 16,
                    }}
                  >
                    <div>{`金额趋势`}</div>
                    <Segmented
                      options={[
                        {
                          label: "每日收入",
                          value: "day",
                          icon: <SunOutlined />,
                        },
                        {
                          label: "每月收入",
                          value: "month",
                          icon: <MoonOutlined />,
                        },
                      ]}
                      value={chartType} // 绑定当前状态
                      // onChange={(value) => setChartType(value)} // 切换时更新状态
                    />
                  </div>
                }
              >
                <Line {...lineConfig} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="金额占比">
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
