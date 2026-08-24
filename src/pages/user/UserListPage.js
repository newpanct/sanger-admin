import { useEffect, useState } from "react";
import PageCard from "../../components/PageCard";
import CopyableEllipsisText from "../../components/CopyableEllipsisText";
import {
    Avatar,
    Button,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from "antd";
import { ReloadOutlined, SearchOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import {
    adminUserPageList,
    assignUserRole,
    roleListAll,
} from "../../server/api";

const { Text } = Typography;

const displayValue = (val) =>
    val === null || val === undefined || val === "" ? "--" : val;

const USER_TYPE_MAP = {
    1: { text: "个人", color: "blue" },
    2: { text: "企业", color: "purple" },
    3: { text: "后台人员", color: "geekblue" },
};

const STATUS_MAP = {
    0: { text: "禁用", color: "default" },
    1: { text: "正常", color: "success" },
    2: { text: "删除", color: "error" },
};

const USER_TYPE_OPTIONS = Object.entries(USER_TYPE_MAP).map(([value, item]) => ({
    value: Number(value),
    label: item.text,
}));

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, item]) => ({
    value: Number(value),
    label: item.text,
}));

export default function UserListPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [roleFilter, setRoleFilter] = useState();
    const [userTypeFilter, setUserTypeFilter] = useState();
    const [statusFilter, setStatusFilter] = useState();
    const [searchParams, setSearchParams] = useState({
        keyword: "",
        role: undefined,
        userType: undefined,
        status: undefined,
    });
    const [roleOptions, setRoleOptions] = useState([]);
    const [assignOpen, setAssignOpen] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [currentItem, setCurrentItem] = useState({});
    const [assignForm] = Form.useForm();

    const loadRoles = async () => {
        const res = await roleListAll();
        if (res?.code === 200) {
            setRoleOptions(
                (res?.data || []).map((item) => ({
                    value: item.roleCode,
                    label:
                        item.roleCode != null
                            ? `${item.roleName}（${item.roleCode}）`
                            : item.roleName,
                    disabled: item.status === 0,
                }))
            );
        } else {
            message.error(res?.message || "获取角色列表失败！");
            setRoleOptions([]);
        }
    };

    const handleList = async (
        nextPageNum = pageNum,
        nextPageSize = pageSize,
        nextSearch = searchParams
    ) => {
        try {
            setLoading(true);
            const res = await adminUserPageList({
                pageNum: nextPageNum,
                pageSize: nextPageSize,
                keyword: nextSearch.keyword || undefined,
                role: nextSearch.role,
                userType: nextSearch.userType,
                status: nextSearch.status,
            });
            if (res?.code === 200) {
                setList(res?.data?.records || []);
                setTotal(res?.data?.total || 0);
            } else {
                message.error(res?.message || "获取用户列表失败！");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const nextSearch = {
            keyword: keyword.trim(),
            role: roleFilter,
            userType: userTypeFilter,
            status: statusFilter,
        };
        setSearchParams(nextSearch);
        setPageNum(1);
        if (pageNum === 1) {
            handleList(1, pageSize, nextSearch);
        }
    };

    const handleAssign = async (values) => {
        try {
            setBtnLoading(true);
            const res = await assignUserRole({
                userId: currentItem.id,
                roleCode: values.roleCode,
            });
            if (res?.code === 200) {
                message.success(res?.message || "分配角色成功！");
                setAssignOpen(false);
                handleList(pageNum, pageSize);
            } else {
                message.error(res?.message || "分配角色失败！");
            }
        } finally {
            setBtnLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    useEffect(() => {
        handleList(pageNum, pageSize, searchParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNum, pageSize]);

    const columns = [
        {
            title: "头像",
            dataIndex: "avatar",
            align: "center",
            width: 80,
            render: (avatar, record) => (
                <Avatar src={avatar || undefined} icon={<UserOutlined />}>
                    {(record.nickName || "").slice(0, 1)}
                </Avatar>
            ),
        },
        {
            title: "昵称",
            dataIndex: "nickName",
            align: "center",
            render: displayValue,
        },
        {
            title: "手机号",
            dataIndex: "phone",
            align: "center",
            render: (phone) => (phone ? <CopyableEllipsisText text={phone} /> : "--"),
        },
        {
            title: "邮箱",
            dataIndex: "email",
            align: "center",
            render: (email) => (email ? <CopyableEllipsisText text={email} /> : "--"),
        },
        {
            title: "角色",
            dataIndex: "roleName",
            align: "center",
            render: (name, record) =>
                name || record.role != null ? (
                    <Tag>
                        {name || "--"}
                        {record.role != null ? `（${record.role}）` : ""}
                    </Tag>
                ) : (
                    "--"
                ),
        },
        {
            title: "用户类型",
            dataIndex: "userType",
            align: "center",
            render: (type, record) => {
                const meta = USER_TYPE_MAP[type];
                const text = record.userTypeName || meta?.text;
                return text ? <Tag color={meta?.color}>{text}</Tag> : "--";
            },
        },
        {
            title: "状态",
            dataIndex: "status",
            align: "center",
            render: (status) => {
                const meta = STATUS_MAP[status];
                return meta ? <Tag color={meta.color}>{meta.text}</Tag> : "--";
            },
        },
        {
            title: "最后登录",
            dataIndex: "lastLoginTime",
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
            title: "操作",
            dataIndex: "id",
            align: "center",
            render: (_, record) => (
                <Tooltip title="分配角色">
                    <Button
                        icon={<TeamOutlined />}
                        onClick={() => {
                            setCurrentItem(record);
                            assignForm.setFieldsValue({
                                roleCode: record.role,
                            });
                            setAssignOpen(true);
                        }}
                    >
                        分配角色
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <PageCard
            title="用户列表"
            extraActions={
                <Space wrap>
                    <Text type="secondary">关键词</Text>
                    <Input
                        allowClear
                        style={{ width: 200 }}
                        placeholder="手机号 / 邮箱"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Text type="secondary">角色</Text>
                    <Select
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        style={{ width: 180 }}
                        placeholder="全部"
                        value={roleFilter}
                        options={roleOptions}
                        onChange={setRoleFilter}
                    />
                    <Text type="secondary">类型</Text>
                    <Select
                        allowClear
                        style={{ width: 130 }}
                        placeholder="全部"
                        value={userTypeFilter}
                        options={USER_TYPE_OPTIONS}
                        onChange={setUserTypeFilter}
                    />
                    <Text type="secondary">状态</Text>
                    <Select
                        allowClear
                        style={{ width: 110 }}
                        placeholder="全部"
                        value={statusFilter}
                        options={STATUS_OPTIONS}
                        onChange={setStatusFilter}
                    />
                    <Tooltip title="查询">
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                            查询
                        </Button>
                    </Tooltip>
                </Space>
            }
            rightActions={
                <Tooltip title="刷新数据">
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={() => handleList(pageNum, pageSize)}
                    >
                        刷新数据
                    </Button>
                </Tooltip>
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
                title="分配角色"
                open={assignOpen}
                confirmLoading={btnLoading}
                onCancel={() => setAssignOpen(false)}
                onOk={() => assignForm.submit()}
                okText="确认"
                destroyOnHidden
            >
                <div style={{ marginBottom: 16 }}>
                    用户：
                    <Text strong>{currentItem.nickName || currentItem.phone || "--"}</Text>
                </div>
                <Form
                    form={assignForm}
                    layout="vertical"
                    onFinish={handleAssign}
                    initialValues={{ roleCode: currentItem.role }}
                >
                    <Form.Item
                        label="角色"
                        name="roleCode"
                        rules={[{ required: true, message: "请选择角色" }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="请选择角色"
                            options={roleOptions}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </PageCard>
    );
}
