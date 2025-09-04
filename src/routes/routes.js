import React, { lazy, Suspense } from 'react';
import { useRoutes,Outlet } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import menuConfig from '../data/menu.json';
import Login from '../pages/LoginPage';
import PrivateRoute from './PrivateRoute';
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';

// 动态加载 + loading
const withLoading = (Component) => (props) => {
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

// 所有页面组件映射
const componentMap = {
  DashboardPage: lazy(() => import("../pages/DashboardPage")),
  UserManage: lazy(() => import("../pages/UserPage")),
  MerchantPage: lazy(() => import("../pages/MerchantPage")),
  // 预审
  JournalPage: lazy(() => import("../pages/check/JournalPage")),
  ManuscriptPage: lazy(() => import("../pages/check/ManuscriptPage")),
  CertificationPage: lazy(() => import("../pages/check/CertificationPage")),
  // 查重
  ImagetwinPage: lazy(() => import("../pages/scan/ImagetwinPage")),
  IthenciatePage: lazy(() => import("../pages/scan/IthenciatePage")),
  SangerPage: lazy(() => import("../pages/scan/SangerPage")),
  // 推荐
  RecommendPage: lazy(() => import("../pages/recommend/RecommendPage")),
  // 综述
  OverviewPage: lazy(() => import("../pages/overview/OverviewPage")),
  // 支付
  OrderPage: lazy(() => import("../pages/pay/OrderPage")),
  StatisticsPage: lazy(() => import("../pages/pay/StatisticsPage")),
  // 测试
  TestSubManage1: lazy(() => import("../pages/test/TestSubManage1")),
  TestSubManage2: lazy(() => import("../pages/test/TestSubManage2")),
  TestPage: lazy(() => import("../pages/test/TestPage")),
  // 通用空容器 (带 Outlet)
  LayoutOutlet: () => <Outlet />,
};


// 生成路由
const generateRoutes = (menus) =>
  menus
    .map((item, index) => {
      if (!item.path) {
        console.error(`路由缺少 path: 第${index + 1}项`, item);
        return null;
      }

      // 父级路由：有 children
      if (item.children?.length) {
        const ParentComp = componentMap.LayoutOutlet;
        return {
          path: item.path,
          element: <ParentComp/>, 
          children: generateRoutes(item.children),
        };
      }


      if (!item.component) {
        console.error(`路由缺少 component: 第${index + 1}项`, item);
        return null;
      }
      const Comp = componentMap[item.component];
      if (!Comp) {
        console.error(`未找到组件：${item.component}`);
        return null;
      }
      
      // 包装
      const WrappedComp = withLoading(Comp);
      
      return {
        path: item.path,
        element: <WrappedComp />,
      };
    })
    .filter(Boolean);

// TODO 权限路由导航
const AppRoutes = () => {
  const childRoutes = generateRoutes(menuConfig);

  const routes = useRoutes([
    { path: "/login", element: <Login /> },
    // { path: "/403", element: <ForbiddenPage /> },
    {
      path: "/",
      element: <PrivateRoute />,
      children: [
        {
          path: "/",
          element: <AdminLayout />,
          children: [
            ...childRoutes,
            { path: "403", element: <ForbiddenPage /> }, 
            { path: "*", element: <NotFoundPage /> }, 
          ],
        },
      ],
    },
    { path: "*", element: <NotFoundPage /> },
  ]);

  return <Suspense fallback={null}>{routes}</Suspense>;
};

export default AppRoutes;