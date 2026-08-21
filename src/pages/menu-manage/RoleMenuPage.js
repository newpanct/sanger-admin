import { useEffect, useMemo, useState } from "react";
import PageCard from "../../components/PageCard";
import {
    Button,
    Col,
    Divider,
    Empty,
    Row,
    Select,
    Space,
    Spin,
    Tooltip,
    Tree,
    Typography,
    message,
} from "antd";
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import {
    menuPage,
    getRoleMenuIds,
    assignRoleMenus,
    getRoleMenuTree,
    refreshAuthMenus,
} from "../../server/api";
import store from "../../store";

const { Text } = Typography;

const ROLE_OPTIONS = [{ value: 8, label: "开发者" }];

function normalizeTree(nodes = []) {
    return nodes.map((item) => ({
        ...item,
        children: item.children?.length ? normalizeTree(item.children) : undefined,
    }));
}

function collectExpandKeys(nodes = [], acc = []) {
    nodes.forEach((item) => {
        if (item.children?.length) {
            acc.push(item.id);
            collectExpandKeys(item.children, acc);
        }
    });
    return acc;
}

function toIdList(keys = []) {
    return [...new Set(keys.map((key) => Number(key)).filter((id) => !Number.isNaN(id)))];
}

export default function RoleMenuPage() {
    const [role, setRole] = useState();
    const [roleOptions, setRoleOptions] = useState(ROLE_OPTIONS);
    const [allMenus, setAllMenus] = useState([]);
    const [previewMenus, setPreviewMenus] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [halfCheckedKeys, setHalfCheckedKeys] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [previewExpandedKeys, setPreviewExpandedKeys] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [roleLoading, setRoleLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const treeFieldNames = { title: "name", key: "id", children: "children" };

    const loadAllMenus = async () => {
        try {
            setListLoading(true);
            const res = await menuPage({ pageNum: 1, pageSize: 100 });
            if (res?.code === 200) {
                const records = normalizeTree(res?.data?.records || []);
                setAllMenus(records);
                setExpandedKeys(collectExpandKeys(records));
            } else {
                message.error(res?.message || "获取菜单树失败！");
            }
        } finally {
            setListLoading(false);
        }
    };

    const loadRoleData = async (nextRole = role) => {
        if (nextRole === undefined || nextRole === null || nextRole === "") return;
        try {
            setRoleLoading(true);
            const [idsRes, treeRes] = await Promise.all([
                getRoleMenuIds(nextRole),
                getRoleMenuTree(nextRole),
            ]);
            if (idsRes?.code === 200) {
                setCheckedKeys(idsRes?.data || []);
                setHalfCheckedKeys([]);
            } else {
                message.error(idsRes?.message || "获取角色菜单失败！");
            }
            if (treeRes?.code === 200) {
                const preview = normalizeTree(treeRes?.data || []);
                setPreviewMenus(preview);
                setPreviewExpandedKeys(collectExpandKeys(preview));
            } else {
                message.error(treeRes?.message || "获取角色菜单预览失败！");
            }
        } finally {
            setRoleLoading(false);
        }
    };

    const handleRoleChange = (value) => {
        setRole(value);
        setCheckedKeys([]);
        setHalfCheckedKeys([]);
        setPreviewMenus([]);
        if (value !== undefined && value !== null && value !== "") {
            loadRoleData(value);
        }
    };

    const handleRoleSearch = (text) => {
        const trimmed = String(text || "").trim();
        if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            if (!ROLE_OPTIONS.some((item) => item.value === num)) {
                setRoleOptions([...ROLE_OPTIONS, { value: num, label: `角色 ${num}` }]);
                return;
            }
        }
        setRoleOptions(ROLE_OPTIONS);
    };

    const handleSave = async () => {
        if (role === undefined || role === null || role === "") return;
        try {
            setSaving(true);
            const menuIds = toIdList([...checkedKeys, ...halfCheckedKeys]);
            const res = await assignRoleMenus(role, menuIds);
            if (res?.code === 200) {
                message.success(res?.message || "分配成功！");
                await loadRoleData(role);
                if (Number(role) === Number(store.getState().auth.roleId)) {
                    await refreshAuthMenus(role);
                }
            } else {
                message.error(res?.message || "分配失败！");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleRefresh = () => {
        loadAllMenus();
        loadRoleData();
    };

    useEffect(() => {
        loadAllMenus();
    }, []);

    const disabled = role === undefined || role === null || role === "";

    const extraActions = useMemo(
        () => (
            <Space>
                <Text type="secondary">角色</Text>
                <Select
                    showSearch
                    allowClear
                    placeholder="请选择或输入角色ID"
                    style={{ width: 220 }}
                    value={role}
                    options={roleOptions}
                    filterOption={(input, option) =>
                        String(option?.value).includes(input) ||
                        String(option?.label || "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                    }
                    onSearch={handleRoleSearch}
                    onChange={handleRoleChange}
                />
            </Space>
        ),
        [role, roleOptions]
    );

    return (
        <PageCard
            title="角色菜单分配"
            extraActions={extraActions}
            rightActions={
                <>
                    <Tooltip title="保存分配">
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            disabled={disabled}
                            loading={saving}
                            onClick={handleSave}
                        >
                            保存
                        </Button>
                    </Tooltip>
                    <Divider type="vertical" />
                    <Tooltip title="刷新数据">
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                        >
                            刷新数据
                        </Button>
                    </Tooltip>
                </>
            }
        >
            <Row gutter={16}>
                <Col span={12}>
                    <div style={{ padding: "12px 0 8px" }}>
                        <Text strong>分配菜单</Text>
                        <Text type="secondary">（勾选后点击保存，全量覆盖）</Text>
                    </div>
                    <Spin spinning={listLoading || roleLoading}>
                        <div
                            style={{
                                minHeight: 420,
                                maxHeight: "calc(100vh - 280px)",
                                overflow: "auto",
                                padding: 8,
                                border: "1px solid #f0f0f0",
                                borderRadius: 8,
                            }}
                        >
                            {allMenus.length ? (
                                <Tree
                                    checkable
                                    blockNode
                                    disabled={disabled}
                                    treeData={allMenus}
                                    fieldNames={treeFieldNames}
                                    checkedKeys={checkedKeys}
                                    expandedKeys={expandedKeys}
                                    onExpand={setExpandedKeys}
                                    onCheck={(keys, info) => {
                                        setCheckedKeys(keys);
                                        setHalfCheckedKeys(info.halfCheckedKeys || []);
                                    }}
                                />
                            ) : (
                                <Empty description="暂无菜单" />
                            )}
                        </div>
                    </Spin>
                </Col>
                <Col span={12}>
                    <div style={{ padding: "12px 0 8px" }}>
                        <Text strong>当前角色菜单预览</Text>
                    </div>
                    <Spin spinning={roleLoading}>
                        <div
                            style={{
                                minHeight: 420,
                                maxHeight: "calc(100vh - 280px)",
                                overflow: "auto",
                                padding: 8,
                                border: "1px solid #f0f0f0",
                                borderRadius: 8,
                            }}
                        >
                            {previewMenus.length ? (
                                <Tree
                                    blockNode
                                    treeData={previewMenus}
                                    fieldNames={treeFieldNames}
                                    expandedKeys={previewExpandedKeys}
                                    onExpand={setPreviewExpandedKeys}
                                />
                            ) : (
                                <Empty
                                    description={disabled ? "请先选择角色" : "该角色暂无菜单"}
                                />
                            )}
                        </div>
                    </Spin>
                </Col>
            </Row>
        </PageCard>
    );
}
