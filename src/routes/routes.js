import React, { lazy, Suspense } from "react";
import { useRoutes, Outlet } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import adminMenu from "../data/menu.json";
import merchantMenu from "../data/merchantMenu.json";
import Login from "../pages/LoginPage";
import PrivateRoute from "./PrivateRoute";
import NotFoundPage from "../pages/NotFoundPage";

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
  // 商户管理
  MerchantPage: lazy(() => import("../pages/merchant-manage/MerchantPage")),
  MerchantBalancePage: lazy(() => import("../pages/merchant-manage/MerchantBalancePage")),
  // 支付
  // -- 金额统计
  PayCrossCheckPage: lazy(() => import("../pages/pay/amount-stat/PayCrossCheckPage")),
  PayImagetwinPage: lazy(() => import("../pages/pay/amount-stat/PayImagetwinPage")),
  PaySangerboxScopePage: lazy(() => import("../pages/pay/amount-stat/PaySangerboxScopePage")),
  // 查重
  // -- CrossCheckPage
  CrossCheckAbnOrderPage: lazy(() => import("../pages/scan/crosscheck/CrossCheckAbnOrderPage")),
  CrossCheckOrderPage: lazy(() => import("../pages/scan/crosscheck/CrossCheckOrderPage")),

  // -- ImagetwinPage
  ImagetwinAbnOrderPage: lazy(() => import("../pages/scan/imagetwin/ImagetwinAbnOrderPage")),
  ImagetwinOrderPage: lazy(() => import("../pages/scan/imagetwin/ImagetwinOrderPage")),

  // -- 历史订单
  HistoryAbnOrderPage: lazy(() => import("../pages/scan/history/HistoryAbnOrderPage")),
  HistoryOrderPage: lazy(() => import("../pages/scan/history/HistoryOrderPage")),

  // -- DupliSee订单
  DupliSeePage: lazy(() => import("../pages/scan/duplisee/DupliSeePage")),
  DupliSeeFaidPage: lazy(() => import("../pages/scan/duplisee/DupliSeeFaidPage")),
  
  // 优惠码
  PromoCodePage: lazy(() => import("../pages/scan/PromoCodePage")),
  // 预审
  JournalPage: lazy(() => import("../pages/check/JournalPage")),
  ManuscriptPage: lazy(() => import("../pages/check/ManuscriptPage")),
  CertificationPage: lazy(() => import("../pages/check/CertificationPage")),
  // 推荐
  RecommendPage: lazy(() => import("../pages/recommend/RecommendPage")),
  // 综述
  OverviewPage: lazy(() => import("../pages/overview/OverviewPage")),

  // 邮件
  EmailPage:lazy(()=> import("../pages/EmailPage")),

  // 资源管理
  ResourcesPage:lazy(()=> import("../pages/ResourcesPage")),
  // 资源管理
  ModelBillingPage:lazy(()=> import("../pages/ModelBillingPage")),

  // 微信公众号
  KeywordPage:lazy(()=> import("../pages/wechat/KeywordPage")),
  // 商家界面
  InvalidatedPage:lazy(()=>import("../pages/merchant/goods/InvalidatedPage")),
  PurchasePage:lazy(()=>import("../pages/merchant/control/PurchasePage")),
  InformationPage:lazy(()=>import("../pages/merchant/control/InformationPage")),
  SalesConsumptionPage:lazy(()=>import("../pages/merchant/goods/SalesConsumptionPage")),
  InventoryPage:lazy(()=>import("../pages/merchant/goods/InventoryPage")),

  // 会员管理
  MemberPage:lazy(()=>import("../pages/user/MemberPage")),
  // 通用空容器 (带 Outlet)
  LayoutOutlet: () => <Outlet />,
};

// 生成路由
const generateRoutes = (menus) =>
  menus
    .map((item, index) => {
      if (!item.path) return null;
      if (item.children?.length) {
        return {
          path: item.path,
          element: <componentMap.LayoutOutlet key={item.path} />,
          children: generateRoutes(item.children, item.path),
        };
      }

      if (!item.component) return null;
      const Comp = componentMap[item.component];
      if (!Comp) return null;

      const WrappedComp = withLoading(Comp);

      return {
        path: item.path,
        element: <WrappedComp key={item.path} />,
      };
    })
    .filter(Boolean);



//  权限路由导航
const AppRoutes = () => {
  const adminRoutes = generateRoutes(adminMenu);
  const merchantRoutes = generateRoutes(merchantMenu);
  const routes = useRoutes([
    { path: "/login", element: <Login /> },
    {
      element: <PrivateRoute allow={["admin", "superAdmin"]} />,
      children: [
        {
          path: "/",
          element: <AdminLayout />,
          children: [...adminRoutes, { path: "*", element: <NotFoundPage /> }],
        },
      ],
    },
    {
      element: <PrivateRoute allow={["merchant"]} />,
      children: [
        {
          path: "/merchant",
          element: <AdminLayout />,
          children: [...merchantRoutes, { path: "*", element: <NotFoundPage /> }],
        },
      ],
    },
    { path: "*", element: <NotFoundPage /> },
  ]);

  return <Suspense fallback={null}>{routes}</Suspense>;
};

export default AppRoutes;
