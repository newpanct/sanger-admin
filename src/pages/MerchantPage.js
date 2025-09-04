import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Table,
  Space,
  Statistic,
  Divider,
  Button,
  Skeleton,
  Input,
  Modal,
  Radio,
  message,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  UserAddOutlined,
  MailOutlined,
  UserOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import PageCard from "../components/PageCard";
import { createMerchant, findAllMerchant } from "../server/api";
const { Search } = Input;
const { Column } = Table;
const MerchantPage = () => {
  const [merchantList, setMerchantList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  useEffect(() => {
    handleFindMerchant();
  }, []);
  const handleFindMerchant = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await findAllMerchant();
      if (response.code === 200) {
        console.log("findAllMerchant", response.data);
        setMerchantList(response.data);
      }
    } catch (error) {
      const errMsg = error?.message || "获取商户数据失败，请重试";
      setErrorMsg(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBtn = async () => {
    setIsCreateModalOpen(true);
    createForm.resetFields();
  };
  // 创建商户
  const handleCreateMerchant = async () => {
    try {
      const values = await createForm.validateFields();
      const obj = {
        role: values.role,
        merchantName: values.merchantName,
        merchantEmail: values.merchantEmail,
        merchantType: values.merchantType,
      };
      const response = await createMerchant(obj);
      if (response.code === 200) {
        setIsCreateModalOpen(false);
        message.success(response.msg || `创建商户${values.merchantName}成功`);
      } else {
        message.error(response.msg || `创建商户${values.merchantName}失败`);
      }
    } catch (error) {
      message.error("创建出错");
    } finally {
    }
  };
  return (
    <PageCard
      title="商户管理"
      extraActions={
        <>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleFindMerchant}
            loading={loading}
          >
            刷新数据
          </Button>
        </>
      }
      rightActions={
        <Space>
          <Input
            placeholder="请搜索..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 220 }}
          />
          <Divider type="vertical" />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleCreateBtn}
          >
            创建商户
          </Button>
        </Space>
      }
    >
      {errorMsg ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>{errorMsg}</p>
          <Button onClick={handleFindMerchant} icon={<ReloadOutlined />}>
            重新加载
          </Button>
        </div>
      ) : (
        <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
          {merchantList.length}
        </Skeleton>
      )}
      <Modal
        title="创建商户"
        open={isCreateModalOpen}
        onOk={handleCreateMerchant}
        onCancel={() => setIsCreateModalOpen(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateMerchant}
        >
          <Form.Item
            name="merchantName"
            label="商户名"
            rules={[{ required: true, message: "请输入商户名" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入商户名"
              autoComplete="merchantName"
            />
          </Form.Item>
          <Form.Item
            name="merchantEmail"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入正确的邮箱格式" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入商户邮箱"
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            name="merchantType"
            label="商户类别"
            rules={[{ required: true, message: "请输入商户类别" }]}
          >
            <Input
              prefix={<AppstoreOutlined />}
              placeholder="请输入商户类别"
              autoComplete="merchantType"
            />
          </Form.Item>
          <Form.Item
            name="role"
            label="身份"
            rules={[{ required: true, message: "请选择商户身份" }]}
          >
            <Radio.Group>
              <Radio value="admin">admin</Radio>
              <Radio value="sangerbox">sangerbox</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </PageCard>
  );
};

export default MerchantPage;
