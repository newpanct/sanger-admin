import PageCard from "../components/PageCard";
import { useEffect, useState } from "react";
import {
    Table,
    Tag,
    Typography,
    Form,
    Input,
    Tooltip,
    Divider,
    Button,
    Modal,
    Space,
    message,
} from "antd";
import {
    enterpriseAdd,
    enterprisePage,
    enterpriseDelete,
    enterpriseManualRecharge,
} from "../server/api";
import {
    PlusOutlined,
    PropertySafetyOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

export default function EnterprisePage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // 创建企业
    const [addOpen, setAddOpen] = useState(false);

    // 企业充值
    const [addOpenRecharge, setAddOpenRecharge] = useState(false);

    // 当前操作企业
    const [currentItem, setCurrentItem] = useState({});

    // 第一层删除确认
    const [deleteOpen, setDeleteOpen] = useState(false);

    // 第二层删除确认
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // 第二层输入的企业名称
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    // 各操作独立 loading
    const [addLoading, setAddLoading] = useState(false);
    const [rechargeLoading, setRechargeLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [addForm] = Form.useForm();
    const [addRechargeForm] = Form.useForm();

    /**
     * 获取企业列表
     */
    const handleList = async () => {
        try {
            setLoading(true);

            const res = await enterprisePage({
                pageNum,
                pageSize,
            });

            if (res?.code === 200) {
                setList(res?.data?.records || []);
                setTotal(res?.data?.total || 0);
            }
        } catch (error) {
            console.error("获取企业列表失败：", error);
            message.error("获取企业列表失败，请稍后重试！");
        } finally {
            setLoading(false);
        }
    };

    /**
     * 新增企业
     */
    const handleAdd = async (values) => {
        try {
            setAddLoading(true);

            const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailRegex.test(values.contactEmail)) {
                message.error("邮箱格式错误（正确示例：name@example.com）");
                return;
            }

            const res = await enterpriseAdd(values);

            if (res?.code === 200) {
                message.success(res?.message || "创建成功！");

                await handleList();

                setAddOpen(false);
                addForm.resetFields();
            } else {
                message.error(res?.message || "创建失败！");
            }
        } catch (error) {
            console.error("创建企业失败：", error);
            message.error("创建失败，请稍后重试！");
        } finally {
            setAddLoading(false);
        }
    };

    /**
     * 企业充值
     */
    const handleAddRecharge = async (values) => {
        try {
            setRechargeLoading(true);

            const amountYuan = parseFloat(values.amount);
            const amountFen = Math.round(amountYuan);

            const res = await enterpriseManualRecharge({
                enterpriseId: currentItem.id,
                amount: amountFen,
                remark: values.remark,
            });

            if (res?.code === 200) {
                message.success(
                    res?.message ||
                    `充值金额￥${amountYuan.toFixed(2)}成功！`
                );

                await handleList();

                setAddOpenRecharge(false);
                addRechargeForm.resetFields();
            } else {
                message.error(res?.message || "充值失败！");
            }
        } catch (error) {
            console.error("企业充值失败：", error);
            message.error("充值失败，请稍后重试！");
        } finally {
            setRechargeLoading(false);
        }
    };

    /**
     * 删除企业
     */
    const handleDelete = async () => {
        if (!currentItem?.id) {
            message.error("未找到需要删除的企业！");
            return;
        }

        const enterpriseName = String(
            currentItem?.enterpriseName || ""
        ).trim();

        if (deleteConfirmText.trim() !== enterpriseName) {
            message.error("企业/组织名称输入不正确！");
            return;
        }

        try {
            setDeleteLoading(true);

            const res = await enterpriseDelete(currentItem.id);

            if (res?.code === 200) {
                message.success(res?.message || "删除企业成功！");

                setDeleteConfirmOpen(false);
                setDeleteConfirmText("");
                setCurrentItem({});

                // 当前页只剩一条时，删除后返回上一页
                if (list.length === 1 && pageNum > 1) {
                    setPageNum((prev) => prev - 1);
                } else {
                    await handleList();
                }
            } else {
                message.error(res?.message || "删除企业失败！");
            }
        } catch (error) {
            console.error("删除企业失败：", error);
            message.error("删除企业失败，请稍后重试！");
        } finally {
            setDeleteLoading(false);
        }
    };

    /**
     * 打开第一层删除确认
     */
    const handleOpenDelete = (record) => {
        setCurrentItem(record);
        setDeleteConfirmText("");
        setDeleteOpen(true);
    };

    /**
     * 关闭第一层删除确认
     */
    const handleCloseDelete = () => {
        if (deleteLoading) return;

        setDeleteOpen(false);
        setCurrentItem({});
        setDeleteConfirmText("");
    };

    /**
     * 进入第二层确认
     */
    const handleNextDelete = () => {
        if (!currentItem?.id) {
            message.error("未找到需要删除的企业！");
            return;
        }

        setDeleteOpen(false);
        setDeleteConfirmText("");
        setDeleteConfirmOpen(true);
    };

    /**
     * 关闭第二层确认
     */
    const handleCloseDeleteConfirm = () => {
        if (deleteLoading) return;

        setDeleteConfirmOpen(false);
        setDeleteConfirmText("");
        setCurrentItem({});
    };

    /**
     * 企业名称是否匹配
     */
    const isDeleteConfirmed =
        deleteConfirmText.trim() ===
        String(currentItem?.enterpriseName || "").trim();

    /**
     * 表格列
     */
    const columns = [
        {
            title: "企业/组织名称",
            dataIndex: "enterpriseName",
            align: "center",
        },
        {
            title: "联系人",
            dataIndex: "contactName",
            align: "center",
        },
        {
            title: "联系邮箱",
            dataIndex: "contactEmail",
            align: "center",
        },
        {
            title: "状态",
            dataIndex: "status",
            align: "center",
            render: (value) => (
                <Tag color={value === 1 ? "green" : "red"}>
                    {value === 1 ? "启用" : "禁用"}
                </Tag>
            ),
        },
        {
            title: "创建时间",
            dataIndex: "createTime",
            align: "center",
        },
        {
            title: "更新时间",
            dataIndex: "updateTime",
            align: "center",
        },
        {
            title: "余额",
            dataIndex: "balance",
            align: "center",
            render: (value) => (
                <Text strong className="text-[15px] text-red-700">
                    ￥{(Number(value || 0) / 100).toFixed(2)}
                </Text>
            ),
        },
        {
            title: "操作",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Tooltip title="余额充值">
                        <Button
                            icon={<PropertySafetyOutlined />}
                            onClick={() => {
                                setCurrentItem(record);
                                setAddOpenRecharge(true);
                            }}
                        >
                            余额充值
                        </Button>
                    </Tooltip>

                    <Tooltip title="删除企业">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleOpenDelete(record)}
                        >
                            删除
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        handleList();
    }, [pageNum, pageSize]);

    return (
        <PageCard
            title="企业/组织管理"
            rightActions={
                <div className="flex items-center">
                    <Tooltip title="新增企业/组织">
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setAddOpen(true)}
                        >
                            新增企业/组织
                        </Button>
                    </Tooltip>

                    <Divider type="vertical" />

                    <Tooltip title="刷新数据">
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={handleList}
                            loading={loading}
                        >
                            刷新数据
                        </Button>
                    </Tooltip>
                </div>
            }
        >
            {/* 企业列表 */}
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

            {/* ==================== 创建企业 ==================== */}
            <Modal
                title="创建企业/组织"
                open={addOpen}
                onCancel={() => {
                    if (!addLoading) {
                        setAddOpen(false);
                        addForm.resetFields();
                    }
                }}
                onOk={() => addForm.submit()}
                okText="创建"
                cancelText="取消"
                confirmLoading={addLoading}
                maskClosable={!addLoading}
                destroyOnHidden
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onFinish={handleAdd}
                >
                    <Form.Item
                        label="企业/组织名称"
                        name="enterpriseName"
                        rules={[
                            {
                                required: true,
                                message: "请输入企业/组织名称",
                            },
                        ]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入企业名称" />
                    </Form.Item>

                    <Form.Item
                        label="联系人"
                        name="contactName"
                        rules={[
                            {
                                required: true,
                                message: "请输入联系人",
                            },
                        ]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入联系人" />
                    </Form.Item>

                    <Form.Item
                        label="联系邮箱"
                        name="contactEmail"
                        normalize={(v) => v?.trim()}
                        rules={[
                            {
                                required: true,
                                message: "请输入联系邮箱",
                            },
                            {
                                type: "email",
                                message: "请输入正确的邮箱格式",
                            },
                        ]}
                    >
                        <Input placeholder="请输入联系邮箱" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ==================== 第一层删除确认 ==================== */}
            <Modal
                title="删除企业/组织"
                open={deleteOpen}
                onCancel={handleCloseDelete}
                onOk={handleNextDelete}
                destroyOnHidden
                okText="下一步"
                cancelText="取消"
                okButtonProps={{ danger: true }}
            >
                <div className="py-2">
                    <div className="mb-5 flex items-start gap-3">
                        <ExclamationCircleOutlined className="mt-0.5 shrink-0 text-[28px] text-red-500" />

                        <div>
                            <div className="mb-1.5 text-base font-medium">
                                确定要删除这个企业/组织吗？
                            </div>

                            <Text type="secondary">
                                请确认你正在操作正确的企业/组织。
                            </Text>
                        </div>
                    </div>

                    <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="mb-1 text-xs text-gray-400">
                            企业/组织名称
                        </div>

                        <div className="break-all text-[15px] font-semibold">
                            {currentItem?.enterpriseName || "-"}
                        </div>
                    </div>

                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] leading-6 text-red-700">
                        删除后相关数据可能无法恢复，请谨慎操作。
                    </div>
                </div>
            </Modal>

            {/* ==================== 第二层删除确认 ==================== */}
            <Modal
                title="最后确认删除"
                open={deleteConfirmOpen}
                onCancel={handleCloseDeleteConfirm}
                onOk={handleDelete}
                destroyOnHidden
                okText="确认删除"
                cancelText="取消"
                okButtonProps={{
                    danger: true,
                    loading: deleteLoading,
                    disabled: !isDeleteConfirmed,
                }}
                maskClosable={!deleteLoading}
                closable={!deleteLoading}
            >
                <div className="py-2">
                    <div className="mb-5 flex items-start gap-3">
                        <ExclamationCircleOutlined className="mt-0.5 shrink-0 text-[32px] text-red-500" />

                        <div>
                            <div className="mb-1.5 text-[17px] font-semibold">
                                请再次确认删除操作
                            </div>

                            <Text type="secondary">
                                此操作不可撤销，请谨慎操作。
                            </Text>
                        </div>
                    </div>

                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5">
                        <div className="mb-1.5 text-xs text-gray-500">
                            即将删除
                        </div>

                        <Paragraph
                            copyable={{
                                text: currentItem?.enterpriseName || "",
                                tooltips: ["复制企业名称", "已复制"],
                            }}
                            className="!mb-0 !text-base !font-semibold !text-red-700"
                        >
                            {currentItem?.enterpriseName || "-"}
                        </Paragraph>
                    </div>

                    <div className="mb-2 text-sm">
                        请输入企业/组织名称以确认删除：
                    </div>

                    <Input
                        value={deleteConfirmText}
                        onChange={(e) =>
                            setDeleteConfirmText(e.target.value)
                        }
                        placeholder={`请输入：${currentItem?.enterpriseName || ""
                            }`}
                        autoComplete="off"
                    />

                    {deleteConfirmText && !isDeleteConfirmed && (
                        <div className="mt-1.5 text-xs text-red-500">
                            输入的企业/组织名称不正确
                        </div>
                    )}

                    {isDeleteConfirmed && (
                        <div className="mt-1.5 text-xs text-green-500">
                            企业/组织名称验证通过，可以确认删除
                        </div>
                    )}
                </div>
            </Modal>

            {/* ==================== 企业充值 ==================== */}
            <Modal
                title={`${currentItem?.enterpriseName || ""} -- 余额充值`}
                open={addOpenRecharge}
                onCancel={() => {
                    if (!rechargeLoading) {
                        setAddOpenRecharge(false);
                        addRechargeForm.resetFields();
                    }
                }}
                onOk={() => addRechargeForm.submit()}
                destroyOnHidden
                okText="确认充值"
                cancelText="取消"
                width={400}
                okButtonProps={{
                    loading: rechargeLoading,
                }}
                maskClosable={!rechargeLoading}
            >
                <Form
                    form={addRechargeForm}
                    layout="vertical"
                    onFinish={handleAddRecharge}
                >
                    <Form.Item
                        label="充值金额"
                        name="amount"
                        rules={[
                            {
                                required: true,
                                message: "请输入充值金额",
                            },
                            {
                                validator: (_, value) => {
                                    if (
                                        value &&
                                        !/^\d+(\.\d{1,2})?$/.test(value)
                                    ) {
                                        return Promise.reject(
                                            new Error(
                                                "金额最多保留两位小数"
                                            )
                                        );
                                    }

                                    if (
                                        value &&
                                        parseFloat(value) <= 0
                                    ) {
                                        return Promise.reject(
                                            new Error("请输入大于0的金额")
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Space.Compact className="w-full">
                            <Input
                                placeholder="请输入金额"
                                addonAfter="元" />
                        </Space.Compact>
                    </Form.Item>

                    <Form.Item
                        label="备注"
                        name="remark"
                        rules={[
                            {
                                required: true,
                                message: "请输入备注",
                            },
                        ]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入备注" />
                    </Form.Item>
                </Form>
            </Modal>
        </PageCard>
    );
}