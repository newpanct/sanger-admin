import React from "react";
import { Divider, Button, Space } from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import PageCard from "../../components/PageCard";
import SearchInput from "../../components/SearchInput";
const OverviewPage = () => {
  return (
    <PageCard
      title="综述页面"
      extraActions={
        <>
          <Button type="primary" icon={<ReloadOutlined />}>
            刷新数据
          </Button>
        </>
      }
      rightActions={
        <Space>
          <SearchInput placeholder="请搜索内容" />
          <Divider type="vertical" />
          <Button type="primary" icon={<PlusOutlined />}>
            新增
          </Button>
        </Space>
      }
    >
      综述页面(暂无数据)
    </PageCard>
  );
};

export default OverviewPage;
