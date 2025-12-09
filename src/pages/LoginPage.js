import React, {  useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import "../style/login.css";
import { pwdAdminLogin } from "../server/api";
import {  useSelector } from "react-redux";
import { Space } from "antd";
const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.theme);

  // 登录提交处理
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const obj = {
        username: values.email,
        password: values.password,
      };
      const response = await pwdAdminLogin(obj);
      console.log("res",response)
      if (response.code === 200) {
        if (response.data.isBindWechat === 0) {
          navigate("/dashboard");
        } else if (response.data.isBindWechat === 1) {
          navigate("/check/journal");
        }
        message.success(response.message || "登录成功");
      } else {
        message.warning(response.message || "登录失败");
      }
    } catch (err) {
      message.error("网络错误，请联系管理员");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
      {/* 左侧背景图区域 */}
      <div className="login-bg-wrapper">
        <div
          className="login-bg-mask"
          style={
            {
              // background:token.colorPrimary
            }
          }
        >
          <Space direction="vertical">
            <img src="/assets/logo.png" alt="logo" style={{ maxWidth: 300 }} />
            <Title level={2} className="login-bg-title">
              桑格查重后台管理系统
            </Title>
            <Text className="login-bg-desc">致 力 于 更 优 质 的 服 务</Text>
          </Space>
        </div>
      </div>

      {/* 右侧登录表单区域 */}
      <div className="login-form-wrapper">
        <div className="login-form-inner">
          {/* 系统Logo */}
          <div className="login-logo">
            <div className="logo-icon">
              <UserOutlined
                style={{ fontSize: 32, color: token.colorPrimary }}
              />
            </div>
          </div>

          {/* 表单标题 */}
          <Title level={3} className="login-form-title">
            欢迎登录
          </Title>
          <Text type="secondary" className="login-form-subtitle">
            请输入账号信息登录桑格管理
          </Text>

          {/* 登录表单 */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="login-form"
          >
            {/* 邮箱输入框 */}
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ required: true, message: "请输入邮箱" }]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                prefix={<MailOutlined className="input-icon" />}
                placeholder="请输入邮箱地址"
                className="login-input"
                autoComplete="email"
              />
            </Form.Item>

            {/* 密码输入框 */}
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: "请输入密码" }]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="请输入密码"
                className="login-input"
                autoComplete="current-password"
              />
            </Form.Item>

            {/* 登录按钮 */}
            <Form.Item wrapperCol={{ span: 24 }} className="login-item">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="login-btn"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
