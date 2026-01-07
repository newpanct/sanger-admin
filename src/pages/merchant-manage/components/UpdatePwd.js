import { LockOutlined } from "@ant-design/icons";
import { Form, Input, Modal, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { updateMerchantPassword } from "../../../server/api";

export default function UpdatePwd({ open, merchant, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const obj = {
        id: merchant?.id,
        password: values.confirmPassword,
      };
      const res = await updateMerchantPassword(obj);
      if (res?.code === 200) {
        message.success(
          res?.message || `修改商户${merchant?.merchantName}密码成功！`
        );
        onCancel();
      } else {
        message.error(
          res?.message || `修改商户${merchant?.merchantName}密码失败！`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);
  return (
    <Modal
      title={
        <>
          修改当前商户
          <Typography.Text type="danger" strong style={{ fontSize: "inherit" }}>
            {merchant?.merchantName}
          </Typography.Text>
          的密码
        </>
      }
      open={open}
      onCancel={onCancel}
      okText="修改"
      cancelText="取消"
      confirmLoading={loading}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Form.Item
          name="password"
          label="新密码"
          rules={[
            { required: true, message: "请输入新密码" },
            { min: 6, message: "密码长度不得少于6位" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={["password"]}
          rules={[
            { required: true, message: "请确认新密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请再次输入新密码"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
