import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ReloadOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  PayCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import PageCard from "../../../components/PageCard";
import dayjs from "dayjs";
import {
  Button,
  Table,
  DatePicker,
  message,
  Row,
  Col,
  Card,
  Statistic,
  Alert,
  Space,
  Tag,
  Typography,
  Tooltip,
} from "antd";
import {
  statisticsIthenticate,
  statisticsImagetwin,
  statisticsSangerboxScope,
} from "../../../server/api";

const { Text } = Typography;

const formatAmount = (val) =>
  Number(val || 0).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function StatisticsList({ title, props: apiKey }) {
  const [errMsg, setErrMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [list, setList] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const apiMap = {
    imagetwin: statisticsImagetwin,
    ithenticate: statisticsIthenticate,
    sangerboxscope: statisticsSangerboxScope,
  };

  const handleStatisticsList = useCallback(
    async (page = pageNum, size = pageSize) => {
      setLoading(true);
      setErrMsg(null);
      try {
        const params = {
          pageNum: page,
          pageSize: size,
          month: date || undefined,
        };
        const api = apiMap[apiKey];
        if (!api) throw new Error("未匹配到接口");
        const res = await api(params);
        if (res?.code === 200) {
          const { records = [], total: totalCount = 0 } = res.data || {};
          setList(records);
          setTotal(totalCount);
        } else {
          message.error(res?.message || "请联系管理员！");
        }
      } catch (e) {
        console.error(e);
        setErrMsg("数据加载失败，请重试");
      } finally {
        setLoading(false);
      }
    },
    [apiKey, date, pageNum, pageSize]
  );

  const pageSummary = useMemo(() => {
    return {
      totalAmount:list.reduce((acc, item) => acc + Number(item.amount || 0), 0),
      totalOrderCount:list.reduce((acc, item) => acc + Number(item.orderCount || 0), 0),
      totalRefundCount:list.reduce((acc, item) => acc + Number(item.refundCount || 0), 0),
      totalRefundAmount:list.reduce((acc, item) => acc + Number(item.refundAmount || 0), 0),
    }
  }, [list]);

  const columns = [
    {
      title: "日期",
      dataIndex: "date",
      align: "center",
      render: (val) => (
        <Space size={6}>
          <CalendarOutlined style={{ color: "#1677ff" }} />
          <Text>{val || "-"}</Text>
        </Space>
      ),
    },
    {
      title: "订单数量",
      dataIndex: "orderCount",
      align: "center",
      render: (val) => (
        <Tag color="green" style={{ margin: 0 }}>
          {Number(val || 0).toLocaleString("zh-CN")} 单
        </Tag>
      ),
    },
    {
      title: "退款订单数",
      dataIndex: "refundCount",
      align: "center",
      render: (val) => (
        <Tag color="blue" style={{ margin: 0 }}>
          {Number(val || 0).toLocaleString("zh-CN")} 单
        </Tag>
      ),
    },
    {
      title: "退款金额",
      dataIndex: "refundAmount",
      align: "center",
      render: (val) => (
        <Text strong style={{ color: "#cf1322", fontSize: 15 }}>
          ￥{formatAmount(val)}
        </Text>
      ),
    },
    {
      title: "总销售金额",
      dataIndex: "amount",
      align: "center",
      render: (val) => (
        <Text strong style={{ color: "#cf1322", fontSize: 15 }}>
          ￥{formatAmount(val)}
        </Text>
      ),
    },
  ];

  useEffect(() => {
    handleStatisticsList(pageNum, pageSize);
  }, [date, pageNum, pageSize, handleStatisticsList]);

  const statCards = [
    {
      title: "当前服务订单数",
      value: pageSummary.totalOrderCount,
      suffix: "单",
      icon: <ShoppingOutlined />,
      color: "#1677ff",
      bg: "#e6f4ff",
    },
    {
      title: "当前服务销售额",
      value: formatAmount(pageSummary.totalAmount),
      prefix: "￥",
      icon: <PayCircleOutlined />,
      color: "#cf1322",
      bg: "#fff1f0",
    },
    {
      title: "当前服务退款订单数",
      value: pageSummary.totalRefundCount,
      suffix: "单",
      icon: <RollbackOutlined />,
      color: "#1677ff",
      bg: "#e6f4ff",
    },
    {
      title: "当前服务退款金额",
      value: formatAmount(pageSummary.totalRefundAmount),
      prefix: "￥",
      icon: <PayCircleOutlined />,
      color: "#cf1322",
      bg: "#fff1f0",
    },
  ];

  return (
    <PageCard
      title={title}
      extraActions={
        <Space size={8}>
          <Text type="secondary">筛选月份</Text>
          <DatePicker
            picker="month"
            allowClear
            placeholder="全部月份"
            value={date ? dayjs(date, "YYYY-MM") : null}
            onChange={(value) => {
              setDate(value ? value.format("YYYY-MM") : "");
              setPageNum(1);
            }}
          />
          {date && <Tag color="processing">{date}</Tag>}
        </Space>
      }
      rightActions={
        <Tooltip title="刷新数据">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => handleStatisticsList()}
          >
            刷新数据
          </Button>
        </Tooltip>
      }
    >
      {errMsg ? (
        <Alert
          type="error"
          showIcon
          message={errMsg}
          action={
            <Button size="small" onClick={() => handleStatisticsList()}>
              重新加载
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ margin: "12px 0 16px" }}>
            {statCards.map((item) => (
              <Col key={item.title} xs={24} sm={12} lg={6}>
                <Card
                  size="small"
                  styles={{ body: { padding: "16px 20px" } }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center rounded-lg shrink-0"
                      style={{
                        width: 44,
                        height: 44,
                        background: item.bg,
                        color: item.color,
                        fontSize: 20,
                      }}
                    >
                      {item.icon}
                    </div>
                    <Statistic
                      title={item.title}
                      value={item.value ?? 0}
                      suffix={item.suffix}
                      prefix={item.prefix}
                      valueStyle={{
                        color: item.color,
                        fontSize: 22,
                        fontWeight: 600,
                      }}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Table
            rowKey="date"
            size="middle"
            bordered
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{
              current: pageNum,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (page, size) => {
                setPageNum(page);
                setPageSize(size);
              },
            }}
          />
        </>
      )}
    </PageCard>
  );
}
