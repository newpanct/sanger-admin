import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，您没有权限访问此页面。"
      extra={[
        <Button type="primary" key="home" onClick={() => navigate(-1)}>
          返回上一级
        </Button>,
        <Button key="login" onClick={() => navigate("/login")}>
          去登录
        </Button>,
      ]}
    />
  );
};

export default ForbiddenPage;
