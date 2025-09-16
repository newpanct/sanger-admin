import React from "react";
import {  Button, Input, Space } from "antd";
import {
  ReloadOutlined,
} from "@ant-design/icons";
import PageCard from "../../components/PageCard";
const { Search } = Input;

const SangerPage = () => {
  return (
    <PageCard
      title="桑格查重(暂无数据)"
      extraActions={
        <Button type="primary" icon={<ReloadOutlined />}>
          刷新数据
        </Button>
      }
      rightActions={
        <Space>
          <Search
            placeholder="请输入标题..."
            //   onSearch={onSearch}
            style={{ width: 220 }}
          />
        </Space>
      }
    >
      桑格查重(暂无数据)
    </PageCard>
  );
};

export default SangerPage;
