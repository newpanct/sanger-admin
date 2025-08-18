import React, { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import menuConfig from './data/menu.json';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
// 动态加载组件的高阶组件
const withLoading = (Component) => {
  return (props) => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }, []);

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    return <Component {...props} />;
  };
};

// 改进的路由生成函数
const generateRoutes = (menus) => {
  // 组件映射表
  const componentMap = {
    Dashboard: lazy(() => import('./pages/Dashboard')),
    Journal: lazy(() => import('./pages/Journal')),
    UserManage: lazy(() => import('./pages/UserPage')),
    ManuscriptManage: lazy(() => import('./pages/ManuscriptManage')),
    TestPage: lazy(() => import('./pages/TestPage')),
    CertificationManage: lazy(() => import('./pages/CertificationManage')),
    Scan: lazy(() => import('./pages/Scan')),
    ImgScan: lazy(() => import('./pages/scanManage/ImgScan')),
    ThesisScan: lazy(() => import('./pages/scanManage/ThesisScan')),
    TestSubManage1: lazy(() => import('./pages/TestSubManage1')),
    TestSubManage2: lazy(() => import('./pages/TestSubManage2')),
  };

  return menus.map((item, index) => {
    // 检查必要字段
    if (!item.path) {
      console.error(`路由配置错误：第${index + 1}项缺少path字段`, item);
      return null;
    }

    if (item.children && item.children.length > 0) {
      // 有子路由时，创建布局路由
      const Component = withLoading(componentMap[item.componentName]);
      return {
        path: item.path,
        element: <Component />,
        children: generateRoutes(item.children)
      };
    } else {
      // 检查组件名称
      if (!item.componentName) {
        console.error(`路由配置错误：第${index + 1}项缺少componentName字段`, item);
        return null;
      }

      // 检查组件是否存在
      if (!componentMap[item.componentName]) {
        console.error(`未找到组件：${item.componentName}，请检查menu.json配置`);
        return null;
      }

      const Component = withLoading(componentMap[item.componentName]);

      return {
        path: item.path,
        element: <Component />
      };
    }
  }).filter(route => route !== null); // 过滤无效路由
};

const AppRoutes = () => {
  // 生成路由配置
  const childRoutes = generateRoutes(menuConfig.menus);

  // 路由配置
  const routes = useRoutes([
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/',
      element: <PrivateRoute />,
      children: [
        {
          path: '/',
          element: <AdminLayout />,
          children: childRoutes
        }
      ]
    }
  ]);

  return (
    <Suspense fallback={
      null
    }>
      {routes}
    </Suspense>
  );
};

export default AppRoutes;