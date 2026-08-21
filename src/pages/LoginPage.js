/* global WxLogin */
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, Tabs, message } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import "../style/login.css";
import {
  getWeChatState,
  pwdAdminLogin,
  weChatLoginStatus,
} from "../server/api";
import { useSelector } from "react-redux";
import { Space } from "antd";
import store from "../store";
import { getHomePath } from "../utils/menu";
const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [wxState, setWxState] = useState("");
  const [loginType, setLoginType] = useState("account"); // "account" | "wechat"
  const { token } = useSelector((state) => state.theme);
  const goHome = () => {
    navigate(getHomePath(store.getState().auth.menus));
  };
  // 登录提交处理
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const obj = {
        username: values.email || values.username,
        password: values.password,
      };
      const res = await pwdAdminLogin(obj);
      if (res.code === 200) {
        goHome();
        message.success(res.message || "登录成功");
      } else {
        message.warning(res.message || "登录失败");
      }
    } catch (err) {
      message.error("网络错误，请联系管理员！");
    } finally {
      setLoading(false);
    }
  };

  // 获取微信唯一标识
  const onGetWeChatState = async () => {
    try {
      const res = await getWeChatState();
      if (res.code === 200) {
        return res.data;
      } else {
        message.warning(res?.message || "微信唯一标识获取失败");
        return null;
      }
    } catch (error) {
      console.error(error);
      message.error("网络失败");
      return null;
    }
  };

  const fetchState = async () => {
    const res = await onGetWeChatState();
    if (res) {
      setWxState(res);
    }
  };

  useEffect(() => {
    if (loginType !== "wechat") {
      setWxState("");
      return;
    }

    fetchState();
  }, [loginType]);

  useEffect(() => {
    if (loginType !== "wechat" || !wxState) return;

    const container = document.getElementById("wxLoginContainer");
    if (!container) return;

    container.innerHTML = "";

    const redirect = encodeURIComponent(
      "https://sangerbox.com/api/v2/user/wechat/web/callback/admin"
    );

    new WxLogin({
      self_redirect: true,
      id: "wxLoginContainer",
      appid: "wx214d2ccc7c0b3d3b",
      scope: "snsapi_login",
      redirect_uri: redirect,
      state: wxState,
    });
  }, [loginType, wxState]);

  useEffect(() => {
    if (loginType !== "wechat" || !wxState) return;

    const timer = setInterval(async () => {
      const res = await weChatLoginStatus(wxState);

      if (res?.data.status === "confirmed") {
        goHome();
        setWxState("");
        clearInterval(timer);
        message.success(res.message || "登录成功！");
      } else if (res?.data.status === "not_admin") {
        setWxState("");
        clearInterval(timer);
        message.error(res.message || "登录失败！");
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [loginType, wxState]);

  return (
    <div className="login-container">
      {/* 左侧背景图区域 */}
      <div className="login-bg-wrapper">
        <div className="login-bg-mask">
          <Space direction="vertical">
            <img src="/assets/logo.png" alt="logo" style={{ maxWidth: 300 }} />
            <Title level={2} className="login-bg-title">
              桑格查重后台管理系统
            </Title>
            <Text className="login-bg-desc ">致 力 于 更 优 质 的 服 务</Text>
          </Space>
        </div>
      </div>

      {/* 右侧登录表单区域 */}
      <div className="login-form-wrapper">
        <div className="login-form-inner">
          {/* Tab 切换 */}
          <Tabs
            centered
            activeKey={loginType}
            onChange={(key) => setLoginType(key)}
            items={[
              // {
              //   key: "merchant",
              //   label: "商户登录",
              //   children: (
              //     <>
              //     <div className="login-logo">
              //         <div className="logo-icon">
              //           <UserOutlined
              //             style={{ fontSize: 32, color: token.colorPrimary }}
              //           />
              //         </div>
              //       </div>

              //       <Title level={3} className="login-form-title">
              //         欢迎登录
              //       </Title>
              //       <Text type="secondary" className="login-form-subtitle">
              //         请输入账号信息登录桑格管理
              //       </Text>
              //     <Form
              //       form={merchantForm}
              //       layout="vertical"
              //       onFinish={onFinish}
              //       style={{ maxWidth: 400, margin: "auto" }}
              //     >
              //       <Form.Item
              //         name="username"
              //         label="用户名"
              //         rules={[{ required: true, message: "请输入用户名" }]}
              //       >
              //         <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
              //       </Form.Item>
              //       <Form.Item
              //         name="password"
              //         label="密码"
              //         rules={[{ required: true, message: "请输入密码" }]}
              //       >
              //         <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
              //       </Form.Item>
              //       <Form.Item>
              //         <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              //           登录
              //         </Button>
              //       </Form.Item>
              //     </Form>
              //     </>
              //   ),
              // },
              {
                key: "account",
                label: "账号密码登录",
                children: (
                  <>
                    {/* 系统Logo */}
                    <div className="login-logo">
                      <div className="logo-icon">
                        <UserOutlined
                          style={{ fontSize: 32, color: token.colorPrimary }}
                        />
                      </div>
                    </div>

                    <Title level={3} className="login-form-title">
                      欢迎登录
                    </Title>
                    <Text type="secondary" className="login-form-subtitle">
                      请输入账号信息登录桑格管理
                    </Text>

                    {/* 原登录表单 */}
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={onFinish}
                      className="login-form"
                    >
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[{ required: true, message: "请输入邮箱" }]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="请输入邮箱地址"
                        />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="密码"
                        rules={[{ required: true, message: "请输入密码" }]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="请输入密码"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          block
                          loading={loading}
                        >
                          登录
                        </Button>
                      </Form.Item>
                    </Form>
                  </>
                ),
              },
              {
                key: "wechat",
                label: "微信扫码登录",
                children: (
                  <div
                    style={{
                      marginTop: 24,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div id="wxLoginContainer" />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
