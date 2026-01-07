import { useState, useEffect } from "react";
import {
  Form,
  Modal,
  Typography,
  Checkbox,
  Button,
  Divider,
  Tabs,
  Card,
  message,
  Space,
  Tag,
  Empty,
} from "antd";

import {
  getPermissionList,
  getPermissionEnums,
  merchantPermission,
} from "../../../server/api";
export default function PermissionSettings({
  open,
  merchant,
  onCancel,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("add");
  const [loading, setLoading] = useState(false);
  const [enums, setEnums] = useState([]);

  // 当前已有权限（完整）
const currentPermissionMap = (merchant?.serviceGroups || []).reduce(
    (acc, item) => {
      acc[item.serviceGroup] = item.status; // 1 / 0
      return acc;
    },
    {}
  );
  
  const currentPermissionCodes = Object.keys(currentPermissionMap);
  const serviceGroupStatusMap = (merchant?.serviceGroups || []).reduce(
    (acc, item) => {
      acc[item.serviceGroup] = item.status; // 1 / 0
      return acc;
    },
    {}
  );

  
  const currentPermissions = enums.filter((item) =>
    currentPermissionCodes.includes(item.code)
  );

  const addPermissionOptions = enums
    .filter((item) => !currentPermissionCodes.includes(item.code))
    .map((item) => ({
      label: item.description,
      value: item.code,
    }));
  const currentPermissionOptions = currentPermissions.map((item) => ({
    label: item.description,
    value: item.code,
  }));

  const handleGetPermission = async () => {
    const res = await getPermissionEnums(merchant.merchantId);
    if (res?.code === 200) {
      setEnums(res.data || []);
    } else {
      message.error(res?.message || "获取权限出错，请联系管理员！");
    }
  };



  const handlePermission = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      console.log("操作类型:", activeTab, values[activeTab]);

      const selectedPermissions = values[activeTab];

      if (!selectedPermissions || !selectedPermissions.length) {
        return message.warning("请选择至少一个权限");
      }
      const obj = {
        merchantId: merchant.merchantId,
        permissions: [
          {
            serviceGroup: values[activeTab],
            status: 0,
          },
        ],
      };
      const res = await merchantPermission(obj);
      if (res?.code === 200) {
        message.success("操作成功");
      }
      // TODO: 根据 activeTab 调用不同接口
      // add / remove / close

      //   onSuccess();
      //   onCancel();
    } catch (error) {
      if (error?.errorFields) return;
      message.error("系统异常，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPermissions = async (tab) => {
    const values = await form.validateFields();
    const selected = values[tab];
  
    if (!selected || !selected.length) {
      message.warning("请选择至少一个权限");
      throw new Error("no permission selected");
    }
    return selected;
  };


  const handleIsOpenPermission = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const selected = values[activeTab];
  
      if (!selected || !selected.length) {
        return message.warning("请选择至少一个权限");
      }
  
      const targetStatus = activeTab === "open" ? 1 : 0;
  
      // 幂等过滤：只处理真正需要变更的权限
      const needChange = selected.filter(
        (code) => currentPermissionMap[code] !== targetStatus
      );
  
      if (!needChange.length) {
        return message.info(
          targetStatus === 1
            ? "所选权限均已开启，无需操作"
            : "所选权限均已关闭，无需操作"
        );
      }
  
      // 保留所有权限，仅修改目标权限 status
      const finalPermissions = currentPermissionCodes.map((code) => ({
        serviceGroup: code,
        status: needChange.includes(code)
          ? targetStatus
          : currentPermissionMap[code],
      }));
  
      const obj = {
        merchantId: merchant.merchantId,
        permissions: finalPermissions,
      };
  
      const res = await merchantPermission(obj);
      if (res?.code === 200) {
        message.success(
          targetStatus === 1 ? "权限已开启" : "权限已关闭"
        );
        onSuccess?.();
        onCancel?.();
      } else {
        message.error(res?.message || "操作失败");
      }
    } catch (error) {
      if (error?.errorFields) return;
      message.error("系统异常，请稍后再试");
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleIsAddPermission = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const selected = values[activeTab];
  
      if (!selected || !selected.length) {
        return message.warning("请选择至少一个权限");
      }
  
      let finalPermissions = [];
  
      if (activeTab === "add") {
        // 已有权限 + 新增权限（去重）
        const merged = Array.from(
          new Set([...currentPermissionCodes, ...selected])
        );
  
        finalPermissions = merged.map((code) => ({
          serviceGroup: code,
          status: currentPermissionMap[code] ?? 1, // 新增的默认开启
        }));
      }
  
      if (activeTab === "remove") {
        // 从已有权限中移除
        finalPermissions = currentPermissionCodes
          .filter((code) => !selected.includes(code))
          .map((code) => ({
            serviceGroup: code,
            status: currentPermissionMap[code],
          }));
      }
  
      const obj = {
        merchantId: merchant.merchantId,
        permissions: finalPermissions,
      };
  
      const res = await merchantPermission(obj);
      if (res?.code === 200) {
        message.success(activeTab === "add" ? "权限新增成功" : "权限撤销成功");
        onSuccess?.();
        onCancel?.();
      } else {
        message.error(res?.message || "操作失败");
      }
    } catch (error) {
      if (error?.errorFields) return;
      message.error("系统异常，请稍后再试");
    } finally {
      setLoading(false);
    }
  };
  
  


  useEffect(() => {
    if (!open || !merchant) return;

    handleGetPermission();
    form.resetFields();
  }, [open, merchant]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={
        <>
          权限管理：
          <Typography.Text type="danger" strong>
            {merchant?.merchantName}
          </Typography.Text>
        </>
      }
    >
      {/* 当前权限 */}
      <Card size="small" title="当前权限" style={{ marginBottom: 16 }}>
        {currentPermissions.length ? (
          <Space wrap>
            {currentPermissions.map((item) => {
              const status = serviceGroupStatusMap[item.code];
              const enabled = status === 1;

              return (
                <Tag key={item.code} color={enabled ? "blue" : "default"}>
                  {item.description}
                  {!enabled && "（已关闭）"}
                </Tag>
              );
            })}
          </Space>
        ) : (
          <Empty description="暂无权限" />
        )}
      </Card>

      <Divider />

      <Form form={form} layout="vertical">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "add",
              label: "新增权限",
              children: (
                <>
                  <Form.Item name="add">
                    <Checkbox.Group options={addPermissionOptions} />
                  </Form.Item>
                  <div style={{ textAlign: "center" }}>
                    <Button
                      type="primary"
                      loading={loading}
                      onClick={handleIsAddPermission}
                    >
                      新增权限
                    </Button>
                  </div>
                </>
              ),
            },
            {
              key: "remove",
              label: "撤销权限",
              children: (
                <>
                  <Form.Item name="remove">
                    <Checkbox.Group options={currentPermissionOptions} />
                  </Form.Item>
                  <div style={{ textAlign: "center" }}>
                    <Button
                      danger
                      type="primary"
                      loading={loading}
                      onClick={handleIsAddPermission}
                    >
                      撤销权限
                    </Button>
                  </div>
                </>
              ),
            },
            {
              key: "open",
              label: "开启权限",
              children: (
                <>
                  <Form.Item name="open">
                    <Checkbox.Group options={currentPermissionOptions} />
                  </Form.Item>
                  <div style={{ textAlign: "center" }}>
                    <Button
                      type="primary"
                      loading={loading}
                      onClick={handleIsOpenPermission}
                    >
                      开启权限
                    </Button>
                  </div>
                </>
              ),
            },
            {
              key: "close",
              label: "关闭权限",
              children: (
                <>
                  <Form.Item name="close">
                    <Checkbox.Group options={currentPermissionOptions} />
                  </Form.Item>
                  <div style={{ textAlign: "center" }}>
                    <Button
                      danger
                      type="primary"
                      loading={loading}
                      onClick={handleIsOpenPermission}
                    >
                      关闭权限
                    </Button>
                  </div>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
}
