import React from "react";
import { Divider, Button, Input, Space } from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import PageCard from "../../components/PageCard";
import {
  setMenuBadges,
  clearMenuBadge,
  decreaseMenuBadge,
} from "../../store/menuBadgeSlice";
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
