import { useEffect, useState } from "react";
import PageCard from "../components/PageCard";
import {
    Button,
    Divider,
    Form,
    Input,
    Modal,
    Space,
    Table,
    Tooltip,
    Typography,
    message,
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    refundReasonDelete,
    refundReasonPageList,
    refundReasonSave,
} from "../server/api";

const { Text } = Typography;

const displayValue = (val) =>
    val === null || val === undefined || val === "" ? "--" : val;

export default function RefundReasonPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [searchReason, setSearchReason] = useState("");
    const [openDel, setOpenDel] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [currentItem, setCurrentItem] = useState({});
    const [addForm] = Form.useForm();

    const handleList = async (nextPageNum = pageNum, nextPageSize = pageSize, reason = searchReason) => {
        try {
            setLoading(true);
            const res = await refundReasonPageList({
                pageNum: nextPageNum,
                pageSize: nextPageSize,
                reason: reason || undefined,
            });
            if (res?.code === 200) {
                setList(res?.data?.records || []);
                setTotal(res?.data?.total || 0);
            } else {
                message.error(res?.message || "获取数据列表失败！");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const value = keyword.trim();
        setSearchReason(value);
        setPageNum(1);
        if (pageNum === 1) {
            handleList(1, pageSize, value);
        }
    };

    const handleDelete = async () => {
        try {
            setBtnLoading(true);
            const res = await refundReasonDelete(currentItem.id);
            if (res?.code === 200) {
                message.success(res?.message || "删除退款理由成功！");
                setOpenDel(false);
                handleList(pageNum, pageSize);
            } else {
                message.error(res?.message || "删除退款理由失败！");
            }
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSave = async (values) => {
        try {
            setBtnLoading(true);
            const obj = currentItem.id
                ? { id: currentItem.id, reason: values.reason }
                : { reason: values.reason };
            const res = await refundReasonSave(obj);
            if (res?.code === 200) {
                message.success(res?.message || "操作成功！");
                setOpenAdd(false);
                handleList(pageNum, pageSize);
            } else {
                message.error(res?.message || "操作失败！");
            }
        } finally {
            setBtnLoading(false);
        }
    };

    useEffect(() => {
        handleList(pageNum, pageSize, searchReason);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNum, pageSize]);

    const columns = [
        {
            title: "退款原因",
            dataIndex: "reason",
            align: "center",
            render: displayValue,
        },
        {
            title: "操作人",
            dataIndex: "operator",
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
        {
            title: "操作",
            dataIndex: "id",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Tooltip title="编辑">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => {
                                setCurrentItem(record);
                                setOpenAdd(true);
                                addForm.setFieldsValue({ reason: record.reason });
                            }}
                        >
                            编辑
                        </Button>
                    </Tooltip>
                    <Tooltip title="删除">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                setCurrentItem(record);
                                setOpenDel(true);
                            }}
                        >
                            删除
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <PageCard
            title="退款原因管理"
            extraActions={
                <Space>
                    <Text type="secondary">理由</Text>
                    <Input
                        allowClear
                        style={{ width: 280 }}
                        placeholder="请输入退款理由"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Tooltip title="查询">
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                        >
                            查询
                        </Button>
                    </Tooltip>
                </Space>
            }
            rightActions={
                <>
                    <Tooltip title="添加退款理由">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setCurrentItem({});
                                addForm.resetFields();
                                setOpenAdd(true);
                            }}
                        >
                            添加理由
                        </Button>
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip title="刷新数据">
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={() => handleList(pageNum, pageSize)}
                        >
                            刷新数据
                        </Button>
                    </Tooltip>
                </>
            }
        >
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
                    showTotal: (t) => `共 ${t} 条`,
                    onChange: (page, size) => {
                        setPageNum(page);
                        setPageSize(size);
                    },
                }}
            />

            <Modal
                title="删除退款理由"
                open={openDel}
                onCancel={() => setOpenDel(false)}
                onOk={handleDelete}
                destroyOnHidden
                okText="确认删除"
                okButtonProps={{ danger: true, loading: btnLoading }}
            >
                <Space
                    direction="vertical"
                    size="middle"
                    align="center"
                    style={{ width: "100%", padding: "16px 0" }}
                >
                    <ExclamationCircleOutlined style={{ fontSize: "48px", color: "#ff4d4f" }} />
                    <div>
                        您确定要删除退款理由
                        <span style={{ fontWeight: 600 }}> {currentItem.reason || "--"} </span>
                        吗？
                    </div>
                </Space>
            </Modal>

            <Modal
                title={currentItem.id ? "编辑退款理由" : "添加退款理由"}
                open={openAdd}
                confirmLoading={btnLoading}
                onCancel={() => setOpenAdd(false)}
                onOk={() => addForm.submit()}
                okText="确认"
                destroyOnHidden
            >
                <Form form={addForm} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        label="退款原因"
                        name="reason"
                        rules={[{ required: true, message: "请输入退款理由" }]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="请输入退款理由"
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </PageCard>
    );
}
