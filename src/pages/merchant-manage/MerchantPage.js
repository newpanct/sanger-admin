import React, { useEffect, useState } from "react";
import {
  Form,
  Table,
  Space,
  Divider,
  Button,
  Input,
  Modal,
  Checkbox,
  Dropdown,
  Tooltip,
  message,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  UserAddOutlined,
  MailOutlined,
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import PageCard from "../../components/PageCard";
import { merchantPageList, merchantRegister } from "../../server/api";
import UpdatePwd from "./components/UpdatePwd";
import PermissionSettings from "./components/PermissionSettings";
const MerchantPage = () => {
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [merchantList, setMerchantList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openPermiss, setOpenPermiss] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [merchantName, setMerchantName] = useState("");
  const [debouncedMerchantName, setDebouncedMerchantName] = useState("");
  const [currentMerchant, setCurrentMerchant] = useState(null);
  const [createForm] = Form.useForm();
  const merchantTypeOptions = [{ label: "查重", value: "dedup" }];
  const merchantTypeMap = merchantTypeOptions.reduce((acc, cur) => {
    acc[cur.value] = cur.label;
    return acc;
  }, {});

  const columns = [
    {
      title: "商户ID",
      dataIndex: "merchantId",
      ellipsis: true,
      align: "center",
    },
    {
      title: "商户名称",
      dataIndex: "merchantName",
      ellipsis: true,
      align: "center",
      render: (text) => (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[merchantName]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ),
    },
    { title: "商户身份", dataIndex: "role", ellipsis: true, align: "center" },
    // {
    //   title: "权限类别",
    //   dataIndex: "serviceGroups",
    //   ellipsis: true,
    //   align: "center",
    //   render: (serviceGroups) => {
    //     return (
    //       <Space wrap>
    //         {serviceGroups.map((key) => (
    //           <span key={key}>
    //             {key.serviceGroup}
    //           </span>
    //         ))}
    //       </Space>
    //     );
    //   },
    // },

    { title: "邮箱", dataIndex: "email", ellipsis: true, align: "center" },
    {
      title: "创建时间",
      dataIndex: "createTime",
      ellipsis: true,
      align: "center",
    },
    {
      title: "密码与权限",
      align: "center",
      render: (_, record) => {

        return (
          <Space>
            <Tooltip title={"修改密码"}>
              <Button
                icon={<KeyOutlined />}
                onClick={() => {
                  setCurrentMerchant(record);
                  setOpenUpdate(true);
                }}
              >
                修改密码
              </Button>
            </Tooltip>
            <Tooltip title={"权限管理"}>
              <Button
                icon={<SettingOutlined />}
                onClick={() => {
                  setCurrentMerchant(record);
                  setOpenPermiss(true);
                }}
              >
                权限管理
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handleMerchantList = async (page = pageNum, size = pageSize) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const obj = {
        pageNum: page,
        pageSize: size,
        merchantName: debouncedMerchantName,
      };
      const response = await merchantPageList(obj);
      if (response?.code === 200) {
        const { records = [], total = 0 } = response.data || {};
        setMerchantList(records);
        setTotal(total);
      } else {
        message.error(response?.message || "请联系管理员！");
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
    // createForm.setFieldsValue({
    //   serviceGroup: ["dedup"], // 默认勾选
    // });
  };

  // 创建商户
  const handleCreateMerchant = async (values) => {
    try {
      setCreateLoading(true);
      const obj = {
        merchantName: values.merchantName,
        email: values.email,
        password: values.password,
        serviceGroup: values.serviceGroup,
      };
      const response = await merchantRegister(obj);
      if (response?.code === 200) {
        setIsCreateModalOpen(false);
        message.success(
          response.message || `创建商户${values.merchantName}成功`
        );
        handleMerchantList(pageNum, pageSize);
      } else {
        message.error(response.message || `创建商户${values.merchantName}失败`);
      }
    } catch (error) {
      message.error("创建出错");
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMerchantName(merchantName);
      setPageNum(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [merchantName]);

  useEffect(() => {
    handleMerchantList(pageNum, pageSize);
  }, [pageNum, pageSize, debouncedMerchantName]);

  return (
    <PageCard
      title="商户管理"
      extraActions={
        <Input
          allowClear
          placeholder="请搜索商户名称"
          prefix={<SearchOutlined />}
          value={merchantName}
          onChange={(e) => setMerchantName(e.target.value)}
        />
      }
      rightActions={
        <>
          <Tooltip title={"创建商户"}>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleCreateBtn}
            >
              创建商户
            </Button>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title={"刷新数据"}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => handleMerchantList()}
              loading={loading}
            >
              刷新数据
            </Button>
          </Tooltip>
        </>
      }
    >
      {errorMsg ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>{errorMsg}</p>
          <Button
            onClick={() => handleMerchantList()}
            icon={<ReloadOutlined />}
          >
            重新加载
          </Button>
        </div>
      ) : (
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={merchantList}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (page, size) => {
              setPageNum(page);
              setPageSize(size);
            },
          }}
        />
      )}
      <Modal
        title="创建商户"
        open={isCreateModalOpen}
        onOk={() => createForm.submit()}
        onCancel={() => setIsCreateModalOpen(false)}
        okText="创建"
        cancelText="取消"
        confirmLoading={createLoading}
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
            name="email"
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
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码长度不得少于6位" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item name="serviceGroup" label="商户权限类别">
            <Checkbox.Group options={merchantTypeOptions} />
          </Form.Item>
        </Form>
      </Modal>
      <UpdatePwd
        open={openUpdate}
        merchant={currentMerchant}
        onCancel={() => setOpenUpdate(false)}
      />
      <PermissionSettings
        open={openPermiss}
        merchant={currentMerchant}
        onCancel={() => setOpenPermiss(false)}
        onSuccess={() => handleMerchantList(pageNum, pageSize)}
      />
    </PageCard>
  );
};

export default MerchantPage;
