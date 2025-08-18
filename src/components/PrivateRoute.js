// src/components/PrivateRoute.js
import { Navigate, Outlet } from 'react-router-dom';

// 私有路由：仅允许已登录用户访问
const PrivateRoute = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;