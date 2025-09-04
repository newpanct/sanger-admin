import React, { useEffect, useState } from "react";
import { MailOutlined, LockOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Form,
  Modal,
  Skeleton,
  Popconfirm,
  Radio,
  Divider,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
  UserOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  findAdminUser,
  addAdminUser,
  deleteAdminUser,
  updateAdminUser,
} from "../server/api";
import PageCard from "../components/PageCard";

const { Column } = Table;

const UserManage = () => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchUser = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await findAdminUser();
      const userData = response?.data || [];
      const userList = userData.sort((a, b) => b.id - a.id);
      setUserList(userList);
      if (userData.length === 0) {
        message.info("当前暂无用户数据");
      }
    } catch (error) {
      const errMsg = error?.message || "获取用户数据失败，请重试";
      setErrorMsg(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleEdit = (record) => {
    setEditingUser(record);
    setIsEditModalOpen(true);
    editForm.setFieldsValue({
      email: record.email,
      username: "",
      oldPwd: "",
      newPwd: "",
      confirmPwd: "",
      userType: undefined,
    });
  };
  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();

      if (values.newPwd !== values.confirmPwd) {
        message.error("两次输入的新密码不一致");
        return;
      }

      const payload = {
        username: values.username,
        email: values.email,
        oldPwd: values.oldPwd,
        newPwd: values.newPwd,
        userType: values.userType,
      };

      const response = await updateAdminUser(payload);
      if (response?.code === 200) {
        message.success(response?.msg || "用户修改成功");
        setIsEditModalOpen(false);
        fetchUser();
      } else {
        message.error(response?.msg || "修改失败");
      }
    } catch (err) {
      // console.error(err);
      message.error("修改提交出错");
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteAdminUser(record.email);
      if (response?.code === 200) {
        setUserList(userList.filter((_) => _.email !== record.email));
        message.success(response?.msg || `删除用户${record.email}成功`);
      } else {
        message.error(response?.msg || "删除失败");
      }
    } catch (err) {
      message.error("删除错误");
    }
  };

  /** 创建用户弹窗 **/
  const handleAdd = () => {
    setIsAddModalOpen(true);
    createForm.resetFields();
  };

  const handleAddSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const response = await addAdminUser(values);
      if (response?.code === 200) {
        message.success(response?.msg || `创建用户${values.email}成功`);
        setIsAddModalOpen(false);
        fetchUser();
      } else {
        message.error(response?.msg || `创建用户${values.email}失败`);
      }
    } catch (err) {
      message.error("创建错误");
    }
  };

  const filteredUsers = userList.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <PageCard
      title="用户管理"
      extraActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchUser}
          loading={loading}
        >
          刷新数据
        </Button>
      }
      rightActions={
        <Space>
          <Input
            placeholder="搜索用户名或邮箱"
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
          />
          <Divider type="vertical" />
          <Button type="primary" icon={<UserAddOutlined />} onClick={handleAdd}>
            创建用户
          </Button>
        </Space>
      }
    >
      {errorMsg ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>{errorMsg}</p>
          <Button onClick={fetchUser} icon={<ReloadOutlined />}>
            重新加载
          </Button>
        </div>
      ) : (
        <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
          <Table
            bordered
            rowKey="id"
            dataSource={filteredUsers}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 位用户`,
            }}
          >
            <Column title="id" dataIndex="id" key="id" align="center" />
            <Column
              title="用户名"
              dataIndex="username"
              key="username"
              align="center"
            />
            <Column
              title="邮箱"
              dataIndex="email"
              key="email"
              align="center"
              render={(text) => <span>{text || "-"}</span>}
            />
            <Column
              title="类别"
              dataIndex="user_type"
              key="user_type"
              align="center"
              filters={[
                { text: "超级管理员", value: -1 },
                { text: "普通管理员", value: 1 },
              ]}
              onFilter={(value, record) => record.user_type === value}
              render={(role) => {
                let tagColor = "";
                let txt = "";
                if (role === -1) {
                  tagColor = "success";
                  txt = "超级管理员";
                } else if (role === 1) {
                  tagColor = "processing";
                  txt = "普通管理员";
                }
                return tagColor ? <Tag color={tagColor}>{txt}</Tag> : null;
              }}
            />
            <Column
              title="创建时间"
              dataIndex="create_time"
              key="create_time"
              align="center"
              sorter={(a, b) => {
                if (!a.create_time) return 1;
                if (!b.create_time) return -1;
                return new Date(a.create_time) - new Date(b.create_time);
              }}
              render={(time) => <span>{time ? time : "-"}</span>}
            />

            <Column
              title="更新时间"
              dataIndex="update_time"
              key="update_time"
              align="center"
              sorter={(a, b) => {
                if (!a.update_time) return 1;
                if (!b.update_time) return -1;
                return new Date(a.update_time) - new Date(b.update_time);
              }}
              render={(time) => <span>{time ? time : "-"}</span>}
            />
            <Column
              title="操作"
              key="action"
              align="center"
              render={(_, record) => (
                <Space size="middle">
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title={`${record.email}`}
                    description={`删除后不可恢复`}
                    onConfirm={() => handleDelete(record)}
                    onCancel={() => message.info("已取消删除")}
                    okText="删除"
                    okType="danger"
                    cancelText="取消"
                  >
                    <Button
                      variant="link"
                      color="danger"
                      disabled={record.user_type === -1}
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              )}
            />
          </Table>
        </Skeleton>
      )}
      {/* 新增用户弹窗 */}
      <Modal
        title="创建用户"
        open={isAddModalOpen}
        onOk={handleAddSubmit}
        onCancel={() => setIsAddModalOpen(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={createForm} layout="vertical" onFinish={handleAddSubmit}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入正确的邮箱格式" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码长度至少为6位" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="new-password"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户弹窗 */}
      <Modal
        title="修改用户"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="修改"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          {/* 邮箱：只读 */}
          <Form.Item name="email" label="邮箱" rules={[{ required: true }]}>
            <Input prefix={<MailOutlined />} disabled />
          </Form.Item>

          {/* 用户名 */}
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          {/* 旧密码 */}
          <Form.Item
            name="oldPwd"
            label="旧密码"
            rules={[{ required: true, message: "请输入旧密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入旧密码"
              autoComplete="current-password"
            />
          </Form.Item>

          {/* 新密码 */}
          <Form.Item
            name="newPwd"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码长度至少为6位" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
              autoComplete="new-password"
            />
          </Form.Item>

          {/* 确认新密码 */}
          <Form.Item
            name="confirmPwd"
            label="确认新密码"
            dependencies={["newPwd"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPwd") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
              { required: true, message: "确认新密码" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请确认新密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="userType"
            label="类别"
            rules={[{ required: true, message: "请选择用户类别" }]}
          >
            <Radio.Group>
              <Radio value={1}>普通管理员</Radio>
              <Radio value={-1}>超级管理员</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </PageCard>
  );
};

export default UserManage;
