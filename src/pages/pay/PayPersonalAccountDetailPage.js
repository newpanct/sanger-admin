import { useCallback, useEffect, useState } from "react";
import PageCard from "../../components/PageCard";
import {
    Button,
    DatePicker,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import {
    invoiceAdd,
    invoiceMark,
    invoicePage,
    personalAccount,
} from "../../server/api";
import dayjs from "dayjs";

const { Text } = Typography;

const SERVICE_TYPE_MAP = {
    imagetwin: { label: "Imagetwin", color: "purple" },
    ithenticate: { label: "CrossCheck", color: "blue" },
    sangerboxscope: { label: "SangerboxScope", color: "cyan" },
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

function InvoiceOrderPanel({ email, type, refreshKey, onParentRefresh }) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [month, setMonth] = useState("");
    const [addOpen, setAddOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [form] = Form.useForm();
    const typeLabel = SERVICE_TYPE_MAP[type]?.label || type || "--";

    const loadList = useCallback(
        async (page = pageNum, size = pageSize, monthVal = month) => {
            if (!email || !type) return;
            try {
                setLoading(true);
                const res = await invoicePage({
                    pageNum: page,
                    pageSize: size,
                    type,
                    email,
                    ...(monthVal ? { month: monthVal } : {}),
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
        [email, type, pageNum, pageSize, month]
    );

    useEffect(() => {
        loadList();
    }, [loadList, refreshKey]);

    const handleAdd = async (values) => {
        const amountFen = Math.round(Number(values.amount) * 100);
        if (amountFen < 1) {
            message.warning("开票金额至少 0.01 元");
            return;
        }
        try {
            setAddLoading(true);
            const res = await invoiceAdd({
                email,
                type,
                amount: amountFen,
            });
            if (res?.code === 200) {
                message.success("已新增开票金额");
                setAddOpen(false);
                form.resetFields();
                await loadList();
                onParentRefresh?.();
            } else {
                message.error(res?.message || "新增失败");
            }
        } finally {
            setAddLoading(false);
        }
    };

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
        const markMonth = month || toMonth(record.createTime);
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
        if (month) {
            handleMark(
                { type, month, orderIds: [] },
                `确认按 ${typeLabel} / ${month} 批量标记已开发票？`
            );
            return;
        }
        handleMark(
            { type, orderIds: [] },
            `确认将 ${typeLabel} 的全部订单标记为已开发票？`
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
                    "--"
                ),
        },
    ];

    return (
        <div className="py-2">
            <Space className="mb-3" wrap>
                <Text type="secondary">{typeLabel} 发票订单</Text>
                <DatePicker
                    picker="month"
                    allowClear
                    placeholder="筛选月份"
                    value={month ? dayjs(month, "YYYY-MM") : null}
                    onChange={(value) => {
                        setMonth(value ? value.format("YYYY-MM") : "");
                        setPageNum(1);
                    }}
                />
                {month ? <Tag color="processing">{month}</Tag> : null}
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAddOpen(true)}
                >
                    新增已开票金额
                </Button>
                <Button onClick={handleMarkBatch}>
                    {month ? "按月批量标记" : "标记全部"}
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
            <Modal
                title={`新增已开票金额（${typeLabel}）`}
                open={addOpen}
                onCancel={() => {
                    setAddOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                confirmLoading={addLoading}
                destroyOnHidden
                okText="确认"
                cancelText="取消"
            >
                <Form form={form} layout="vertical" onFinish={handleAdd}>
                    <Form.Item
                        label="开票金额（元）"
                        name="amount"
                        rules={[
                            { required: true, message: "请输入开票金额" },
                            {
                                validator(_, value) {
                                    if (value == null || Number(value) <= 0) {
                                        return Promise.reject("金额必须大于 0");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            min={0.01}
                            precision={2}
                            step={0.01}
                            style={{ width: "100%" }}
                            placeholder="请输入开票金额"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default function PayPersonalAccountDetailPage() {
    const [email, setEmail] = useState("");
    const [queriedEmail, setQueriedEmail] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSearch = async (nextEmail = email, { bumpChildren = true } = {}) => {
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
            const res = await personalAccount({ email: value });
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
                return <Tag color={meta.color}>{meta.label}</Tag>;
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
    ];

    return (
        <PageCard
            title="个人账户明细查询"
            extraActions={
                <Space>
                    <Text type="secondary">邮箱</Text>
                    <Input
                        allowClear
                        style={{ width: 280 }}
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
