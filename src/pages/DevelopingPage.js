import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const DevelopingPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="info"
      title="页面开发中"
      subTitle="当前页面正在开发中，请稍后再试。"
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          返回上一级
        </Button>
      }
    />
  );
};

export default DevelopingPage;
