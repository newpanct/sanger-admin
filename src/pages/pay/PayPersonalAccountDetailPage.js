import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageCard from "../../components/PageCard";
import SearchInput from "../../components/SearchInput";
import {
    Button,
    DatePicker,
    Empty,
    Modal,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from "antd";
import { ReloadOutlined, SearchOutlined, FileSearchOutlined, PictureOutlined, ThunderboltOutlined, LinkOutlined } from "@ant-design/icons";
import {
    invoiceMark,
    invoicePage,
    personalAccount,
} from "../../server/api";
import dayjs from "dayjs";

const { Text } = Typography;

const SERVICE_TYPE_MAP = {
    imagetwin: {
        label: "Imagetwin",
        color: "purple",
        icon: <PictureOutlined />,
    },
    ithenticate: {
        label: "CrossCheck",
        color: "blue",
        icon: <FileSearchOutlined />,
    },
    sangerboxscope: {
        label: "SangerboxScope",
        color: "cyan",
        icon: <ThunderboltOutlined />,
    },
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

const formatYuan = (val) =>
    Number(val || 0).toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const displayValue = (val) =>
    val === null || val === undefined || val === "" ? "--" : val;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toMonth = (date) => {
    if (!date) return "";
    const value = String(date);
    return value.length >= 7 ? value.slice(0, 7) : value;
};

function InvoiceOrderPanel({
    email,
    type,
    refreshKey,
    onParentRefresh,
}) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const typeMeta = SERVICE_TYPE_MAP[type];
    const typeLabel = typeMeta?.label || type || "--";
    const typeTag = typeMeta ? (
        <Tag color={typeMeta.color} icon={typeMeta.icon}>
            {typeMeta.label}
        </Tag>
    ) : (
        typeLabel
    );

    const loadList = useCallback(
        async (page = pageNum, size = pageSize) => {
            if (!email || !type) return;
            try {
                setLoading(true);
                const res = await invoicePage({
                    pageNum: page,
                    pageSize: size,
                    type,
                    email,
                    ...(startDate ? { startDate } : {}),
                    ...(endDate ? { endDate } : {}),
                });
                if (res?.code === 200) {
                    const data = res.data || {};
                    setList(data.records || []);
                    setTotal(data.total || 0);
                } else {
                    message.error(res?.message || "查询发票订单失败");
                }
            } finally {
                setLoading(false);
            }
        },
        [email, type, pageNum, pageSize, startDate, endDate]
    );

    useEffect(() => {
        loadList();
    }, [loadList, refreshKey]);

    useEffect(() => {
        setPageNum(1);
    }, [startDate, endDate]);

    const handleMark = (payload, content) => {
        Modal.confirm({
            title: "标记已开发票",
            content,
            okText: "确认标记",
            cancelText: "取消",
            onOk: async () => {
                const res = await invoiceMark({ ...payload, email });
                if (res?.code === 200) {
                    message.success("已标记开发票");
                    await loadList();
                    onParentRefresh?.();
                } else {
                    message.error(res?.message || "标记失败");
                    return Promise.reject();
                }
            },
        });
    };

    const handleMarkRow = (record) => {
        const markMonth = toMonth(record.createTime);
        handleMark(
            {
                type,
                ...(markMonth ? { month: markMonth } : {}),
                orderIds: [record.id],
            },
            `确认将订单 ${record.orderNo || record.id} 标记为已开发票？`
        );
    };

    const handleMarkBatch = () => {
        const hasRange = !!(startDate && endDate);
        handleMark(
            {
                type,
                orderIds: [],
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
            },
            hasRange
                ? `确认将 ${typeLabel} 在 ${startDate} 至 ${endDate} 时间段内的全部订单标记为已开发票？`
                : `确认将 ${typeLabel} 的全部订单标记为已开发票？`
        );
    };

    const columns = [
        {
            title: "订单号",
            dataIndex: "orderNo",
            align: "center",
            render: displayValue,
        },
        {
            title: "金额",
            dataIndex: "amount",
            align: "center",
            render: (val) =>
                val === null || val === undefined || val === "" ? (
                    "--"
                ) : (
                    <Text strong className="text-[15px] text-red-700">
                        ￥{formatYuan(val)}
                    </Text>
                ),
        },
        {
            title: "开票状态",
            dataIndex: "isInvoiced",
            align: "center",
            render: (status) => {
                if (status === 1) return <Tag color="success">已开票</Tag>;
                if (status === 0) return <Tag>未开票</Tag>;
                return "--";
            },
        },
        {
            title: "创建时间",
            dataIndex: "createTime",
            align: "center",
            render: displayValue,
        },
        {
            title: "操作",
            align: "center",
            render: (_, record) =>
                record.isInvoiced === 0 ? (
                    <Button type="link" size="small" onClick={() => handleMarkRow(record)}>
                        标记已开票
                    </Button>
                ) : (
                    "订单已开票"
                ),
        },
    ];

    return (
        <div className="py-2">
            <Space className="mb-3" wrap>
                <Text type="secondary">{typeTag} 发票订单</Text>
                <DatePicker.RangePicker
                    allowClear
                    placeholder={["开始日期", "结束日期"]}
                    value={
                        startDate && endDate
                            ? [dayjs(startDate), dayjs(endDate)]
                            : null
                    }
                    onChange={(dates) => {
                        setStartDate(dates?.[0]?.format("YYYY-MM-DD") || "");
                        setEndDate(dates?.[1]?.format("YYYY-MM-DD") || "");
                    }}
                />
                <Button onClick={handleMarkBatch}>
                    {startDate && endDate
                        ? `标记 ${startDate} 至 ${endDate}`
                        : "标记全部"}
                </Button>
            </Space>
            <Table
                size="small"
                rowKey="id"
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
        </div>
    );
}

export default function PayPersonalAccountDetailPage() {
    const navigate = useNavigate();
    const authMenus = useSelector((state) => state.auth.menus);
    const [email, setEmail] = useState("");
    const [queriedEmail, setQueriedEmail] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSearch = async (
        nextEmail = email,
        { bumpChildren = true } = {}
    ) => {
        const value = (nextEmail || "").trim();
        if (!value) {
            message.warning("请输入邮箱");
            return;
        }
        if (!EMAIL_PATTERN.test(value)) {
            message.warning("请输入正确的邮箱格式");
            return;
        }
        try {
            setLoading(true);
            const res = await personalAccount({
                email: value,
            });
            if (res?.code === 200) {
                setList(res?.data || []);
                setQueriedEmail(value);
                setSearched(true);
                if (bumpChildren) {
                    setRefreshKey((key) => key + 1);
                }
            } else {
                message.error(res?.message || "查询失败！");
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "服务类型",
            dataIndex: "serviceType",
            align: "center",
            render: (type) => {
                const meta = SERVICE_TYPE_MAP[type];
                if (!meta) return "--";
                return (
                    <Tag color={meta.color} icon={meta.icon}>
                        {meta.label}
                    </Tag>
                );
            },
        },
        {
            title: "订单数",
            dataIndex: "totalOrderCount",
            align: "center",
            render: displayValue,
        },
        {
            title: "总金额",
            dataIndex: "totalAmount",
            align: "center",
            render: (val) =>
                val === null || val === undefined || val === "" ? (
                    "--"
                ) : (
                    <Text strong className="text-[15px] text-red-700">
                        ￥{(Number(val || 0)).toFixed(2)}
                    </Text>
                ),
        },
        {
            title: "已开票金额",
            dataIndex: "invoicedAmount",
            align: "center",
            render: (val) =>
                val === null || val === undefined || val === "" ? (
                    "--"
                ) : (
                    <Text strong className="text-[15px] text-red-700">
                        ￥{(Number(val || 0)).toFixed(2)}
                    </Text>
                ),
        },
        {
            title: "未开票金额",
            dataIndex: "uninvoicedAmount",
            align: "center",
            render: (val) =>
                val === null || val === undefined || val === "" ? (
                    "--"
                ) : (
                    <Text strong className="text-[15px] text-red-700">
                        ￥{(Number(val || 0)).toFixed(2)}
                    </Text>
                ),
        },
        {
            title: "成功数",
            dataIndex: "successCount",
            align: "center",
            render: displayValue,
        },
        {
            title: "失败数",
            dataIndex: "failedCount",
            align: "center",
            render: displayValue,
        },
        {
            title: "失败已退款",
            dataIndex: "failedRefundedCount",
            align: "center",
            render: displayValue,
        },
        {
            title: "失败未退款",
            dataIndex: "failedUnrefundedCount",
            align: "center",
            render: displayValue,
        },
        {
            title: "退款订单数",
            align: "center",
            render: (_, record) => {
                const count =
                    Number(record.failedRefundedCount || 0) +
                    Number(record.failedUnrefundedCount || 0);
                const display = displayValue(count);
                const component = REFUND_PAGE_MAP[record.serviceType];
                const path = component ? findMenuPath(authMenus, component) : null;
                if (!queriedEmail || !path) return display;
                return (
                    <Tooltip title="查看该邮箱的退款订单">
                        <Button
                            type="link"
                            size="small"
                            icon={<LinkOutlined />}
                            style={{ textDecoration: "underline", cursor: "pointer" }}
                            onClick={() => {
                                navigate(
                                    `${path}?email=${encodeURIComponent(queriedEmail)}`
                                );
                            }}
                        >
                            {display}
                        </Button>
                    </Tooltip>
                );
            },
        },
    ];

    return (
        <PageCard
            description="查询个人账户明细，查询后左侧展开查看发票订单"
            extraActions={
                <Space>
                    <Text type="secondary">邮箱</Text>
                    <SearchInput
                        placeholder="请输入用户邮箱"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onPressEnter={() => handleSearch()}
                    />
                    <Tooltip title="查询">
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            loading={loading}
                            onClick={() => handleSearch()}
                        >
                            查询
                        </Button>
                    </Tooltip>
                </Space>
            }
            rightActions={
                <>
                    <Tooltip title="刷新数据">
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            disabled={!queriedEmail}
                            onClick={() => handleSearch(queriedEmail)}
                        >
                            刷新数据
                        </Button>
                    </Tooltip>
                </>
            }
        >
            <Table
                size="middle"
                rowKey="serviceType"
                loading={loading}
                dataSource={list}
                columns={columns}
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => (
                        <InvoiceOrderPanel
                            email={queriedEmail}
                            type={record.serviceType}
                            refreshKey={refreshKey}
                            onParentRefresh={() =>
                                handleSearch(queriedEmail, { bumpChildren: false })
                            }
                        />
                    ),
                }}
                locale={{
                    emptyText: (
                        <Empty
                            description={searched ? "暂无数据" : "请输入邮箱查询"}
                        />
                    ),
                }}
            />
        </PageCard>
    );
}
