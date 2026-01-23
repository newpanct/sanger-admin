import { Button, Tooltip, Tag, Table, message, Row, Col, Card } from "antd";
import PageCard from "../components/PageCard";
import { ReloadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { usageOverview, summaryByMonth, realTimeSummary } from "../server/api";
export default function ModelBillingPage() {
  const [list, setList] = useState([]);
  const [allList, setAllList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState({
    totalPromptTokens: null, //总提示token数
    totalCompletionTokens: null, //总完成token数
    totalCost: null, //总费用
  });
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
      render: (totalCost) => {
        return <Tag>{totalCost} 元</Tag>;
      },
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
      render: (totalCost) => {
        return <Tag>{totalCost} 元</Tag>;
      },
    },
    { title: "时间段", dataIndex: "date", align: "center" },
  ];
  const expandedRowRender = (record) => {
    // 从当前行 record 中取 detailList
    const childData = (record.detailList || []).map((item, index) => ({
      ...item,
      key: `${record.month}-${index}`, // 础保子表 key 唯一
      date: `${item.summaryStartDate} -- ${item.summaryDate}` // 生成“时间段”
    }));
  
    return (
      <Table
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
  
      // 并行请求两个接口
      const [resMonthly, resRealTime] = await Promise.all([
        summaryByMonth(),
        realTimeSummary()
      ]);
  
      // 处理月度分组数据
      let monthlyData = [];
      if (resMonthly?.code === 200) {
        monthlyData = resMonthly.data || [];
      } else {
        message.error(resMonthly?.message || '获取月度汇总失败');
        return;
      }
  
      // 处理实时扁平数据
      const realTimeData = resRealTime?.code === 200 ? resRealTime.data || [] : [];
  
      // 将 monthlyData 转为 Map，便于按 month 查找
      const monthMap = new Map();
      monthlyData.forEach(item => {
        monthMap.set(item.month, { ...item, detailList: [...(item.detailList || [])] });
      });
  
      // 遍历实时数据，按 summaryDate 归类到对应月份
      realTimeData.forEach(item => {
        if (!item.summaryDate) return;
        const month = item.summaryDate.substring(0, 7); // "2026-01"
  
        if (monthMap.has(month)) {
          // 已存在该月，追加到 detailList
          monthMap.get(month).detailList.push(item);
        } else {
          // 不存在，新建分组
          monthMap.set(month, {
            month,
            detailList: [item]
          });
        }
      });
  
      // 转回数组，并计算汇总字段
      const records = Array.from(monthMap.values()).map(item => {
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
  
      // 设置状态
      setList(records);      // 如果 list 用于其他地方，也可设为 records
      setAllList(records);   // 主表数据
  
    } catch (error) {
      console.error('合并数据失败:', error);
      message.error('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGetUsageOverview = async () => {
    const res = await usageOverview();
    if (res?.code === 200) {
      setOverview(res?.data);
    } else {
      message.error(res?.message || "获取费用使用总览失败，请联系管理员！");
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      handleGetUsageOverview(),
      handleList(),
    ]);
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
      <Row gutter={16} className="my-3">
        <Col span={8}>
          <Card>
            <Card.Meta
              title="总提示 Token"
              description={
                <span style={{ fontSize: 20, fontWeight: 600 }}>
                  {overview.totalPromptTokens?.toLocaleString() ?? "-"}
                </span>
              }
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Card.Meta
              title="总完成 Token"
              description={
                <span style={{ fontSize: 20, fontWeight: 600 }}>
                  {overview.totalCompletionTokens?.toLocaleString() ?? "-"}
                </span>
              }
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Card.Meta
              title="总费用（¥）"
              description={
                <span
                  style={{ fontSize: 20, fontWeight: 600, color: "#cf1322" }}
                >
                  {overview.totalCost != null
                    ? overview.totalCost.toFixed(2)
                    : "-"}
                  元
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      <Table
        rowKey="key"
        columns={columns}
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ["0"] }}
        dataSource={allList}
      />
    </PageCard>
  );
}
