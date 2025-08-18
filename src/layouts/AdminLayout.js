import { Layout, Menu, Breadcrumb, Button, Modal, message } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  ContainerOutlined,
  TagOutlined,
  ReadOutlined,
  FileTextOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import menuConfig from '../data/menu.json';

const { Header, Sider, Content } = Layout;

// 图标映射：键名对应menu.json中的icon字段值
const iconMap = {
  DashboardOutlined,
  UserOutlined,
  ContainerOutlined,
  TagOutlined,
  ReadOutlined,
  FileTextOutlined,
  PictureOutlined,
};

const generateMenuItems = (menus) => {
  return menus.map((item) => {
    const IconComponent = iconMap[item.icon];
    if (item.children && item.children.length > 0) {
      // 有子菜单时渲染为 SubMenu
      return {
        key: item.path,
        label: item.label,
        icon: IconComponent ? <IconComponent /> : null,
        children: generateMenuItems(item.children),
      };
    } else {
      // 无子菜单时渲染为普通菜单项
      return {
        key: item.path,
        label: <Link to={item.path}>{item.label}</Link>,
        icon: IconComponent ? <IconComponent /> : null,
      };
    }
  });
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentMenu = menuConfig.menus.find((item) => location.pathname === item.path);

  const breadcrumbItems = [
    { key: 'home', label: '后台管理' },
    ...(currentMenu ? [{ key: currentMenu.path, label: currentMenu.label }] : []),
  ];

  const handleLogout = () => {
    // 弹出确认模态框
    Modal.confirm({
      title: '确认退出登录',
      content: '您确定要退出登录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
        message.success('已成功退出');
      },
      onCancel: () => {
        message.info('退出操作已取消');
      },
    });
  };

  const menuItems = generateMenuItems(menuConfig.menus);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider theme="light">
        <div style={{ height: '64px', lineHeight: '64px', textAlign: 'center', fontSize: '18px' }}>
          桑格管理
        </div>
        <Menu
          mode="inline"
          items={menuItems}
          defaultSelectedKeys={['/dashboard']}
          selectedKeys={[location.pathname]}
        />
      </Sider>

      {/* 主内容区 */}
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
          <div style={{ textAlign: 'right', padding: '0 24px' }}>
            <Button type="text" onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </Header>

        <Content style={{ margin: '16px 24px' }}>
          {/* 动态面包屑 */}
          <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
