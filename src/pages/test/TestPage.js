import React from "react";
import { Row, Col, Card, Statistic, Divider, Button, Input } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import PageCard from "../../components/PageCard";

const { Search } = Input;

const TestPage = () => {
  return (
    <PageCard
      title="测试页面"
      extraActions={
        <>
          <Button
            style={{ padding: "0px" }}
            type="link"
            icon={<ReloadOutlined />}
          >
            刷新数据
          </Button>
          <Divider type="vertical" />
          <Search
            placeholder="请输入搜索内容"
            allowClear
            style={{ maxWidth: 400 }}
            onSearch={(value) => console.log("搜索：", value)}
          />
        </>
      }
      rightActions={<Button type="primary">新增</Button>}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日新增用户"
              valueStyle={{ color: "#3f8600" }}
              prefix={<ArrowUpOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单数"
              value={12}
              valueStyle={{ color: "#cf1322" }}
              prefix={<ArrowDownOutlined />}
              suffix="单"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总用户数" value={12} suffix="人" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总收入" value={12} precision={2} prefix="¥" />
          </Card>
        </Col>
      </Row>
    </PageCard>
  );
};

export default TestPage;
