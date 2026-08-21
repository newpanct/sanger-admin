import { useEffect, useMemo, useState } from "react";
import PageCard from "../../components/PageCard";
import {
    Button,
    Col,
    Divider,
    Table,
    Tooltip,
    Space,
    Modal,
    message,
    Form,
    Input,
    Switch,
    Tag,
    Select,
    TreeSelect,
    AutoComplete,
    InputNumber,
    Row,
    Radio,
} from "antd";
import * as AntdIcons from "@ant-design/icons";
import {
    PlusOutlined,
    ReloadOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    EditOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from "@ant-design/icons";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    menuPage,
    menuAdd,
    menuUpdate,
    menuDelete,
    batchSort,
    refreshAuthMenus,
} from "../../server/api";

const TYPE_MAP = {
    1: { label: "目录", color: "blue" },
    2: { label: "菜单", color: "green" },
    3: { label: "按钮", color: "orange" },
};

const ICON_OPTIONS = [
    "DashboardOutlined",
    "PropertySafetyOutlined",
    "LinkOutlined",
    "ShopOutlined",
    "MenuOutlined",
    "PayCircleOutlined",
    "WalletOutlined",
    "BarChartOutlined",
    "FileSearchOutlined",
    "PictureOutlined",
    "ApartmentOutlined",
    "UserOutlined",
    "SearchOutlined",
    "OrderedListOutlined",
    "UnorderedListOutlined",
    "HistoryOutlined",
    "ThunderboltOutlined",
    "GiftOutlined",
    "TeamOutlined",
    "SafetyCertificateOutlined",
    "DesktopOutlined",
    "ExclamationCircleOutlined",
    "WechatOutlined",
    "CommentOutlined",
    "MailOutlined",
    "MoneyCollectOutlined",
    "SettingOutlined",
    "FolderOpenOutlined",
    "CloudServerOutlined",
    "AppstoreOutlined",
    "ProfileOutlined",
    "KeyOutlined",
    "ShoppingOutlined",
].map((name) => ({
    value: name,
    label: (
        <Space>
            {renderIcon(name)}
            {name}
        </Space>
    ),
}));

const PAGE_COMPONENT_OPTIONS = [
    "DashboardPage",
    "MerchantPage",
    "MerchantBalancePage",
    "PayCrossCheckPage",
    "PayImagetwinPage",
    "PaySangerboxScopePage",
    "PayEnterpriseRechargePage",
    "PayPersonalAccountDetailPage",
    "CrossCheckAbnOrderPage",
    "CrossCheckOrderPage",
    "ImagetwinAbnOrderPage",
    "ImagetwinOrderPage",
    "HistoryAbnOrderPage",
    "HistoryOrderPage",
    "DupliSeePage",
    "DupliSeeFaidPage",
    "PromoCodePage",
    "JournalPage",
    "ManuscriptPage",
    "CertificationPage",
    "RecommendPage",
    "OverviewPage",
    "EmailPage",
    "ModelBillingPage",
    "KeywordPage",
    "MemberPage",
    "LinkPage",
    "EnterprisePage",
    "ServerPage",
    "NoticePage",
    "RefundReasonPage",
    "MenuListPage",
    "RoleMenuPage",
].map((value) => ({ value }));

function renderIcon(name) {
    const IconComp = AntdIcons[name];
    if (!IconComp || typeof IconComp === "string" || typeof IconComp === "number") {
        return null;
    }
    return <IconComp />;
}

function normalizeTree(nodes = []) {
    return nodes.map((item) => ({
        ...item,
        children: item.children?.length ? normalizeTree(item.children) : undefined,
    }));
}

function collectIds(node, acc = new Set()) {
    if (!node) return acc;
    acc.add(node.id);
    (node.children || []).forEach((child) => collectIds(child, acc));
    return acc;
}

function findSiblings(tree, parentId) {
    if (parentId === 0 || parentId == null) return tree;
    const walk = (nodes = []) => {
        for (const node of nodes) {
            if (node.id === parentId) return node.children || [];
            const found = walk(node.children);
            if (found) return found;
        }
        return null;
    };
    return walk(tree) || [];
}

