import React from "react";
import { Divider, Button, Space } from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import PageCard from "../../components/PageCard";
import SearchInput from "../../components/SearchInput";
import { decreaseMenuBadge } from "../../store/menuBadgeSlice";
import { useDispatch } from "react-redux";
const RecommendPage = () => {
  const dispatch = useDispatch();
  return (
    <PageCard
      title="期刊推荐"
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
      <Button
        onClick={() => {
          dispatch(decreaseMenuBadge("/recommend/journals"));
        }}
      >
        减少红点
      </Button>
    </PageCard>
  );
};

export default RecommendPage;
