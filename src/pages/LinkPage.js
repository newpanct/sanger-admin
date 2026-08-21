import { useEffect, useState } from "react";
import PageCard from "../components/PageCard";
import {
    Button,
    Divider,
    Table,
    Tooltip,
    Space,
    Modal,
    message,
    Form,
    Input,
    Switch,
    Typography,
} from "antd";
import {
    PlusOutlined,
    ReloadOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    EditOutlined,
} from "@ant-design/icons";
import {
    serviceUrlList,
    serviceUrlAdd,
    serviceUrlUpdate,
    serviceUrlDelete,
    serviceUrlToggleStatus,
} from "../server/api";

const { Text } = Typography;

export default function LinkPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [openDel, setOpenDel] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [currentItem, setCurrentItem] = useState({});
    const [addForm] = Form.useForm();

    const columns = [
        { title: "中文描述", dataIndex: "cnName", align: "center" },
        { title: "英文描述", dataIndex: "enName", align: "center" },
        {
            title: "服务访问URL",
            dataIndex: "serviceUrl",
            align: "center",
            render: (path) => <Text copyable={{ text: path }}>{path}</Text>,
        },
        {
            title: "上线状态",
            dataIndex: "status",
            align: "center",
            render: (_, record) => (
                <Switch
                    checked={record.status === 1}
                    checkedChildren="上线"
                    unCheckedChildren="下线"
                    onChange={async (checked) => {
                        try {
                            setBtnLoading(true);
                            const res = await serviceUrlToggleStatus(record.id);
                            if (res?.code === 200) {
                                message.success(res?.message || "状态更新成功！");
                                handleList(pageNum, pageSize);
                            } else {
                                message.error(res?.message || "状态更新失败！");
                            }
                        } finally {
                            setBtnLoading(false);
                        }
                    }}
                />
            ),
        },
        { title: "创建时间", dataIndex: "createTime", align: "center" },
        { title: "更新时间", dataIndex: "updateTime", align: "center" },
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
                                addForm.setFieldsValue(record);
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

    const handleList = async (pageNum, pageSize, cnName, enName) => {
        try {
            setLoading(true);
            const res = await serviceUrlList({ pageNum, pageSize, cnName, enName });
            if (res?.code === 200) {
                setList(res?.data?.records || []);
                setTotal(res?.data.total || 0);
            } else {
                message.error(res?.message || "获取数据列表失败！");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setBtnLoading(true);
            const res = await serviceUrlDelete(currentItem.id);
            if (res?.code === 200) {
                handleList(pageNum, pageSize);
                setOpenDel(false);
                message.success(res?.message || `删除服务链接成功！`);
            } else {
                message.error(res?.message || `删除服务链接失败！`);
            }
        } finally {
            setBtnLoading(false);
        }
    };

    const handleAdd = async (values) => {
        try {
            const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
            if (!urlPattern.test(values.serviceUrl)) {
                message.error("请输入合法的服务访问 URL");
                return; // 阻止提交
            }
            setBtnLoading(true);
            const obj = currentItem.id
                ? { ...values, id: currentItem.id } // 编辑
                : values; // 新增
            const res = currentItem.id
                ? await serviceUrlUpdate(obj)
                : await serviceUrlAdd(obj);

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
        handleList(pageNum, pageSize);
    }, [pageNum, pageSize]);

    return (
        <PageCard
            title={"链接管理"}
            rightActions={
                <>
                    <Tooltip title={"新增链接"}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setOpenAdd(true);
                                setCurrentItem({});
                                addForm.resetFields();
                            }}
                        >
                            新增链接
                        </Button>
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip title={"刷新数据"}>
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

            {/* 删除弹窗 */}
            <Modal
                title={"删除服务链接"}
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
                        您确定要删除服务链接
                        <span style={{ fontWeight: 600 }}>{currentItem.cnName}</span>吗？
                    </div>
                </Space>
            </Modal>

            {/* 新增/编辑弹窗 */}
            <Modal
                title={currentItem.id ? "编辑服务链接" : "新增服务链接"}
                open={openAdd}
                confirmLoading={btnLoading}
                onCancel={() => setOpenAdd(false)}
                onOk={() => addForm.submit()}
                okText="确认"
            >
                <Form form={addForm} layout="vertical" onFinish={handleAdd}>
                    <Form.Item
                        label="中文描述"
                        name="cnName"
                        rules={[{ required: true, message: "请输入中文描述" }]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入中文描述" />
                    </Form.Item>

                    <Form.Item
                        label="英文描述"
                        name="enName"
                        rules={[{ required: true, message: "请输入英文描述" }]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入英文描述" />
                    </Form.Item>

                    <Form.Item
                        label="服务访问URL"
                        name="serviceUrl"
                        rules={[{ required: true, message: "请输入服务访问URL" }]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入服务访问URL" />
                    </Form.Item>

                    <Form.Item
                        label="上线状态"
                        name="status"
                        valuePropName="checked" // Switch 控件的选中状态映射到表单字段
                        normalize={(v) => (v ? 1 : 0)} // Switch true -> 1, false -> 0
                    >
                        <Switch
                            checkedChildren="上线"
                            unCheckedChildren="下线"
                            defaultChecked={currentItem.status === 1} // 编辑时设置默认状态
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </PageCard>
    );
}