import React, { Suspense, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Breadcrumb,
  Button,
  Modal,
  Avatar,
  Spin,
  Drawer,
  ColorPicker,
  Space,
  Tooltip,
  Typography,
  Segmented,
  Badge,
  message,
} from "antd";
import {
  MoneyCollectOutlined ,
  MoonOutlined,
  SunOutlined,
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
  UnorderedListOutlined,
  ExperimentOutlined,
  CodeOutlined,
  BugOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  BgColorsOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  PayCircleOutlined,
  MenuOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  StopOutlined,
  SettingOutlined,
  ShoppingOutlined,
  CheckSquareOutlined,
  MailOutlined,
  WechatOutlined,
  CommentOutlined,
  FolderOpenOutlined,
  PropertySafetyOutlined,
  SafetyCertificateOutlined,
  GiftOutlined,
  LinkOutlined,
  ApartmentOutlined,
  CloudServerOutlined ,
  DesktopOutlined ,
} from "@ant-design/icons";
import { adminLogout, getFailed } from "../server/api";
import adminMenu from "../data/menu.json";
import { useDispatch, useSelector } from "react-redux";
import { setThemeToken } from "../store/themeSlice";
import { useIdleLogout } from "../hooks/useIdleLogout";
import { clearAuth, persistor } from "../store";
import { setMenuBadges, clearAllMenuBadge } from "../store/menuBadgeSlice";
const { Header, Sider, Content } = Layout;
const { Text } = Typography;
// icon 映射
const iconMap = {
  ExclamationCircleOutlined,
  DesktopOutlined,
  CloudServerOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  PropertySafetyOutlined,
  FolderOpenOutlined,
  CommentOutlined,
  WechatOutlined,
  SettingOutlined,
  CheckSquareOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  ShopOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  UnorderedListOutlined,
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
  HistoryOutlined,
  PayCircleOutlined,
  MenuOutlined,
  KeyOutlined,
  ShoppingOutlined,
  MailOutlined,
  GiftOutlined,
  LinkOutlined,
  MoneyCollectOutlined 
};
const computeFullPath = (item, parentPath = "") => {
  if (!item.path) return "";
  return parentPath
    ? `${parentPath}/${item.path}`.replace(/\/+/g, "/")
    : `/${item.path}`;
};
const generateMenuItems = (menus, badgeMap = {}, parentPath = "") =>
  menus
    .filter((item) => !item.hidden)
    .map((item) => {
      const IconComponent = iconMap[item.icon];
      const fullPath = computeFullPath(item, parentPath);
      let childrenItems;
      let hasChildrenBadge = false;
      if (item.children?.length) {
        childrenItems = generateMenuItems(item.children, badgeMap, fullPath);
        if (!childrenItems.length) return null;
        hasChildrenBadge = childrenItems.some((child) =>
          child.label?.props?.children?.some?.((c) => c?.type === Badge)
        );
      }
      const badgeValue = badgeMap[fullPath];
      const showBadge = badgeValue || hasChildrenBadge;
      const label = showBadge ? (
        <Space size={1}>
          <span>{item.label}</span>
          <Badge
            count={badgeValue === true ? 0 : badgeValue}
            dot={badgeValue === true || hasChildrenBadge}
          />
        </Space>
      ) : (
        item.label
      );

      return {
        key: fullPath,
        label,
        icon: IconComponent ? <IconComponent /> : null,
        children: childrenItems,
      };
    })
    .filter(Boolean);
const AdminLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.theme);
  const authMenus = useSelector((state) => state.auth.menus);
  const menuSource = authMenus?.length ? authMenus : adminMenu;
  const name = useSelector((state) => state.auth.username);
  const roleName = useSelector((state) => state.auth.roleName);
  const avatar = useSelector((state) => state.auth.avatar);
  const username = (name || "").slice(0, 3);
  const badgeMap = useSelector((state) => state.menuBadge.badges);
  const [theme, setTheme] = useState("light");
  const [collapsed, setCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorDrawerVisible, setColorDrawerVisible] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const rootSubmenuKeys = menuSource
    .filter((item) => !item.hidden && item.children?.length)
    .map((item) => computeFullPath(item));

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    // 一级菜单手风琴：同时只展开一个根级子菜单，保留其下的嵌套展开项
    if (latestOpenKey && rootSubmenuKeys.includes(latestOpenKey)) {
      setOpenKeys(
        keys.filter(
          (key) =>
            key === latestOpenKey || key.startsWith(`${latestOpenKey}/`)
        )
      );
    } else {
      setOpenKeys(keys);
    }
  };
  const [show, setShow] = useState(false);
  const manageTitle = "桑格管理";

  const splitKeyToPaths = (key) => {
    return key.replace(/^\//, "").split("/");
  };
  // 侧边栏
  const menuItems = generateMenuItems(menuSource, badgeMap);
  // 刷新数据
  const refreshDate = async () => {
    const res = await getFailed();
    if (res?.code === 200) {
      const data = res?.data || {};
      dispatch(
        setMenuBadges([
          {
            path: "/scan/crosscheck/abnormal-orders",
            value: data?.paperCount,
          },
          {
            path: "/scan/imagetwin/abnormal-orders",
            value: data?.imageCount,
          },
          {
            path: "/scan/history/abnormal-orders",
            value: data?.turnitinCount,
          },
          {
            path: "/scan/duplisee/abnormal-orders",
            value: data?.dupliseeCount,
          },
        ])
      );
    }
  };
  const getBreadcrumbByKey = (menus, selectedKey) => {
    if (!selectedKey) return [];
    const paths = splitKeyToPaths(selectedKey);

    const result = [];
    let currentMenus = menus;

    for (const path of paths) {
      const match = currentMenus.find((m) => m.path === path);
      if (!match) break;

      result.push({
        key: path,
        title: match.label,
      });

      currentMenus = match.children || [];
    }

    return result;
  };
  // 面包屑
  const breadcrumbItems = [
    { key: "home", title: manageTitle },
    ...getBreadcrumbByKey(menuSource, location.pathname),
  ];
  


  // 预设主题
  const presetColors = [
    "#1890ff", // 默认蓝色
    "#00b42a", // 绿色
    "#ff7d00", // 橙色
    "#f53f3f", // 红色
    "#722ed1", // 紫色
    "#0fc6c2", // 青色
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
  useIdleLogout();
  // 仅在路由变化时刷新异常订单角标，避免 render 期副作用
  useEffect(() => {
    refreshDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // 根据当前路由自动展开对应父级菜单
  useEffect(() => {
    const segments = location.pathname.replace(/^\//, "").split("/").filter(Boolean);
    const keys = [];
    let acc = "";
    for (let i = 0; i < segments.length - 1; i++) {
      acc = `${acc}/${segments[i]}`.replace(/\/+/g, "/");
      keys.push(acc);
    }
    setOpenKeys(keys);
  }, [location.pathname]);

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
    dispatch(clearAuth());
    dispatch(clearAllMenuBadge());
    persistor.purge();
    navigate("/login");
    setShow(false);
    message.info("已注销登录");
  };

  return (
    <Layout
      style={{
        height: "100vh",
        overflow: "hidden",
        background: theme === "dark" ? "#333" : "#fff",
      }}
    >
      {/* 侧边栏 */}
      <Sider
        width={260}
        theme={theme}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ height: "100vh", overflow: "hidden" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <h2
            style={{
              height: "64px",
              lineHeight: "64px",
              textAlign: "center",
              fontSize: "18px",
              flexShrink: 0,
              margin: 0,
              color: theme === "dark" ? "#fff" : "#333",
            }}
          >
            <Tooltip title={manageTitle}>{manageTitle}</Tooltip>
          </h2>
          <div
            className="no-scrollbar"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <Menu
              mode="inline"
              theme={theme}
              items={menuItems}
              selectedKeys={[location.pathname]}
              openKeys={openKeys}
              onOpenChange={onOpenChange}
              onClick={({ key }) => {
                if (location.pathname !== key) {
                  navigate(key);
                }
              }}
            />
          </div>
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
          }}
        >
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
              <Tooltip title="折叠/展开菜单">
                <Button
                  type="text"
                  onClick={() => setCollapsed(!collapsed)}
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                />
              </Tooltip>
              <Tooltip title="进入/退出全屏">
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
                />
              </Tooltip>
              <Tooltip title="白天/黑夜">
                <Segmented
                  shape="round"
                  value={theme} // 绑定当前主题状态
                  onChange={(value) => setTheme(value)} // 切换时更新主题状态
                  options={[
                    { value: "light", icon: <SunOutlined /> },
                    { value: "dark", icon: <MoonOutlined /> },
                  ]}
                />
              </Tooltip>
            </div>

            {/* 右侧用户信息 + 颜色设置*/}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Tooltip title="注销登录">
                <Button
                  type="text"
                  style={{ padding: "0", border: "0" }}
                  onClick={() => {
                    setShow(true);
                  }}
                >
                  <Avatar
                    // src={avatar || undefined}
                    style={{
                      backgroundColor: token.colorPrimary,
                      fontSize: 14,
                    }}
                  >
                    {roleName?.slice(0, 2)}
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

        {/* 内容区 */}
        <Content className="flex-1 min-h-0 overflow-auto no-scrollbar mx-6 my-4">
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
          danger: true,
        }}
      >
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
    </Layout>
  );
};

export default AdminLayout;
