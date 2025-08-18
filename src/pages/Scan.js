import { Outlet } from 'react-router-dom'; 
const Scan = () => {
  return (
    <>
      <Outlet /> {/* 用于渲染子路由内容 */}
    </>
  );
};

export default Scan;