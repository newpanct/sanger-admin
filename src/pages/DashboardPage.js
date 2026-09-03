import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { statDashboard, statMoon, noticeGetLatestActive } from "../server/api";
import { Column } from "@ant-design/charts";
import {
  Badge,
  Card,
  Col,
  Row,
  Button,
  Empty,
  Flex,
  Typography,
  theme,
  Tag,
} from "antd";
import {
  ReloadOutlined,
  FileTextOutlined,
  PayCircleOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingCartOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import PageCard from "../components/PageCard";
import NoticeBannerPreview, {
  PREVIEW_SERVICE_NAME,
} from "../components/NoticeBannerPreview";
import { useNavigate } from "react-router-dom";
import StatRibbonCard, {
  StatCountUp,
  cardAccent,
} from "../components/StatRibbonCard";
const { Text } = Typography;

const getMonthGrowth = (list, field) => {
  const sorted = [...(list || [])].sort((a, b) =>
    String(a.month).localeCompare(String(b.month))
  );
  if (sorted.length < 2) return null;
  const prev = Number(sorted[sorted.length - 2]?.[field]) || 0;
  const curr = Number(sorted[sorted.length - 1]?.[field]) || 0;
  if (prev === 0 && curr === 0) {
    return { type: "flat", text: "持平" };
  }
  if (prev === 0) {
    return { type: "up", text: "较上月新增" };
  }
  const pct = ((curr - prev) / prev) * 100;
  if (Math.abs(pct) < 0.05) {
    return { type: "flat", text: "持平" };
  }
  const abs = Math.abs(pct).toFixed(1);
  return {
    type: pct > 0 ? "up" : "down",
    text: `较上月 ${pct > 0 ? "+" : "-"}${abs}%`,
  };
};

const findNoticePath = (menus = [], parentPath = "") => {
  for (const item of menus) {
    const fullPath = parentPath
      ? `${parentPath}/${item.path}`.replace(/\/+/g, "/")
      : `/${item.path}`;
    if (item.component === "NoticePage") return fullPath;
    if (item.children?.length) {
      const nested = findNoticePath(item.children, fullPath);
      if (nested) return nested;
    }
  }
  return null;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const [loading, setLoading] = useState(false);

  const badgeMap = useSelector((state) => state.menuBadge.badges);
  const authMenus = useSelector((state) => state.auth.menus);
  const noticePath = findNoticePath(authMenus);

  const [statistics, setStatistics] = useState({
    todaySingle: 0,
    todayMoney: 0,
    monthSingle: 0,
    monthMoney: 0,
    totalSingle: 0,
    totalMoney: 0,
  });

  const [statMoonOrder, setStatMoonOrder] = useState([]);
  const [latestActive, setLatestActive] = useState(null);
  const [statTick, setStatTick] = useState(0);

  const failedStat = {
    paperCount: badgeMap["/scan/crosscheck/abnormal-orders"] || 0,
    imageCount: badgeMap["/scan/imagetwin/abnormal-orders"] || 0,
    turnitinCount: badgeMap["/scan/history/abnormal-orders"] || 0,
    dupliseeCount: badgeMap["/scan/duplisee/abnormal-orders"] || 0,
  };

  useEffect(() => {
    onInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatOrder = async () => {
    try {
      setLoading(true);
      const response = await statDashboard();
      if (response.code === 200) {
        setStatistics(response.data);
        setStatTick((tick) => tick + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatMoon = async () => {
    try {
      setLoading(true);
      const response = await statMoon();
      if (response.code === 200) {
        setStatMoonOrder(response.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLatestBanner = async () => {
    try {
      const response = await noticeGetLatestActive(PREVIEW_SERVICE_NAME);
      if (response?.code === 200) {
        setLatestActive(response.data || null);
      } else {
        setLatestActive(null);
      }
    } catch (error) {
      console.error(error);
      setLatestActive(null);
    }
  };

  const onInit = () => {
    handleStatOrder();
    handleStatMoon();
    handleLatestBanner();
  };

  const monthSingleGrowth = useMemo(
    () => getMonthGrowth(statMoonOrder, "single"),
    [statMoonOrder]
  );
  const monthMoneyGrowth = useMemo(
    () => getMonthGrowth(statMoonOrder, "amount"),
    [statMoonOrder]
  );

  const metrics = [
    {
      title: "今日单数",
      value: statistics.todaySingle ?? 0,
      suffix: "单",
      decimals: 0,
      icon: <FileTextOutlined />,
      ribbonText: "今日",
      ...cardAccent(0),
    },
    {
      title: "今日营收",
      value: statistics.todayMoney ?? 0,
      suffix: "元",
      decimals: 2,
      icon: <PayCircleOutlined />,
      ribbonText: "今日",
      ...cardAccent(1),
    },
    {
      title: "本月单数",
      value: statistics.monthSingle ?? 0,
      suffix: "单",
      decimals: 0,
      icon: <ShoppingCartOutlined />,
      ribbonText: "本月",
      growth: monthSingleGrowth,
      ...cardAccent(2),
    },
    {
      title: "本月营收",
      value: statistics.monthMoney ?? 0,
      suffix: "元",
      decimals: 2,
      icon: <PayCircleOutlined />,
      ribbonText: "本月",
      growth: monthMoneyGrowth,
      ...cardAccent(3),
    },
  ];

  const abnormalItems = [
    {
      title: "CrossCheck",
      count: failedStat.paperCount,
      path: "/scan/crosscheck/abnormal-orders",
    },
    {
      title: "ImageTwin",
      count: failedStat.imageCount,
      path: "/scan/imagetwin/abnormal-orders",
    },
    {
      title: "Turnitin",
      count: failedStat.turnitinCount,
      path: "/scan/history/abnormal-orders",
    },
    {
      title: "SangerboxScope",
      count: failedStat.dupliseeCount,
      path: "/scan/duplisee/abnormal-orders",
    },
  ].filter((item) => item.count > 0);

  const cardStyle = {
    borderRadius: 12,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
  };

  const labelStyle = {
    fill: "#0F172A",
    fontSize: 12,
    fontWeight: 600,
  };

  const chartBase = {
    height: 280,
    autoFit: true,
    legend: false,
    appendPadding: [32, 8, 8, 8],
    style: {
      fill: token.colorPrimary,
      radiusTopLeft: 6,
      radiusTopRight: 6,
    },
  };

  const moonSingleConfig = {
    ...chartBase,
    data: statMoonOrder || [],
    xField: "month",
    yField: "single",
    tooltip: {
      title: (d) => d?.month ?? "",
      items: [
        {
          channel: "y",
          name: "订单数",
          valueFormatter: (value) => `${Number(value ?? 0).toLocaleString()} 单`,
        },
      ],
    },
    label: {
      position: "top",
      offset: 8,
      style: labelStyle,
    },
    xAxis: {
      label: { style: { fill: "#94A3B8" } },
      line: { style: { stroke: "#E2E8F0" } },
    },
    yAxis: {
      title: { text: "订单数（单）", style: { fill: "#64748B" } },
      grid: {
        line: { style: { stroke: "#F1F5F9", lineDash: [4, 4] } },
      },
    },
  };

  const moonAmountConfig = {
    ...chartBase,
    data: statMoonOrder || [],
    xField: "month",
    yField: "amount",
    tooltip: {
      title: (d) => d?.month ?? "",
      items: [
        {
          channel: "y",
          name: "营收",
          valueFormatter: (value) =>
            `￥${Number(value ?? 0).toLocaleString("zh-CN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
        },
      ],
    },
    label: {
      position: "top",
      offset: 8,
      formatter: (v) =>
        `￥${Number(v ?? 0).toLocaleString("zh-CN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      style: labelStyle,
    },
    xAxis: {
      label: { style: { fill: "#94A3B8" } },
      line: { style: { stroke: "#E2E8F0" } },
    },
    yAxis: {
      title: { text: "营收", style: { fill: "#64748B" } },
      grid: {
        line: { style: { stroke: "#F1F5F9", lineDash: [4, 4] } },
      },
    },
  };

  const renderChart = (chartConfig) => {
    if (!statMoonOrder?.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无月度数据"
          className="py-[70px]"
        />
      );
    }
    return (
      <Column
        key={`${chartConfig.yField}-${token.colorPrimary}`}
        {...chartConfig}
      />
    );
  };

  const renderGrowth = (growth) => {
    const rowClass = "mt-1 min-h-5 text-xs leading-5";
    if (growth === undefined) {
      return <div className={`${rowClass} invisible`}>--</div>;
    }
    if (!growth) {
      return <div className={`${rowClass} text-slate-400`}>--</div>;
    }
    const colorClass = {
      up: "text-emerald-500",
      down: "text-red-500",
      flat: "text-slate-500",
    }[growth.type];
    const Icon =
      growth.type === "up"
        ? ArrowUpOutlined
        : growth.type === "down"
          ? ArrowDownOutlined
          : MinusOutlined;
    return (
      <div className={`${rowClass} ${colorClass}`}>
        <Icon className="mr-1" />
        {growth.text}
      </div>
    );
  };

  const renderTotalCard = ({
    title,
    value,
    prefix,
    suffix,
    decimals,
    icon,
    iconBg,
    iconColor,
    ribbonColor,
  }) => (
    <Badge.Ribbon text="累计" color={ribbonColor}>
      <Card className="rounded-xl" style={cardStyle} styles={{ body: { padding: 20 } }}>
        <Flex justify="space-between" align="center">
          <div>
            <Text type="secondary" className="text-[13px]">
              {title}
            </Text>
            <div className="mt-1.5 text-[28px] font-semibold text-slate-900">
              <StatCountUp
                value={value}
                prefix={prefix}
                decimals={decimals}
                replayKey={statTick}
              />
              {suffix ? (
                <span className="ml-1 text-sm font-normal text-slate-500">{suffix}</span>
              ) : null}
            </div>
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[22px]"
            style={{ background: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        </Flex>
      </Card>
    </Badge.Ribbon>
  );

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
          刷新
        </Button>
      }
    >
      <div className="mt-2">
        <Row gutter={[16, 16]}>
          {metrics.map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title} className="flex">
              <StatRibbonCard
                item={item}
                loading={loading}
                replayKey={statTick}
                cardStyle={cardStyle}
                extra={renderGrowth(item.growth)}
              />
            </Col>
          ))}
        </Row>

        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                {renderTotalCard({
                  title: "累计订单",
                  value: statistics.totalSingle ?? 0,
                  suffix: "单",
                  decimals: 0,
                  icon: <FileTextOutlined />,
                  ...cardAccent(4),
                })}
              </Col>
              <Col xs={24} sm={12}>
                {renderTotalCard({
                  title: "累计营收",
                  value: statistics.totalMoney ?? 0,
                  prefix: "￥",
                  icon: <PayCircleOutlined />,
                  ...cardAccent(5),
                })}
              </Col>
            </Row>

            <Card
              className="rounded-xl"
              style={cardStyle}
              title="最新公告"
              extra={
                <Flex align="center" gap={12}>
                  <Text type="secondary" className="text-xs">
                    {PREVIEW_SERVICE_NAME} → scholar.sangerbox.com
                  </Text>
                  {noticePath ? (
                    <Typography.Link
                      onClick={() => navigate(noticePath)}
                      style={{ color: token.colorPrimary }}
                    >
                      公告管理
                    </Typography.Link>
                  ) : null}
                </Flex>
              }
              styles={{ body: { padding: 16 } }}
            >
              {latestActive ? (
                <NoticeBannerPreview data={latestActive} />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={`${PREVIEW_SERVICE_NAME} 暂无激活中的公告横幅`}
                />
              )}
            </Card>

            <Card
              className="rounded-xl"
              style={cardStyle}
              title={
                <div>
                  <div className="text-base font-semibold text-slate-900">月订单数</div>
                  <Text type="secondary" className="text-xs font-normal">
                    近月订单量趋势
                  </Text>
                </div>
              }
              styles={{ body: { padding: "0px" } }}
            >
              <div className="w-full min-w-0">{renderChart(moonSingleConfig)}</div>
            </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <Card
              className="rounded-xl"
              style={cardStyle}
              styles={{ body: { padding: 20 } }}
              title={
                <Flex align="center" gap={8}>
                  <WarningOutlined className="text-red-500" />
                  <span>异常订单</span>
                </Flex>
              }
              extra={
                <Text type="secondary" className="text-xs">
                  点击卡片前往处理
                </Text>
              }
            >
              {abnormalItems.length > 0 ? (
                <Row gutter={[12, 12]}>
                  {abnormalItems.map((item) => (
                    <Col xs={24} sm={12} key={item.path}>
                      <Card
                        hoverable
                        onClick={() => navigate(item.path)}
                        className="cursor-pointer rounded-[10px] border-red-200 bg-red-50"
                        styles={{ body: { padding: "14px 16px" } }}
                      >
                        <Flex justify="space-between" align="center">
                          <div>
                            <Text type="secondary" className="text-[13px]">
                              {item.title}
                            </Text>
                            <div className="mt-1 text-2xl font-semibold text-red-500">
                              {item.count}
                              <span className="ml-1 text-[13px] font-normal">条</span>
                            </div>
                          </div>
                          <Tag color="error" className="m-0 rounded-md">
                            待处理
                          </Tag>
                        </Flex>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无异常订单"
                  className="py-6"
                />
              )}
            </Card>
            <Card
              className="rounded-xl"
              style={cardStyle}
              title={
                <div>
                  <div className="text-base font-semibold text-slate-900">月营收</div>
                  <Text type="secondary" className="text-xs font-normal">
                    近月营收金额趋势
                  </Text>
                </div>
              }
              styles={{ body: { padding: "0px" } }}
            >
              <div className="w-full min-w-0">{renderChart(moonAmountConfig)}</div>
            </Card>
          </div>
        </div>
      </div>
    </PageCard>
  );
};

export default DashboardPage;
