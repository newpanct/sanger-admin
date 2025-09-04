import React, { Suspense, useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Breadcrumb,
  Button,
  Modal,
  Avatar,
  Spin,
  Drawer,
  Dropdown,
  ColorPicker,
  Space,
  Tooltip,
  Popover,
  Typography,
  message,
} from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ShopOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ContainerOutlined,
  TagOutlined,
  ReadOutlined,
  FileTextOutlined,
  PictureOutlined,
  AuditOutlined,
  BookOutlined,
  IdcardOutlined,
  SearchOutlined,
  FileSearchOutlined,
  CopyOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  ProfileOutlined,
  WalletOutlined,
  OrderedListOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  CodeOutlined,
  BugOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  BgColorsOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { adminLogout } from "../server/api";
import menuConfig from "../data/menu.json";
import { Flex } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setThemeToken } from "../store/themeSlice";
const { Header, Sider, Content } = Layout;
const { Text } = Typography;
// icon 映射表
const iconMap = {
  ShopOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ContainerOutlined,
  TagOutlined,
  ReadOutlined,
  FileTextOutlined,
  PictureOutlined,
  AuditOutlined,
  BookOutlined,
  IdcardOutlined,
  SearchOutlined,
  FileSearchOutlined,
  CopyOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  ProfileOutlined,
  WalletOutlined,
  OrderedListOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  CodeOutlined,
  BugOutlined,
};

const findMenuPath = (menus, path, parents = []) => {
  for (let item of menus) {
    if (item.path === path) {
      return [...parents, item];
    }
    if (item.children) {
      const found = findMenuPath(item.children, path, [...parents, item]);
      if (found) return found;
    }
  }
  return null;
};
const generateMenuItems = (menus, role) =>
  menus
    .filter((item) => {
      if (role === "admin") return true; // admin → 全部保留
      if (role === "user") {
        return (
          item.path.startsWith("/check") ||
          item.path.startsWith("/pay") ||
          item.path.startsWith("/scan") ||
          item.path.startsWith("/test")
        );
      }
      return false;
    })
    .map((item) => {
      const IconComponent = iconMap[item.icon];
      if (item.children && item.children.length > 0) {
        return {
          key: item.path,
          label: item.label,
          icon: IconComponent ? <IconComponent /> : null,
          children: generateMenuItems(item.children, role),
        };
      } else {
        return {
          key: item.path,
          label: item.label,
          icon: IconComponent ? <IconComponent /> : null,
        };
      }
    });

