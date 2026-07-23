import PageCard from "../components/PageCard";
import { useEffect, useState, useRef } from "react";
import { Table,Typography, Form, Input, Switch, Tooltip, Divider, Button, Modal, Space, message } from "antd";
import {
    enterpriseAdd,
    enterprisePage,
    enterpriseDelete,
    enterpriseManualRecharge
} from "../server/api";
import { PlusOutlined, PropertySafetyOutlined, ExclamationCircleOutlined, ReloadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

const { Text } = Typography;
export default function EnterprisePage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [addOpen, setAddOpen] = useState(false);
    const [addOpenRecharge, setAddOpenRecharge] = useState(false);
    const [currentItem, setCurrentItem] = useState({});
    const [openDel, setOpenDel] = useState(false);
    const [addForm] = Form.useForm();
    const [addRechargeForm] = Form.useForm();
    const [btnLoading, setBtnLoading] = useState(false);

    const columns = [
        { title: "企业/组织名称", dataIndex: "enterpriseName", align: "center" },
        { title: "联系人", dataIndex: "contactName", align: "center" },
        { title: "联系邮箱", dataIndex: "contactEmail", align: "center" },
        { title: "创建时间", dataIndex: "createTime", align: "center" },
        { title: "更新时间", dataIndex: "updateTime", align: "center" },
        {
            title: "余额", dataIndex: "balance", align: "center",
            render: (value) => {
                const yuan = (Number(value || 0) / 100).toFixed(2);

                return (
                    
                <Text strong style={{ color: "#cf1322", fontSize: 15 }}>
                ￥{yuan}
                </Text>
                );
            },
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

    const handleAddRecharge = async (values) => {
        try {
            setBtnLoading(true);
            const amountYuan = parseFloat(values.amount);
            const amountFen = Math.round(amountYuan * 100);
            const obj = {
                enterpriseId: currentItem.id,
                amount: amountFen,
                remark: values.remark,
            }
            const res = await enterpriseManualRecharge(obj);
            if (res?.code === 200) {
                message.success(res?.message || `充值金额￥${amountYuan.toFixed(2)}成功！`);
                handleList(pageNum, pageSize);
                setAddOpenRecharge(false);
            } else {
                message.error(res?.message || '充值失败！');
            }
        } finally {
            setBtnLoading(false);
        }
    }

    const handleList = async () => {
        try {
            setLoading(true);
            const res = await enterprisePage({
                pageNum,
                pageSize,
            });
            if (res?.code === 200) {
                setList(res?.data?.records || []);
                setTotal(res?.data.total || 0);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleAdd = async (values) => {
        try {
            setBtnLoading(true);

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(values.contactEmail)) {
                message.error("邮箱格式错误（正确示例：name@example.com）");
                return;
            }

            const res = await enterpriseAdd(values);
            if (res?.code === 200) {
                message.success(res?.message || '创建成功！');
                handleList(pageNum, pageSize);
            } else {
                message.error(res?.message || '创建失败！');
            }
        } finally {
            setBtnLoading(false);
        }
    }

    const handleDelete = async () => {
        try {
            setBtnLoading(true);
            const res = await enterpriseDelete(currentItem.id);
            if (res?.code === 200) {
                message.success(res?.message || '删除企业成功！');
                handleList(pageNum, pageSize);
            } else {
                message.error(res?.message || '删除企业失败！');
            }
        } finally {
            setBtnLoading(false);
        }
    }

    useEffect(() => {
        handleList(pageNum, pageSize);
    }, [pageNum, pageSize]);

    return (
        <PageCard
            title="企业/组织管理"
            rightActions={
                <>
                    <Tooltip title="新增企业/组织">
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => {
                                setAddOpen(true);
                            }}
                        >
                            新增企业/组织
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
                    onChange: (page, size) => {
                        setPageNum(page);
                        setPageSize(size);
                    },
                }}
            />
            <Modal
                title="创建企业/组织"
                size='small'
                open={addOpen}
                onCancel={() => setAddOpen(false)}
                onOk={() => addForm.submit()}
                okText="创建"
                cancelText="取消"
                confirmLoading={btnLoading}
            >
                <Form form={addForm} layout="vertical" onFinish={handleAdd}>
                    <Form.Item
                        label="企业/组织名称"
                        name="enterpriseName"
                        rules={[{ required: true, message: "请输入企业/组织名称" }]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入企业名称" />
                    </Form.Item>

                    <Form.Item
                        label="联系人"
                        name="contactName"
                        rules={[{ required: true, message: "请输入联系人" }]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入联系人" />
                    </Form.Item>

                    <Form.Item
                        label="联系邮箱"
                        name="contactEmail"
                        normalize={(v) => v?.trim()}
                        rules={[
                            { required: true, message: "请输入联系邮箱" },
                            { type: "email", message: "请输入正确的邮箱格式" }
                        ]}
                    >
                        <Input placeholder="请输入联系邮箱" />
                    </Form.Item>
                </Form>

            </Modal>
            <Modal
                title={"是否删除企业/组织"}
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
                        您确定要删除企业/组织
                        <span style={{ fontWeight: 600 }}>{currentItem.enterpriseName}</span>吗？
                    </div>
                </Space>

            </Modal>

            <Modal
                title={`${currentItem.enterpriseName} -- 余额充值`}
                open={addOpenRecharge}
                onCancel={() => setAddOpenRecharge(false)}
                onOk={() => addRechargeForm.submit()}
                destroyOnHidden
                okText="确认充值"
                okButtonProps={{ loading: btnLoading }}
            >


                <Form form={addRechargeForm} layout="vertical" onFinish={handleAddRecharge}>
                    <Form.Item
                        label="充值金额"
                        name="amount"
                        rules={[
                            { required: true, message: "请输入充值金额" },
                            {
                                validator: (_, value) => {
                                    if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
                                        return Promise.reject(new Error('金额最多保留两位小数'));
                                    }
                                    if (value && parseFloat(value) <= 0) {
                                        return Promise.reject(new Error('请输入大于0的金额'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input placeholder="请输入金额（元）" addonAfter="元" />
                    </Form.Item>

                    <Form.Item
                        label="备注"
                        name="remark"
                        rules={[{ required: true, message: "请输入备注" }]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入备注" />
                    </Form.Item>
                </Form>

            </Modal>
        </PageCard>)
}