import { useState, useEffect } from "react";
import {
  Button,
  Tooltip,
  Tag,
  Table,
  message,
  Row,
  Col,
  Card,
  Typography,
  theme,
} from "antd";
import {
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  PayCircleOutlined,
} from "@ant-design/icons";
import PageCard from "../components/PageCard";
import StatRibbonCard, { cardAccent } from "../components/StatRibbonCard";
import { usageOverview, summaryByMonth, realTimeSummary } from "../server/api";

const { Text } = Typography;

export default function ModelBillingPage() {
  const { token } = theme.useToken();
  const [list, setList] = useState([]);
  const [allList, setAllList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statTick, setStatTick] = useState(0);
  const [overview, setOverview] = useState({
    totalPromptTokens: null,
    totalCompletionTokens: null,
    totalCost: null,
  });

  const cardStyle = {
    borderRadius: 12,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
  };

  const metrics = [
    {
      title: "总提示 Token",
      value: overview.totalPromptTokens ?? 0,
      suffix: "",
      decimals: 0,
      icon: <FileTextOutlined />,
      ribbonText: "累计",
      ...cardAccent(0),
    },
    {
      title: "总完成 Token",
      value: overview.totalCompletionTokens ?? 0,
      suffix: "",
      decimals: 0,
      icon: <CheckCircleOutlined />,
      ribbonText: "累计",
      ...cardAccent(1),
    },
    {
      title: "总费用",
      value: overview.totalCost ?? 0,
      prefix: "￥",
      suffix: "元",
      decimals: 2,
      icon: <PayCircleOutlined />,
      ribbonText: "累计",
      ...cardAccent(2),
    },
  ];

  const columns = [
    { title: "总提示token数", dataIndex: "totalPromptTokens", align: "center" },
    {
      title: "总完成token数",
      dataIndex: "totalCompletionTokens",
      align: "center",
    },
    {
      title: "总费用",
      dataIndex: "totalCost",
      align: "center",
      render: (value) => (
          <Text strong className="text-[15px] text-red-700">
              ￥{(Number(value || 0) / 100).toFixed(2)}
          </Text>
      ),
    },
    {
      title: "月份",
      dataIndex: "month",
      align: "center",
    },
  ];

  const childColumns = [
    { title: "模型名称", dataIndex: "modelName", align: "center" },
    {
      title: "价格档位",
      dataIndex: "pricingTier",
      align: "center",
      render: (status) => {
        const map = {
          0: { text: "默认档位", color: "default" },
          1: { text: "一级档位", color: "green" },
          2: { text: "二级档位", color: "orange" },
          3: { text: "三级档位", color: "red" },
        };
        const { text, color } = map[status] || {};
        return <Tag color={color}>{text}</Tag>;
      },
    },
    { title: "提示token数", dataIndex: "totalPromptTokens", align: "center" },
    {
      title: "完成token数",
      dataIndex: "totalCompletionTokens",
      align: "center",
    },
    {
      title: "费用",
      dataIndex: "totalCost",
      align: "center",
      render: (value) => (
          <Text strong className="text-[15px] text-red-700">
              ￥{(Number(value || 0) / 100).toFixed(2)}
          </Text>
      ),
    },
    { title: "时间段", dataIndex: "date", align: "center" },
  ];

  const expandedRowRender = (record) => {
    const childData = (record.detailList || []).map((item, index) => ({
      ...item,
      key: `${record.month}-${index}`,
      date: `${item.summaryStartDate} -- ${item.summaryDate}`,
    }));

    return (
      <Table
        size="middle"
        rowKey="key"
        columns={childColumns}
        dataSource={childData}
        pagination={false}
      />
    );
  };

  const handleList = async () => {
    try {
      setLoading(true);

      const [resMonthly, resRealTime] = await Promise.all([
        summaryByMonth(),
        realTimeSummary(),
      ]);

      let monthlyData = [];
      if (resMonthly?.code === 200) {
        monthlyData = resMonthly.data || [];
      } else {
        message.error(resMonthly?.message || "获取月度汇总失败");
        return;
      }

      const realTimeData =
        resRealTime?.code === 200 ? resRealTime.data || [] : [];

      const monthMap = new Map();
      monthlyData.forEach((item) => {
        monthMap.set(item.month, {
          ...item,
          detailList: [...(item.detailList || [])],
        });
      });

      realTimeData.forEach((item) => {
        if (!item.summaryDate) return;
        const month = item.summaryDate.substring(0, 7);

        if (monthMap.has(month)) {
          monthMap.get(month).detailList.push(item);
        } else {
          monthMap.set(month, {
            month,
            detailList: [item],
          });
        }
      });

      const records = Array.from(monthMap.values()).map((item) => {
        const detailList = item.detailList || [];

        const totalPromptTokens = detailList.reduce(
          (sum, d) => sum + (d.totalPromptTokens || 0),
          0
        );

        const totalCompletionTokens = detailList.reduce(
          (sum, d) => sum + (d.totalCompletionTokens || 0),
          0
        );

        const totalCost = parseFloat(
          detailList.reduce((sum, d) => sum + (d.totalCost || 0), 0).toFixed(3)
        );

        return {
          ...item,
          key: item.month,
          totalPromptTokens,
          totalCompletionTokens,
          totalCost,
        };
      });

      setList(records);
      setAllList(records);
    } catch (error) {
      console.error("合并数据失败:", error);
      message.error("获取数据失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleGetUsageOverview = async () => {
    const res = await usageOverview();
    if (res?.code === 200) {
      setOverview(res?.data);
      setStatTick((tick) => tick + 1);
    } else {
      message.error(res?.message || "获取费用使用总览失败，请联系管理员！");
    }
  };

  const handleRefresh = async () => {
    await Promise.all([handleGetUsageOverview(), handleList()]);
    message.success("数据已刷新");
  };

  useEffect(() => {
    handleGetUsageOverview();
    handleList();
  }, []);

  return (
    <PageCard
      title={"模型计费"}
      rightActions={
        <Tooltip title={"刷新数据"}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={handleRefresh}
          >
            刷新数据
          </Button>
        </Tooltip>
      }
    >
      <div className="mt-2">
        <Row gutter={[16, 16]}>
          {metrics.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.title} className="flex">
              <StatRibbonCard
                item={item}
                loading={loading && overview.totalCost == null}
                replayKey={statTick}
                cardStyle={cardStyle}
              />
            </Col>
          ))}
        </Row>

        <Card
          className="mt-4 rounded-xl"
          style={cardStyle}
          title={
            <div>
              <div className="text-base font-semibold text-slate-900">
                月度明细
              </div>
              <Text type="secondary" className="text-xs font-normal">
                按月汇总 Token 用量与费用，展开查看模型明细
              </Text>
            </div>
          }
          styles={{ body: { padding: "0px" } }}
        >
          <Table
            size="middle"
            rowKey="key"
            columns={columns}
            expandable={{ expandedRowRender, defaultExpandedRowKeys: ["0"] }}
            dataSource={allList}
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
            }}
          />
        </Card>
      </div>
    </PageCard>
  );
}
