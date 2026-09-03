import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Tooltip,
  Tag,
  message,
  Row,
  Col,
  Card,
  Typography,
  theme,
} from "antd";
import {
  ReloadOutlined,
  CheckCircleOutlined,
  PayCircleOutlined,
} from "@ant-design/icons";
import PageCard from "../../../components/PageCard";
import CopyableEllipsisText from "../../../components/CopyableEllipsisText";
import StatRibbonCard, { cardAccent } from "../../../components/StatRibbonCard";
import {
  enterpriseOrders,
  enterpriseStatistics,
} from "../../../server/api";
import dayjs from "dayjs";

const { Text } = Typography;

// 金额：后端单位为分，展示为元
const formatYuan = (cents) => (Number(cents || 0) / 100).toFixed(2);

// 状态：0-待支付 1-已支付 2-已取消
const ORDER_STATUS_MAP = {
  0: { text: "待支付", color: "orange" },
  1: { text: "已支付", color: "green" },
  2: { text: "已取消", color: "default" },
};

export default function PayEnterpriseRechargePage() {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [statLoading, setStatLoading] = useState(false);
  const [statTick, setStatTick] = useState(0);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalPaidAmount: 0,
  });

  const columns = [
    {
      title: "订单号",
      dataIndex: "orderNo",
      width: 240,
      align: "center",
      render: (v) => <CopyableEllipsisText text={v} />,
    },
    {
      title: "企业名称",
      dataIndex: "enterpriseName",
      align: "center",
      ellipsis: true,
    },
    {
      title: "充值金额",
      dataIndex: "amount",
      align: "center",
      render: (val) => (
        <span style={{ fontWeight: 600, color: "#cf1322" }}>
          ￥{formatYuan(val)}
        </span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      align: "center",
      render: (status) => {
        const item =
          ORDER_STATUS_MAP[status] || { text: "未知", color: "default" };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      align: "center",
      render: (time) =>
        time ? dayjs(time).format("YYYY-MM-DD HH:mm") : "---",
    },
    {
      title: "支付时间",
      dataIndex: "payTime",
      align: "center",
      render: (time) =>
        time ? dayjs(time).format("YYYY-MM-DD HH:mm") : "-",
    },
    {
      title: "操作人邮箱",
      dataIndex: "operatorEmail",
      width: 220,
      align: "center",
      render: (v) => <CopyableEllipsisText text={v} />,
    },
    {
      title: "备注",
      dataIndex: "remark",
      align: "center",
      ellipsis: true,
      render: (remark) =>
        remark ? remark : "---",
    },
  ];

  const handleStatistics = async () => {
    try {
      setStatLoading(true);
      const res = await enterpriseStatistics();
      if (res?.code === 200) {
        setStatistics(res.data || {});
        setStatTick((tick) => tick + 1);
      } else {
        message.error(res?.message || "获取统计数据失败！");
      }
    } finally {
      setStatLoading(false);
    }
  };

  const handleList = async (page = pageNum, size = pageSize) => {
    try {
      setLoading(true);
      const res = await enterpriseOrders({ pageNum: page, pageSize: size });
      if (res?.code === 200) {
        setList(res?.data?.records || []);
        setTotal(res?.data?.total || 0);
      } else {
        message.error(res?.message || "获取订单列表失败！");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([handleStatistics(), handleList(pageNum, pageSize)]);
    message.success("数据已刷新");
  };

  useEffect(() => {
    handleStatistics();
  }, []);

  useEffect(() => {
    handleList(pageNum, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize]);

  const cardStyle = {
    borderRadius: 12,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
  };

  const statCards = [
    {
      title: "已支付",
      value: statistics.paidOrders ?? 0,
      suffix: "单",
      decimals: 0,
      icon: <CheckCircleOutlined />,
      ribbonText: "订单",
      ...cardAccent(0),
    },
    {
      title: "累计支付金额",
      value: Number(statistics.totalPaidAmount || 0) / 100,
      prefix: "￥",
      suffix: "元",
      decimals: 2,
      icon: <PayCircleOutlined />,
      ribbonText: "累计",
      ...cardAccent(1),
    },
  ];

  return (
    <PageCard
      title="企业充值"
      rightActions={
        <Tooltip title="刷新数据">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={loading || statLoading}
            onClick={handleRefresh}
          >
            刷新数据
          </Button>
        </Tooltip>
      }
    >
      <div className="mt-2">
        <Row gutter={[16, 16]}>
          {statCards.map((item) => (
            <Col key={item.title} xs={24} sm={12} className="flex">
              <StatRibbonCard
                item={item}
                loading={statLoading && !statTick}
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
                充值订单
              </div>
              <Text type="secondary" className="text-xs font-normal">
                企业账户充值记录
              </Text>
            </div>
          }
          styles={{ body: { padding: "0px" } }}
        >
          <Table
            size="middle"
            rowKey={(record) =>
              record.orderNo || `${record.createTime}-${record.enterpriseName}`
            }
            loading={loading}
            dataSource={list}
            columns={columns}
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
        </Card>
      </div>
    </PageCard>
  );
}
