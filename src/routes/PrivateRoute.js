import { useSelector } from "react-redux";
import { Navigate, Outlet, 
  // useLocation 
} from "react-router-dom";
import ForbiddenPage from "../pages/ForbiddenPage";
const PrivateRoute = ({ allow }) => {
  const token = useSelector((state) => state.auth.token);
  const role = useSelector((state) => state.auth.role); // role设置对应server下的api.js登录
  // const location = useLocation();
  // const path = location.pathname;
  // 没登录 → 跳转到登录页
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // superAdmin → 不限制，放行
  // if (role === "superAdmin") {
  //   return <Outlet />;
  // }

  // if (role === "superAdmin") {
  //   if (path.startsWith("/merchant")) {
  //     return <ForbiddenPage />;
  //   }
  //   return <Outlet />;
  // }

  // // admin → 限制放行
  // if (role === "admin") {
  //   if (path.startsWith("/merchant")) {
  //     return <ForbiddenPage />;
  //   }
  //   return <Outlet />;
  // }

  // // merchant → 限制访问
  // if (role === "merchant" && !(location.pathname.startsWith("/merchant"))) {
  //   return <ForbiddenPage />; // 无权限 → 跳转403页面
  // }

  
  if (allow && !allow.includes(role)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
};

export default PrivateRoute;
