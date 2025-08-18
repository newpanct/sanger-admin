import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import '../css/login.css';
// import loginBg from '../assets/login-bg.jpg';
import { pwdAdminLogin } from '../api/admin';
const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 已登录状态判断
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  // 登录提交处理
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const obj = {
        email:values.email,
        password:values.password,
      }

      const response = await pwdAdminLogin(obj);
      console.log("登录pwdAdminLogin",response);
      if(response.code === 200){
        localStorage.setItem('isLoggedIn', 'true');
        message.success(response.msg);
        navigate('/dashboard');
      }else{
        message.warning(response.msg);
      }
    } catch (err) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 左侧背景图区域 */}
      <div className="login-bg-wrapper">
        {/* <img src={loginBg} alt="登录背景" className="login-bg" /> */}
        <div className="login-bg-mask">
          <Title level={2} className="login-bg-title">桑格查重后台管理系统</Title>
          <Text className="login-bg-desc">高效 · 安全 · 便捷</Text>
        </div>
      </div>

      {/* 右侧登录表单区域 */}
      <div className="login-form-wrapper">
        <div className="login-form-inner">
          {/* 系统Logo */}
          <div className="login-logo">
            <div className="logo-icon">
              <UserOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            </div>
          </div>

          {/* 表单标题 */}
          <Title level={3} className="login-form-title">欢迎登录</Title>
          <Text type="secondary" className="login-form-subtitle">请输入账号信息登录管理后台</Text>

          {/* 登录表单 */}
          <Form
            form={form}
            layout="vertical"
            name="login_form"
            onFinish={onFinish}
            className="login-form"
          >
            {/* 用户名输入框 */}
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ required: true, message: '请输入邮箱' }]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="请输入用户名"
                className="login-input"
                autoComplete="email"
              />
            </Form.Item>

            {/* 密码输入框 */}
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
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
            <Form.Item wrapperCol={{ span: 24 }} className='login-item'>
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
