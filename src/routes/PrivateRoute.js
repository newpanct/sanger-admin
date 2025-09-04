import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoute = () => {
  const token = useSelector((state) => state.auth.token);
  const role = useSelector((state) => state.auth.role);
  const location = useLocation();
  // TODO
  // 没登录 → 跳转到登录页
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // admin → 不限制，放行
  if (role === "admin") {
    return <Outlet />;
  }

  // user → 只允许访问 /pay、/scan、/check 开头的路由
  if (
    role === "user" &&
    !(location.pathname.startsWith("/pay") ||
      location.pathname.startsWith("/scan") ||
      location.pathname.startsWith("/test") ||
      location.pathname.startsWith("/check"))
  ) {
    return <Navigate to="/403" replace />; // 无权限 → 跳转403页面
  }

  return <Outlet />;
};

export default PrivateRoute;
