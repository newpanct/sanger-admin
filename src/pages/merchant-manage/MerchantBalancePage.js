import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Space,
  Input,
  Tooltip,
  message,
  Typography,
  InputNumber,
  Form,
  Modal,
} from "antd";
import Highlighter from "react-highlight-words";
import PageCard from "../../components/PageCard";
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import {
  getPermissionList,
  merchantAccountAdd,
  merchantAccountDeduct,
} from "../../server/api";
export default function MerchantBalancePage() {
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [merchantName, setMerchantName] = useState("");
  const [currentMerchant, setCurrentMerchant] = useState("");
  const [list, setList] = useState([]);
  const [amount, setAmount] = useState("");
  const [actionType, setActionType] = useState("add"); // add | deduct
  const [confirmLoading, setConfirmLoading] = useState(false);
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

    { title: "邮箱", dataIndex: "email", ellipsis: true, align: "center" },
    {
      title: "余额（元）",
      dataIndex: "balance",
      ellipsis: true,
      align: "center",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      ellipsis: true,
      align: "center",
    },
    {
      title: "余额修改",
      dataIndex: "createTime",
      ellipsis: true,
      align: "center",
      render: (_, record) => {
        return (
          <Space>
            <Tooltip title="增加商户余额">
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => {
                  setActionType("add");
                  setCurrentMerchant(record);
                  setAmount("");
                  setOpen(true);
                }}
              />
            </Tooltip>
            <Tooltip title="扣减商户余额">
              <Button
                size="small"
                danger
                icon={<MinusOutlined />}
                onClick={() => {
                  setActionType("deduct");
                  setCurrentMerchant(record);
                  setAmount("");
                  setOpen(true);
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
  const handleList = async (page = pageNum, size = pageSize) => {
    try {
      setLoading(true);
      const obj = {
        pageNum: page,
        pageSize: size,
        merchantName: merchantName,
      };
      const res = await getPermissionList(obj);
      if (res?.code === 200) {
        const { records = [], total = 0 } = res.data || {};
        setList(records);
        setTotal(total);
      } else {
        message.error(res?.message || "请联系管理员！");
      }
    } catch (error) {
      const errMsg = error?.message || "获取商户数据失败，请重试";
      setErrorMsg(errMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateAccount = async () => {
    try {
      setConfirmLoading(true);

      const amount = form.getFieldValue("amount");

      const obj = {
        merchantId: currentMerchant.merchantId,
        amount,
        businessType: 0,
      };

      const api =
        actionType === "add" ? merchantAccountAdd : merchantAccountDeduct;

      const res = await api(obj);

      if (res?.code === 200) {
        message.success(actionType === "add" ? "余额增加成功" : "余额扣减成功");
        setConfirmOpen(false);
        setOpen(false);
        form.resetFields();
        handleList(pageNum, pageSize);
      } else {
        message.error(res?.message || "操作失败");
      }
    } catch (error) {
      message.error("操作异常，请重试");
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    handleList(pageNum, pageSize);
  }, [pageNum, pageSize, merchantName]);
  return (
    <PageCard
      title={"余额管理"}
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
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => handleList()}
        >
          刷新数据
        </Button>
      }
    >
      {errorMsg ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>{errorMsg}</p>
          <Button onClick={() => handleList()} icon={<ReloadOutlined />}>
            重新加载
          </Button>
        </div>
      ) : (
        <Table
          rowKey="id"
          loading={loading}
          dataSource={list}
          columns={columns}
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
        title={
          <>
            {actionType === "add" ? "增加" : "扣减"}商户
            <Typography.Text type="danger" strong style={{ margin: "0 4px" }}>
              {currentMerchant?.merchantName}
            </Typography.Text>
            的余额
          </>
        }
        width={400}
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={async () => {
          try {
            await form.validateFields();
            setConfirmOpen(true); // 打开二次确认
          } catch (err) {
            // 校验失败不做任何事
          }
        }}
        okText="确认"
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ amount: undefined }}
        >
          <Typography.Paragraph>
            当前余额：
            <Typography.Text strong>
              {currentMerchant?.balance ?? 0}
            </Typography.Text>
          </Typography.Paragraph>

          <Form.Item
            label="金额（元）"
            name="amount"
            rules={[
              { required: true, message: "请输入金额" },
              {
                validator(_, value) {
                  if (value <= 0) {
                    return Promise.reject("金额必须大于 0");
                  }
                  if (
                    actionType === "deduct" &&
                    value > currentMerchant?.balance
                  ) {
                    return Promise.reject("扣减金额不能大于当前余额");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: "100%" }}
              placeholder={`请输入${
                actionType === "add" ? "增加" : "扣减"
              }金额`}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="请再次确认"
        width={400}
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onOk={handleUpdateAccount}
        confirmLoading={confirmLoading}
        okText="确认修改"
        destroyOnHidden
      >
        <Typography.Paragraph>
          您确定要
          <Typography.Text
            strong
            type={actionType === "add" ? "success" : "danger"}
          >
            {actionType === "add" ? "增加" : "扣减"}
          </Typography.Text>
          商户
          <Typography.Text strong>
            {currentMerchant?.merchantName}
          </Typography.Text>
          的余额吗？
        </Typography.Paragraph>

        <Typography.Paragraph>
          变动金额：
          <Typography.Text strong type="danger">
            ￥{form.getFieldValue("amount")}
          </Typography.Text>
        </Typography.Paragraph>
      </Modal>
    </PageCard>
  );
}