function flattenIds(nodes = [], acc = []) {
    nodes.forEach((item) => {
        acc.push(item.id);
        if (item.children?.length) flattenIds(item.children, acc);
    });
    return acc;
}

function findNodeMeta(tree, id, parentId = 0, siblings = tree) {
    for (let i = 0; i < siblings.length; i++) {
        const node = siblings[i];
        if (String(node.id) === String(id)) {
            return { node, parentId, siblings, index: i };
        }
        if (node.children?.length) {
            const found = findNodeMeta(tree, id, node.id, node.children);
            if (found) return found;
        }
    }
    return null;
}

const DragRow = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: String(props["data-row-key"]),
    });
    const style = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: "move",
        ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
    };
    return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
};

function toTreeSelectData(nodes = [], disabledIds = new Set()) {
    return nodes.map((item) => ({
        title: item.name,
        value: item.id,
        disabled: disabledIds.has(item.id),
        children: item.children?.length
            ? toTreeSelectData(item.children, disabledIds)
            : undefined,
    }));
}

export default function MenuListPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [openDel, setOpenDel] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [sortLoading, setSortLoading] = useState(false);
    const [currentItem, setCurrentItem] = useState({});
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [addForm] = Form.useForm();
    const sortableIds = useMemo(() => flattenIds(list).map(String), [list]);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const handleList = async (nextPageNum = pageNum, nextPageSize = pageSize) => {
        try {
            setLoading(true);
            const res = await menuPage({ pageNum: nextPageNum, pageSize: nextPageSize });
            if (res?.code === 200) {
                const records = normalizeTree(res?.data?.records || []);
                setList(records);
                setTotal(res?.data?.total || 0);
                setExpandedKeys([]);
            } else {
                message.error(res?.message || "获取菜单列表失败！");
            }
        } finally {
            setLoading(false);
        }
    };

    const openCreate = (parentId = 0) => {
        setCurrentItem({});
        addForm.resetFields();
        addForm.setFieldsValue({
            parentId,
            type: 2,
            sortOrder: 0,
            visible: 1,
            status: 1,
        });
        setOpenAdd(true);
    };

    const openEdit = (record) => {
        setCurrentItem(record);
        addForm.setFieldsValue({
            parentId: record.parentId ?? 0,
            name: record.name,
            path: record.path,
            component: record.component,
            icon: record.icon,
            sortOrder: record.sortOrder ?? 0,
            visible: record.visible,
            status: record.status ?? 1,
            type: record.type,
        });
        setOpenAdd(true);
    };

    const handleDelete = async () => {
        try {
            setBtnLoading(true);
            const res = await menuDelete(currentItem.id);
            if (res?.code === 200) {
                message.success(res?.message || "删除菜单成功！");
                setOpenDel(false);
                handleList();
                refreshAuthMenus();
            } else {
                message.error(res?.message || "删除菜单失败！");
            }
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setBtnLoading(true);
            const payload = {
                parentId: values.parentId ?? 0,
                name: values.name,
                path: values.path,
                component: values.component || undefined,
                icon: values.icon || undefined,
                sortOrder: values.sortOrder ?? 0,
                visible: values.visible ? 1 : 0,
                status: values.status ? 1 : 0,
                type: values.type,
            };
            if (currentItem.id) {
                payload.id = currentItem.id;
            }
            const res = currentItem.id
                ? await menuUpdate(payload)
                : await menuAdd(payload);
            if (res?.code === 200) {
                message.success(res?.message || "操作成功！");
                setOpenAdd(false);
                handleList();
                refreshAuthMenus();
            } else {
                message.error(res?.message || "操作失败！");
            }
        } finally {
            setBtnLoading(false);
        }
    };

    const handleReorder = async (siblings, fromIndex, toIndex) => {
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
        const next = arrayMove(siblings, fromIndex, toIndex);
        // 复用当前同级已有的 sortOrder，避免分页后被重写成 1,2,3 挤到第一页
        const sortValues = siblings
            .map((item) => item.sortOrder ?? 0)
            .sort((a, b) => a - b);
        const payload = next.map((item, i) => ({
            id: item.id,
            sortOrder: sortValues[i],
        }));

        try {
            setSortLoading(true);
            const res = await batchSort(payload);
            if (res?.code === 200) {
                message.success(res?.message || "排序更新成功！");
                handleList();
                refreshAuthMenus();
            } else {
                message.error(res?.message || "排序更新失败！");
            }
        } finally {
            setSortLoading(false);
        }
    };

    const handleMove = async (record, direction) => {
        const siblings = findSiblings(list, record.parentId ?? 0);
        const index = siblings.findIndex((item) => item.id === record.id);
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (index < 0 || targetIndex < 0 || targetIndex >= siblings.length) return;
        handleReorder(siblings, index, targetIndex);
    };

    const onDragEnd = ({ active, over }) => {
        if (!over || String(active.id) === String(over.id)) return;
        const activeMeta = findNodeMeta(list, active.id);
        const overMeta = findNodeMeta(list, over.id);
        if (!activeMeta || !overMeta) return;
        if (String(activeMeta.parentId) !== String(overMeta.parentId)) {
            message.warning("只能在同一级菜单中拖拽排序");
            return;
        }
        handleReorder(activeMeta.siblings, activeMeta.index, overMeta.index);
    };

    const handleVisibleChange = async (record, checked) => {
        const { children, createTime, updateTime, ...rest } = record;
        try {
            const res = await menuUpdate({
                ...rest,
                visible: checked ? 1 : 0,
            });
            if (res?.code === 200) {
                message.success(res?.message || "可见状态已更新");
                handleList();
                refreshAuthMenus();
            } else {
                message.error(res?.message || "可见状态更新失败！");
            }
        } catch (error) {
            message.error("可见状态更新失败！");
        }
    };

    const parentTreeData = useMemo(() => {
        const disabledIds = currentItem.id ? collectIds(currentItem) : new Set();
        return [
            {
                title: "顶级菜单",
                value: 0,
                children: toTreeSelectData(list, disabledIds),
            },
        ];
    }, [list, currentItem]);

    const columns = [
        {
            title: "菜单名称",
            dataIndex: "name",
            align: "center",
        },
        {
            title: "路径",
            dataIndex: "path",
            align: "center",
        },
        {
            title: "组件",
            dataIndex: "component",
            align: "center",
            render: (text) => text || <Tag color="blue">目录无组件</Tag>,
        },
        {
            title: "图标",
            dataIndex: "icon",
            align: "center",
            render: (icon) =>
                icon ? <span style={{ fontSize: 18 }}>{renderIcon(icon)}</span> : "-",
        },
        {
            title: "类型",
            dataIndex: "type",
            align: "center",
            render: (type) => {
                const meta = TYPE_MAP[type];
                return meta ? <Tag color={meta.color}>{meta.label}</Tag> : type;
            },
        },
        {
            title: "可见",
            dataIndex: "visible",
            align: "center",
            width: 110,
            render: (visible, record) => (
                <Tooltip title={visible === 1 ? "当前显示，点击隐藏" : "当前隐藏，点击显示"}>
                    <Switch
                        checked={visible === 1}
                        checkedChildren="显示"
                        unCheckedChildren="隐藏"
                        onChange={(checked) => handleVisibleChange(record, checked)}
                    />
                </Tooltip>
            ),
        },
        {
            title: "排序",
            dataIndex: "sortOrder",
            align: "center",
            width: 80,
        },
        {
            title: "操作",
            dataIndex: "id",
            align: "center",
            width: 200,
            render: (_, record) => {
                const siblings = findSiblings(list, record.parentId ?? 0);
                const index = siblings.findIndex((item) => item.id === record.id);
                return (
                    <Space direction="vertical" size={8}>
                        {record.type !== 3 && (
                            <Tooltip title="新增子菜单">
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => openCreate(record.id)}
                                >
                                    子菜单
                                </Button>
                            </Tooltip>
                        )}
                        <Radio.Group value={null}>
                            <Tooltip title={index <= 0 ? "已是同级第一项" : "上移"}>
                                    <Radio.Button
                                        disabled={index <= 0 || sortLoading}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleMove(record, "up");
                                        }}
                                    >
                                        <ArrowUpOutlined /> 上移
                                    </Radio.Button>
                            </Tooltip>
                            <Tooltip title={index >= siblings.length - 1 ? "已是同级最后一项" : "下移"}>
                                    <Radio.Button
                                        disabled={index < 0 || index >= siblings.length - 1 || sortLoading}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleMove(record, "down");
                                        }}
                                    >
                                        <ArrowDownOutlined /> 下移
                                    </Radio.Button>
                            </Tooltip>
                        </Radio.Group>
                        <Space>
                            <Tooltip title="编辑菜单">
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => openEdit(record)}
                                >
                                    编辑
                                </Button>
                            </Tooltip>
                            <Tooltip title="删除菜单">
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
                    </Space>
                );
            },
        },
    ];

    useEffect(() => {
        handleList(pageNum, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNum, pageSize]);

    return (
        <PageCard
            title="菜单列表"
            rightActions={
                <>
                    <Tooltip title="新增菜单">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => openCreate(0)}
                        >
                            新增菜单
                        </Button>
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip title="刷新数据">
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={() => handleList()}
                        >
                            刷新数据
                        </Button>
                    </Tooltip>
                </>
            }
        >
            <DndContext
                sensors={sensors}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={onDragEnd}
            >
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                    <Table
                        rowKey="id"
                        loading={loading}
                        dataSource={list}
                        columns={columns}
                        components={{
                            body: { row: DragRow },
                        }}
                        expandable={{
                            expandedRowKeys: expandedKeys,
                            onExpandedRowsChange: setExpandedKeys,
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
                </SortableContext>
            </DndContext>

            <Modal
                title="删除菜单"
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
                        您确定要删除菜单
                        <span style={{ fontWeight: 600 }}> {currentItem.name} </span>
                        吗？
                    </div>
                </Space>
            </Modal>

            <Modal
                title={currentItem.id ? "编辑菜单" : "新增菜单"}
                open={openAdd}
                confirmLoading={btnLoading}
                onCancel={() => setOpenAdd(false)}
                onOk={() => addForm.submit()}
                okText="确认"
                width={720}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        parentId: 0,
                        type: 2,
                        sortOrder: 0,
                        visible: 1,
                        status: 1,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="上级菜单" name="parentId">
                                <TreeSelect
                                    treeDefaultExpandAll
                                    treeData={parentTreeData}
                                    placeholder="请选择上级菜单"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="菜单名称"
                                name="name"
                                rules={[{ required: true, message: "请输入菜单名称" }]}
                                normalize={(v) => v?.trim()}
                            >
                                <Input placeholder="请输入菜单名称" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="路由路径"
                                name="path"
                                rules={[{ required: true, message: "请输入路由路径" }]}
                                normalize={(v) => v?.trim()}
                            >
                                <Input placeholder="例如 dashboard 或 list" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="菜单类型"
                                name="type"
                                rules={[{ required: true, message: "请选择菜单类型" }]}
                            >
                                <Select
                                    options={[
                                        { value: 1, label: "目录" },
                                        { value: 2, label: "菜单" },
                                        { value: 3, label: "按钮" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                                {({ getFieldValue }) => (
                                    <Form.Item
                                        label="前端组件"
                                        name="component"
                                        rules={
                                            getFieldValue("type") === 2
                                                ? [{ required: true, message: "请选择前端组件" }]
                                                : []
                                        }
                                    >
                                        <AutoComplete
                                            allowClear
                                            options={PAGE_COMPONENT_OPTIONS}
                                            placeholder="例如 DashboardPage"
                                            filterOption={(input, option) =>
                                                (option?.value || "")
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                        />
                                    </Form.Item>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="菜单图标" name="icon">
                                <Select
                                    allowClear
                                    showSearch
                                    optionFilterProp="value"
                                    options={ICON_OPTIONS}
                                    placeholder="请选择图标"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="排序值" name="sortOrder">
                                <InputNumber min={0} style={{ width: "100%" }} placeholder="越小越靠前" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label="是否可见"
                                name="visible"
                                valuePropName="checked"
                                normalize={(v) => (v ? 1 : 0)}
                            >
                                <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </PageCard>
    );
}
