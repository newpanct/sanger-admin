import { Button, Tooltip, Tag, Table, message, Row, Col, Card } from "antd";
import PageCard from "../components/PageCard";
import { ReloadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { usageOverview, usageSummaryPage } from "../server/api";
export default function ModelBillingPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [overview, setOverview] = useState({
    totalPromptTokens: null, //总提示token数

    totalCompletionTokens: null, //总完成token数

    totalCost: null, //总费用
  });
  const columns = [
    { title: "调用方", dataIndex: "caller", align: "center" },
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
    { title: "总提示token数", dataIndex: "totalPromptTokens", align: "center" },
    {
      title: "总完成token数",
      dataIndex: "totalCompletionTokens",
      align: "center",
    },
    { title: "总费用", dataIndex: "totalCost", align: "center",
    render:(totalCost)=>{
        return <Tag>{totalCost} 元</Tag>;
    }    
},
    { title: "汇总日期", dataIndex: "summaryDate", align: "center" },
    { title: "创建时间", dataIndex: "createTime", align: "center" },
  ];
  const handleList = async (pageNum, pageSize) => {
    try {
      setLoading(true);
      const obj = {
        pageNum,
        pageSize,
      };
      const res = await usageSummaryPage(obj);
      if (res?.code === 200) {
        setList(res?.data?.records || []);
        setTotal(res?.data.total || 0);
      } else {
        message.error(
          res?.message || `获取模型计费数据列表失败，请联系管理员！`
        );
      }
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
      handleList(pageNum, pageSize),
    ]);
    message.success("数据已刷新");
  };

  useEffect(() => {
    handleGetUsageOverview();
  }, []);

  useEffect(() => {
    handleList(pageNum, pageSize);
  }, [pageNum, pageSize]);
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
                    : "-"}元
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={list}
        columns={columns}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size);
          },
        }}
      />
    </PageCard>
  );
}
