import { useEffect, useState, useCallback } from "react";
import {
  Switch,
  Tag,
  Tooltip,
  Button,
  Divider,
  Spin,
  Typography,
  message,
} from "antd";
import {
  ReloadOutlined,
  FileSearchOutlined,
  PictureOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import PageCard from "../../components/PageCard";
import { dedupCheck, dedupCheckToggle } from "../../server/api";

const { Text } = Typography;

// 服务配置：
// key       - dedupCheck 返回的状态字段名
// toggleKey - dedupCheckToggle 的入参（字符串服务名）
const SERVICE_LIST = [
  {
    key: "crossCheckEnabled",
    toggleKey: "crossCheck",
    name: "CrossCheck",
    icon: <FileSearchOutlined />,
    color: "#1677ff",
    description: "文本查重服务，确保论文内容的原创性，保障质量与可信度。",
  },
  {
    key: "imagetwinEnabled",
    toggleKey: "imagetwin",
    name: "Imagetwin",
    icon: <PictureOutlined />,
    color: "#52c41a",
    description:
      "图像查重 AI 工具，检测科研论文图片的重复使用、篡改、抄袭及 AI 生成内容。",
  },
  {
    key: "sangerboxScopeEnabled",
    toggleKey: "sangerboxScope",
    name: "SangerboxScope",
    icon: <ThunderboltOutlined />,
    color: "#722ed1",
    description: "SangerboxScope 查重服务，提供专业的查重检测能力。",
  },
];

export default function ServerPage() {
  const [status, setStatus] = useState({
    crossCheckEnabled: false,
    imagetwinEnabled: false,
    sangerboxScopeEnabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [togglingKey, setTogglingKey] = useState(null);

  const handleFetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dedupCheck();
      if (res?.code === 200) {
        setStatus({
          crossCheckEnabled: !!res.data?.crossCheckEnabled,
          imagetwinEnabled: !!res.data?.imagetwinEnabled,
          sangerboxScopeEnabled: !!res.data?.sangerboxScopeEnabled,
        });
      } else {
        message.error(res?.message || "获取服务状态失败！");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  const handleToggle = async (service) => {
    try {
      setTogglingKey(service.toggleKey);
      const res = await dedupCheckToggle(service.toggleKey);
      if (res?.code === 200) {
        // 以后端返回为准，未返回则本地取反
        const next =
          res.data && typeof res.data[service.key] === "boolean"
            ? res.data[service.key]
            : !status[service.key];
        setStatus((prev) => ({ ...prev, [service.key]: next }));
        message.success(
          res?.message || `${service.name} 已${next ? "开启" : "关闭"}`
        );
      } else {
        message.error(res?.message || "状态更新失败！");
      }
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <PageCard
      title={"服务管理"}
      rightActions={
        <>
          <Tooltip title={"刷新数据"}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleFetch}
            >
              刷新数据
            </Button>
          </Tooltip>
        </>
      }
    >
      <Spin spinning={loading}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
          {SERVICE_LIST.map((service) => {
            const enabled = status[service.key];
            const toggling = togglingKey === service.toggleKey;
            return (
              <div
                key={service.key}
                className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                {/* 头部：图标 + 名称 + 状态标签 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: 40,
                        height: 40,
                        background: `${service.color}1a`,
                        color: service.color,
                        fontSize: 20,
                      }}
                    >
                      {service.icon}
                    </div>
                    <span className="text-base font-medium text-gray-800">
                      {service.name}
                    </span>
                  </div>
                  <Tag color={enabled ? "success" : "default"}>
                    {enabled ? "运行中" : "已停用"}
                  </Tag>
                </div>

                <Divider style={{ margin: "4px 0" }} />

                {/* 描述 */}
                <p className="text-sm text-gray-500 min-h-[40px]">
                  {service.description}
                </p>

                {/* 操作行 */}
                <div className="flex items-center justify-between mt-1">
                  <Text type="secondary" className="text-sm">
                    服务状态
                  </Text>
                  <Switch
                    checked={enabled}
                    loading={toggling}
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                    onChange={() => handleToggle(service)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Spin>
    </PageCard>
  );
}
