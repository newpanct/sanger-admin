import { useEffect, useState } from "react";
import PageCard from "../../components/PageCard";
import {
    Button,
    Divider,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Switch,
    Table,
    Tag,
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
    roleAdd,
    roleDelete,
    rolePageList,
    roleUpdate,
} from "../../server/api";

const { Text } = Typography;

const displayValue = (val) =>
    val === null || val === undefined || val === "" ? "--" : val;

const STATUS_OPTIONS = [
    { value: 1, label: "启用" },
    { value: 0, label: "禁用" },
];

export default function RoleListPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [searchName, setSearchName] = useState("");
    const [statusFilter, setStatusFilter] = useState();
    const [searchStatus, setSearchStatus] = useState();
    const [openDel, setOpenDel] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [currentItem, setCurrentItem] = useState({});
    const [addForm] = Form.useForm();

    const handleList = async (
        nextPageNum = pageNum,
        nextPageSize = pageSize,
        roleName = searchName,
        status = searchStatus
    ) => {
        try {
            setLoading(true);
            const res = await rolePageList({
                pageNum: nextPageNum,
                pageSize: nextPageSize,
                roleName: roleName || undefined,
                status: status === 0 || status === 1 ? status : undefined,
            });
            if (res?.code === 200) {
                setList(res?.data?.records || []);
                setTotal(res?.data?.total || 0);
            } else {
                message.error(res?.message || "获取角色列表失败！");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const value = keyword.trim();
        setSearchName(value);
        setSearchStatus(statusFilter);
        setPageNum(1);
        if (pageNum === 1) {
            handleList(1, pageSize, value, statusFilter);
        }
    };

    const handleDelete = async () => {
        try {
            setBtnLoading(true);
            const res = await roleDelete(currentItem.id);
            if (res?.code === 200) {
                message.success(res?.message || "删除角色成功！");
                setOpenDel(false);
                handleList(pageNum, pageSize);
            } else {
                message.error(res?.message || "删除角色失败！");
            }
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSave = async (values) => {
        try {
            setBtnLoading(true);
            const payload = {
                roleCode: values.roleCode,
                roleName: values.roleName,
                description: values.description || undefined,
                sortOrder: values.sortOrder ?? 0,
                status: values.status ? 1 : 0,
            };
            if (currentItem.id) {
                payload.id = currentItem.id;
            }
            const res = currentItem.id
                ? await roleUpdate(payload)
                : await roleAdd(payload);
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
        handleList(pageNum, pageSize, searchName, searchStatus);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNum, pageSize]);

    const columns = [
        {
            title: "角色编码",
            dataIndex: "roleCode",
            align: "center",
            render: displayValue,
        },
        {
            title: "角色名称",
            dataIndex: "roleName",
            align: "center",
            render: displayValue,
        },
        {
            title: "描述",
            dataIndex: "description",
            align: "center",
            render: displayValue,
        },
        {
            title: "状态",
            dataIndex: "status",
            align: "center",
            render: (status) =>
                status === 1 ? (
                    <Tag color="success">启用</Tag>
                ) : (
                    <Tag>禁用</Tag>
                ),
        },
        {
            title: "排序",
            dataIndex: "sortOrder",
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
                                addForm.setFieldsValue({
                                    roleCode: record.roleCode,
                                    roleName: record.roleName,
                                    description: record.description,
                                    sortOrder: record.sortOrder ?? 0,
                                    status: record.status === 1,
                                });
                                setOpenAdd(true);
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
            title="角色管理"
            extraActions={
                <Space>
                    <Text type="secondary">名称</Text>
                    <Input
                        allowClear
                        style={{ width: 220 }}
                        placeholder="请输入角色名称"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Text type="secondary">状态</Text>
                    <Select
                        allowClear
                        style={{ width: 120 }}
                        placeholder="全部"
                        value={statusFilter}
                        options={STATUS_OPTIONS}
                        onChange={setStatusFilter}
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
                    <Tooltip title="新增角色">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setCurrentItem({});
                                addForm.resetFields();
                                addForm.setFieldsValue({
                                    sortOrder: 0,
                                    status: true,
                                });
                                setOpenAdd(true);
                            }}
                        >
                            新增角色
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
                size="middle"
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
                title="删除角色"
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
                        您确定要删除角色
                        <span style={{ fontWeight: 600 }}> {currentItem.roleName || "--"} </span>
                        吗？
                    </div>
                </Space>
            </Modal>

            <Modal
                title={currentItem.id ? "编辑角色" : "新增角色"}
                open={openAdd}
                confirmLoading={btnLoading}
                onCancel={() => setOpenAdd(false)}
                onOk={() => addForm.submit()}
                okText="确认"
                destroyOnHidden
            >
                <Form form={addForm} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        label="角色编码"
                        name="roleCode"
                        rules={[{ required: true, message: "请输入角色编码" }]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            precision={0}
                            placeholder="请输入角色编码"
                        />
                    </Form.Item>
                    <Form.Item
                        label="角色名称"
                        name="roleName"
                        rules={[{ required: true, message: "请输入角色名称" }]}
                        normalize={(v) => v?.trim()}
                    >
                        <Input placeholder="请输入角色名称" />
                    </Form.Item>
                    <Form.Item
                        label="角色描述"
                        name="description"
                        normalize={(v) => v?.trim()}
                    >
                        <Input.TextArea rows={3} placeholder="请输入角色描述" maxLength={200} showCount />
                    </Form.Item>
                    <Form.Item label="排序值" name="sortOrder">
                        <InputNumber style={{ width: "100%" }} min={0} precision={0} placeholder="请输入排序值" />
                    </Form.Item>
                    <Form.Item
                        label="状态"
                        name="status"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                    </Form.Item>
                </Form>
            </Modal>
        </PageCard>
    );
}