const AdminLayout = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.theme);
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorDrawerVisible, setColorDrawerVisible] = useState(false);
  const [show, setShow] = useState(false);
  const matchedPath = findMenuPath(menuConfig, location.pathname) || [];
  const role = useSelector((state) => state.auth.role || "user");
  const name = useSelector((state) => state.auth.username || "user");
  const username = useSelector((state) => state.auth.username || "user").slice(
    0,
    3
  );
  const menuItems = generateMenuItems(menuConfig, role);

  // 预设主题颜色选项
  const presetColors = [
    "#1890ff", // 默认蓝色
    "#00b42a", // 绿色
    "#ff7d00", // 橙色
    "#f53f3f", // 红色
    "#722ed1", // 紫色
    "#0fc6c2", // 青色
  ];

  const breadcrumbItems = [
    { key: "home", title: "桑格管理" },
    ...matchedPath.map((item) => ({
      key: item.path,
      title: item.label,
    })),
  ];

  // 处理主色修改
  const handleColorChange = (color) => {
    if (color) {
      const hexColor = color.toHexString();
      dispatch(setThemeToken({ colorPrimary: hexColor }));
    }
  };

  // 快速选择预设颜色
  const handlePresetColorClick = (color) => {
    dispatch(setThemeToken({ colorPrimary: color }));
  };

  //抽屉内部内容
  const colorDrawerContent = (
    <div style={{ padding: 24, width: "100%" }}>
      <Space direction="vertical" size="middle">
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
          修改全局主题颜色
        </h4>

        {/* 颜色选择器 */}
        <ColorPicker
          value={token.colorPrimary}
          onChange={handleColorChange}
          format="hex"
          showText
          style={{ width: "100%" }} // 适配抽屉宽度
        />

        {/* 预设颜色选项 */}
        <div>
          <p style={{ margin: "16px 0 8px 0", fontSize: 14, color: "#666" }}>
            快速选择:
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {presetColors.map((color) => (
              <Tooltip key={color} title={color}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: color,
                    cursor: "pointer",
                    border:
                      token.colorPrimary === color ? "2px solid #000" : "none",
                    boxSizing: "border-box",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.1)" }, // hover 放大效果
                  }}
                  onClick={() => handlePresetColorClick(color)}
                />
              </Tooltip>
            ))}
          </div>
        </div>
      </Space>
    </div>
  );

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 切换全屏状态
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        message.success("已进入全屏模式");
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
          message.success("已退出全屏模式");
        }
      }
    } catch (e) {
      message.error(`全屏操作失败: ${e.message}`);
      console.error("全屏操作错误:", e);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/login");
    setShow(false);
    message.info("已注销登录");
  };

  const [openKeys, setOpenKeys] = useState([]);
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  const items = [
    {
      key: "1",
      label: <div onClick={{ handleLogout }}>注销登录</div>,
    },
  ];

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {/* 侧边栏 */}
      <Sider
        theme="light"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <h2
          style={{
            height: "64px",
            lineHeight: "64px",
            textAlign: "center",
            fontSize: "18px",
            flexShrink: 0,
            margin: 0,
          }}
        >
          桑格管理
        </h2>
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <Menu
            mode="inline"
            items={menuItems}
            defaultSelectedKeys={["/dashboard"]}
            selectedKeys={[location.pathname]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            onClick={({ key }) => {
              if (location.pathname !== key) {
                navigate(key);
              }
            }}
            style={{ border: "0px" }}
          />
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout
        style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <Header style={{ background: "#fff", padding: "0 16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "100%",
            }}
          >
            {/* 左侧折叠按钮 */}
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="text"
                onClick={() => setCollapsed(!collapsed)}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                tooltip="折叠/展开菜单"
              />
              <Button
                type="text"
                onClick={toggleFullscreen}
                icon={
                  isFullscreen ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )
                }
                tooltip={isFullscreen ? "退出全屏" : "进入全屏"}
              />
            </div>

            {/* 右侧用户信息 + 颜色设置*/}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* TODO */}
              <Tooltip title="注销登录">
                <Button
                  type="text"
                  style={{ padding: "0", border: "0" }}
                  onClick={() => {
                    setShow(true);
                  }}
                >
                  <Avatar
                    style={{
                      backgroundColor: token.colorPrimary,
                      fontSize: 14,
                    }}
                  >
                    {username}
                  </Avatar>
                </Button>
              </Tooltip>
              <Tooltip title="主题颜色设置">
                <Button
                  type="text"
                  icon={<BgColorsOutlined />}
                  style={{ color: token.colorPrimary, fontSize: 16 }}
                  onClick={() => setColorDrawerVisible(true)} // 点击打开抽屉
                />
              </Tooltip>
            </div>
          </div>
        </Header>

        <Modal
          open={show}
          title={<Text strong>确认注销</Text>}
          okText="确认注销"
          cancelText="取消"
          onOk={handleLogout}
          onCancel={() => setShow(false)}
          maskClosable={false}
          destroyOnHidden
          width={400}
          okButtonProps={{
            danger: true, // 危险操作使用红色按钮强调
          }}
        >
          {/* 使用Antd的Space组件实现间距布局，无需依赖外部CSS */}
          <Space
            direction="vertical"
            size="middle"
            align="center"
            style={{ width: "100%", padding: "16px 0" }}
          >
            <ExclamationCircleOutlined
              style={{ fontSize: "48px", color: "#ff4d4f" }}
            />

            <Text>您确定要注销当前登录吗？</Text>

            <Text type="secondary" style={{ fontSize: "14px" }}>
              账户 <Text strong>{name}</Text> 将退出登录，
              <br />
              需要重新登录才能继续使用
            </Text>
          </Space>
        </Modal>

        <Drawer
          title="主题颜色设置"
          placement="right"
          open={colorDrawerVisible}
          onClose={() => setColorDrawerVisible(false)}
          width={320}
          closable={true}
          mask={true}
          maskClosable={true}
          style={{ zIndex: 1001 }}
        >
          {colorDrawerContent}
        </Drawer>

        {/* 内容区 */}
        <Content
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            margin: "16px 24px",
          }}
        >
          <Breadcrumb
            style={{
              paddingBottom: "16px",
              position: "sticky",
              top: "0px",
              zIndex: "10",
              background: "#f5f5f5",
            }}
            items={breadcrumbItems}
          />
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "200px",
                }}
              >
                <Spin size="large" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
