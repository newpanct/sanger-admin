import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ReloadOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  PayCircleOutlined,
  RollbackOutlined,
  WalletOutlined,
  AccountBookOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import CopyableEllipsisText from "../../../components/CopyableEllipsisText";
import PageCard from "../../../components/PageCard";
import StatRibbonCard, { cardAccent } from "../../../components/StatRibbonCard";
import dayjs from "dayjs";
import {
  Button,
  Table,
  DatePicker,
  message,
  Row,
  Col,
  Card,
  Alert,
  Space,
  Tag,
  Typography,
  Tooltip,
  theme,
} from "antd";
import {
  statisticsIthenticate,
  statisticsImagetwin,
  statisticsSangerboxScope,
  refundImageTwin,
  refundIthenticate,
  refundDuplisee,
} from "../../../server/api";

const { Text } = Typography;

const formatAmount = (val) =>
  Number(val || 0).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const displayValue = (val) =>
  val === null || val === undefined || val === "" ? "--" : val;

const toMonth = (date) => {
  if (!date) return "";
  const value = String(date);
  return value.length >= 7 ? value.slice(0, 7) : value;
};

const PAY_STATUS_MAP = {
  1: { text: "成功", color: "success" },
  0: { text: "失败", color: "error" },
};

const REFUND_STATUS_MAP = {
  0: { text: "未退款", color: "default" },
  1: { text: "已退款", color: "green" },
  2: { text: "退款失败", color: "error" },
};

const getTaskStatusMeta = (status, apiKey) => {
  const map = {
    1: { text: "已付款", color: "blue" },
    2: { text: "成功", color: "success" },
    3: { text: "失败", color: "error" },
    4: { text: "等待中", color: "warning" },
    5:
      apiKey === "ithenticate"
        ? { text: "已退款", color: "orange" }
        : { text: "重新提交", color: "default" },
    6: { text: "已退款", color: "orange" },
  };
  return map[status] || null;
};

const statisticsApiMap = {
  imagetwin: statisticsImagetwin,
  ithenticate: statisticsIthenticate,
  sangerboxscope: statisticsSangerboxScope,
};

const refundApiMap = {
  imagetwin: refundImageTwin,
  ithenticate: refundIthenticate,
  sangerboxscope: refundDuplisee,
};

const ORDER_PAGE_MAP = {
  imagetwin: "ImagetwinOrderPage",
  ithenticate: "CrossCheckOrderPage",
  sangerboxscope: "DupliSeePage",
};

const REFUND_PAGE_MAP = {
  imagetwin: "ImagetwinRefundedOrderPage",
  ithenticate: "CrossCheckRefundedOrderPage",
  sangerboxscope: "DupliSeeRefundedOrderPage",
};

const findMenuPath = (menus = [], component, parentPath = "") => {
  for (const item of menus) {
    const fullPath = parentPath
      ? `${parentPath}/${item.path}`.replace(/\/+/g, "/")
      : `/${item.path}`;
    if (item.component === component) return fullPath;
    if (item.children?.length) {
      const nested = findMenuPath(item.children, component, fullPath);
      if (nested) return nested;
    }
  }
  return null;
};

