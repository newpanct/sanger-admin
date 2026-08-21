import { useState } from "react";
import PageCard from "../../components/PageCard";
import {
    Button,
    Divider,
    Empty,
    Input,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { personalAccount } from "../../server/api";

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

export default function PayPersonalAccountDetailPage() {
    const [email, setEmail] = useState("");
    const [queriedEmail, setQueriedEmail] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (nextEmail = email) => {
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
            title: "总金额（元）",
            dataIndex: "totalAmount",
            align: "center",
            render: (val) =>
                val === null || val === undefined || val === "" ? (
                    "--"
                ) : (
                    <span style={{ fontWeight: 600, color: "#cf1322" }}>￥{formatYuan(val)}</span>
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
                rowKey="serviceType"
                loading={loading}
                dataSource={list}
                columns={columns}
                pagination={false}
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
