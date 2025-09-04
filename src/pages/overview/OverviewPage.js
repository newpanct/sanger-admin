import React from "react";
import { Divider, Button, Input, Space } from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import PageCard from "../../components/PageCard";
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
          <Input
            placeholder="请搜索内容"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 220 }}
          />
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