export default function StatisticsList({ title, props: apiKey }) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const authMenus = useSelector((state) => state.auth.menus);
  const [errMsg, setErrMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statTick, setStatTick] = useState(0);
  const [date, setDate] = useState("");
  const [list, setList] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [totalRefundCount, setTotalRefundCount] = useState(0);
  const [totalRefundAmount, setTotalRefundAmount] = useState(0);
  const [pendingRefundAmount, setPendingRefundAmount] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [refundCache, setRefundCache] = useState({});
  const refundFetchedRef = useRef({});

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
        const api = statisticsApiMap[apiKey];
        if (!api) throw new Error("未匹配到接口");
        const res = await api(params);
        if (res?.code === 200) {
          const {
            records = [],
            total: totalCount = 0,
            totalAmount: amount = 0,
            totalOrderCount: orderCount = 0,
            totalRefundCount: refundCount = 0,
            totalRefundAmount: refundAmount = 0,
            pendingRefundAmount: pending = 0,
            netIncome: income = 0,
          } = res.data || {};
          setList(records);
          setTotal(totalCount);
          setTotalAmount(Number(amount) || 0);
          setTotalOrderCount(Number(orderCount) || 0);
          setTotalRefundCount(Number(refundCount) || 0);
          setTotalRefundAmount(Number(refundAmount) || 0);
          setPendingRefundAmount(Number(pending) || 0);
          setNetIncome(Number(income) || 0);
          setStatTick((tick) => tick + 1);
          setRefundCache({});
          setExpandedRowKeys([]);
          refundFetchedRef.current = {};
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

  const loadRefundOrders = async (record) => {
    const month = toMonth(record?.date);
    if (!month || refundFetchedRef.current[month]) return;
    refundFetchedRef.current[month] = true;

    setRefundCache((prev) => ({
      ...prev,
      [month]: { loading: true, loaded: false, list: [] },
    }));

    const api = refundApiMap[apiKey];
    if (!api) {
      setRefundCache((prev) => ({
        ...prev,
        [month]: { loading: false, loaded: true, list: [] },
      }));
      return;
    }

    const res = await api(month);
    if (res?.code === 200) {
      setRefundCache((prev) => ({
        ...prev,
        [month]: { loading: false, loaded: true, list: res?.data || [] },
      }));
    } else {
      message.error(res?.message || "获取退款订单失败");
      refundFetchedRef.current[month] = false;
      setRefundCache((prev) => ({
        ...prev,
        [month]: { loading: false, loaded: false, list: [] },
      }));
    }
  };

  const handleExpand = (expanded, record) => {
    const key = record.date;
    setExpandedRowKeys((prev) =>
      expanded ? [...new Set([...prev, key])] : prev.filter((item) => item !== key)
    );
    if (expanded) loadRefundOrders(record);
  };

  const pageSummary = useMemo(() => {
    return {
      totalAmount,
      totalOrderCount,
      totalRefundCount,
      totalRefundAmount,
      pendingRefundAmount,
      netIncome,
    };
  }, [
    totalAmount,
    totalOrderCount,
    totalRefundCount,
    totalRefundAmount,
    pendingRefundAmount,
    netIncome,
  ]);

  const columns = [
    {
      title: "日期",
      dataIndex: "date",
      align: "center",
      render: (val) => (
        <Space size={6}>
          <CalendarOutlined style={{ color: token.colorPrimary }} />
          <Text>{val || "-"}</Text>
        </Space>
      ),
    },
    {
      title: "订单数量",
      dataIndex: "orderCount",
      align: "center",
      render: (val) => (
        <Tag variant="filled" color="success">
          {Number(val || 0).toLocaleString("zh-CN")} 单
        </Tag>
      ),
    },
    {
      title: "退款订单数",
      dataIndex: "refundCount",
      align: "center",
      render: (val) => (
        <Tag variant="filled" color="error">
          {Number(val || 0).toLocaleString("zh-CN")} 单
        </Tag>
      ),
    },
    {
      title: "未退款订单数",
      dataIndex: "unrefundCount",
      align: "center",
      render: (val) => (
          <Tag variant="filled" color="warning">
          {Number(val || 0).toLocaleString("zh-CN")} 单
        </Tag>
      ),
    },
    {
      title: "退款金额",
      dataIndex: "refundAmount",
      align: "center",
      render: (val) => (
        <Text strong className="text-[15px] text-red-700">
          ￥{formatAmount(val)}
        </Text>
      ),
    },
    {
      title: "总销售金额",
      dataIndex: "amount",
      align: "center",
      render: (val) => (
        <Text strong className="text-[15px] text-red-700">
          ￥{formatAmount(val)}
        </Text>
      ),
    },
  ];

  useEffect(() => {
    handleStatisticsList(pageNum, pageSize);
  }, [date, pageNum, pageSize, handleStatisticsList]);

  const cardStyle = {
    borderRadius: 12,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
  };

  const orderPath = findMenuPath(authMenus, ORDER_PAGE_MAP[apiKey]);
  const refundPath = findMenuPath(authMenus, REFUND_PAGE_MAP[apiKey]);

  const statCards = [
    {
      title: "当前服务订单数",
      value: pageSummary.totalOrderCount,
      suffix: "单",
      decimals: 0,
      icon: <ShoppingOutlined />,
      ribbonText: "订单",
      tooltip: orderPath ? "点击查看该服务的订单" : undefined,
      hint: orderPath ? "点击查看订单" : undefined,
      onClick: orderPath ? () => navigate(orderPath) : undefined,
      ...cardAccent(0),
    },
    {
      title: "当前服务销售额",
      value: pageSummary.totalAmount,
      prefix: "￥",
      suffix: "元",
      decimals: 2,
      icon: <PayCircleOutlined />,
      ribbonText: "销售",
      ...cardAccent(1),
    },
    {
      title: "当前服务退款订单数",
      value: pageSummary.totalRefundCount,
      suffix: "单",
      decimals: 0,
      icon: <RollbackOutlined />,
      ribbonText: "退款",
      tooltip: refundPath ? "点击查看该服务的退款订单" : undefined,
      hint: refundPath ? "点击查看退款订单" : undefined,
      onClick: refundPath ? () => navigate(refundPath) : undefined,
      ...cardAccent(2),
    },
    {
      title: "当前服务退款金额",
      value: pageSummary.totalRefundAmount,
      prefix: "￥",
      suffix: "元",
      decimals: 2,
      icon: <PayCircleOutlined />,
      ribbonText: "退款",
      ...cardAccent(3),
    },
    {
      title: "当前服务待退款金额",
      value: pageSummary.pendingRefundAmount,
      prefix: "￥",
      suffix: "元",
      decimals: 2,
      icon: <WalletOutlined />,
      ribbonText: "待退",
      ...cardAccent(4),
    },
    {
      title: "当前服务净收入",
      value: pageSummary.netIncome,
      prefix: "￥",
      suffix: "元",
      decimals: 2,
      icon: <AccountBookOutlined />,
      ribbonText: "净收",
      ...cardAccent(5),
    },
  ];

  const childColumns = [
    {
      title: "标题",
      dataIndex: "title",
      align: "center",
      ellipsis: true,
      render: displayValue,
    },
    {
      title: "订单号",
      dataIndex: "orderNo",
      align: "center",
      render: (orderNo) =>
        orderNo ? <CopyableEllipsisText text={orderNo} /> : "--",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      align: "center",
      render: (email) => (email ? <CopyableEllipsisText text={email} /> : "--"),
    },
    {
      title: "任务状态",
      dataIndex: "status",
      align: "center",
      render: (status) => {
        const meta = getTaskStatusMeta(status, apiKey);
        return meta ? <Tag color={meta.color}>{meta.text}</Tag> : "--";
      },
    },
    {
      title: "支付状态",
      dataIndex: "payStatus",
      align: "center",
      render: (status) => {
        if (status === null || status === undefined || status === "") return "--";
        const meta = PAY_STATUS_MAP[status];
        return meta ? <Tag color={meta.color}>{meta.text}</Tag> : displayValue(status);
      },
    },
    {
      title: "退款状态",
      dataIndex: "refundStatus",
      align: "center",
      render: (status) => {
        if (status === null || status === undefined || status === "") return "--";
        const meta = REFUND_STATUS_MAP[status];
        return meta ? <Tag color={meta.color}>{meta.text}</Tag> : displayValue(status);
      },
    },
    {
      title: "备注",
      dataIndex: "remark",
      align: "center",
      render: displayValue,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      align: "center",
      render: displayValue,
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      align: "center",
      render: displayValue,
    },
  ];

  const expandedRowRender = (record) => {
    const month = toMonth(record?.date);
    const cache = refundCache[month] || { loading: false, list: [] };
    return (
      <Table
        size="middle"
        rowKey="id"
        loading={cache.loading}
        columns={childColumns}
        dataSource={cache.list}
        pagination={false}
      />
    );
  };

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
          <div className="mt-2">
            <Row gutter={[16, 16]}>
              {statCards.map((item) => (
                <Col
                  key={item.title}
                  xs={24}
                  sm={12}
                  lg={8}
                  xxl={4}
                  className="flex"
                >
                  <Tooltip title={item.tooltip}>
                    <div className="h-full w-full">
                      <StatRibbonCard
                        item={item}
                        loading={loading}
                        replayKey={statTick}
                        cardStyle={cardStyle}
                        onClick={item.onClick}
                        extra={
                          <div className="mt-1 h-4 leading-4">
                            {item.hint ? (
                              <Text
                                type="secondary"
                                className="inline-flex items-center gap-1 text-xs underline whitespace-nowrap"
                              >
                                <LinkOutlined />
                                {item.hint}
                              </Text>
                            ) : null}
                          </div>
                        }
                      />
                    </div>
                  </Tooltip>
                </Col>
              ))}
            </Row>

            <Card
              className="mt-4 rounded-xl"
              style={cardStyle}
              title={
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    金额明细
                  </div>
                  <Text type="secondary" className="text-xs font-normal">
                    按日汇总订单与退款，展开查看当前月份退款订单
                  </Text>
                </div>
              }
              styles={{ body: { padding: "0px" } }}
            >
              <Table
                rowKey="date"
                size="middle"
                loading={loading}
                columns={columns}
                dataSource={list}
                expandable={{
                  expandedRowKeys,
                  onExpand: handleExpand,
                  expandedRowRender,
                }}
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
        </>
      )}
    </PageCard>
  );
}
