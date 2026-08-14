import React, { useEffect, useState } from "react";
import { Button, Table, Tag, Form, Descriptions, Input, Typography, Space, Tooltip, Modal, message } from "antd";
import {
  ReloadOutlined, UploadOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import PageCard from "../../../components/PageCard";
import {
  commitImagetwin,
  commitIthenticate,
  commitDuplisee,
  imagetwinFailedPageList,
  ithenticateFailedPageList,
  dupliseeFailedPageList,
  refundExecute
} from "../../../server/api";
import { decreaseMenuBadge } from "../../../store/menuBadgeSlice";
import { useDispatch } from "react-redux";

export default function FailedOrderList({ title, props }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [commitLoadingMap, setCommitLoadingMap] = useState({});
  const [commitModalOpen, setCommitModalOpen] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [refundForm] = Form.useForm();
  const [refundLoading, setRefundLoading] = useState(false);
  const orderColumn = [
    {
      title: "标题",
      width: 200,
      dataIndex: "title",
      align: "center",
      ellipsis: true,
    },
    {
      title: "创建时间",
      width: 200,
      dataIndex: "createTime",
      align: "center",
    },
    {
      title: "订单号",
      dataIndex: "orderNo",
      align: "center",
      render: (orderNo) => {
        return (
          <Typography.Paragraph copyable style={{ margin: "0" }}>
            {orderNo}
          </Typography.Paragraph>
        );
      },
    },
    {
      title: "支付状态",
      dataIndex: "payStatus",
      width: 100,
      align: "center",
      render: (status) => {
        const statusMap = {
          1: { text: "成功", color: "success" },
          0: { text: "失败", color: "error" },
        };
        const { text, color } = statusMap[status] || {
          text: status,
          color: "default",
        };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "邮箱",
      dataIndex: "email",
      align: "center",
      ellipsis: true,
      render: (orderNo) => {
        return (
          <Typography.Paragraph copyable style={{ margin: "0" }}>
            {orderNo}
          </Typography.Paragraph>
        );
      },
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      align: "center",
    },
    {
      title: "错误信息",
      width: 200,
      dataIndex: "remark",
      align: "center",
      render: (remark) => {
        return <>{remark ? remark : "提交失败"}</>;
      },
    },
    {
      title: "操作",
      align: "center",
      width: 200,
      render: (_, record) => {
        return (
          <Space>
            <Tooltip title="手动提交">
              <Button
                icon={<UploadOutlined />}
                loading={commitLoadingMap[record.id]}
                onClick={() => {
                  setCurrentRecord(record);
                  setCommitModalOpen(true);
                }}
              >提交</Button>
            </Tooltip>
            <Tooltip title="退款">
              <Button
                loading={commitLoadingMap[record.id]}
                onClick={() => {
                  setCurrentRecord(record);
                  setRollbackOpen(true);
                }}
                icon={<RollbackOutlined />}
              >退款</Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const apiCommmit = {
    imagetwin: commitImagetwin,
    ithenticate: commitIthenticate,
    dupliSee: commitDuplisee,
  };

  const handleOrderList = async (page = pageNum, size = pageSize) => {
    try {
      setLoading(true);
      const params = {
        pageNum: page,
        pageSize: size,
      };
      let response;
      if (props === "imagetwin") {
        response = await imagetwinFailedPageList(params);
      } else if (props === "ithenticate") {
        response = await ithenticateFailedPageList(params);
      } else if (props === "dupliSee") {
        response = await dupliseeFailedPageList(params);
      }

      if (response && response.code === 200) {
        const data = response.data || {};
        setOrderList(data.records || []);
        setTotal(data.total || 0);
      } else {
        message.error("数据加载失败，请联系管理员");
      }
    } catch (error) {
      console.error(error);
      message.error("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async (taskId) => {
    try {
      setCommitLoadingMap((prev) => ({ ...prev, [taskId]: true }));
      const api = apiCommmit[props];
      if (!api) throw new Error("未匹配到接口");
      const res = await api(taskId);
      if (res?.code === 200) {
        message.success(res?.message || "手动提交成功");
        handleOrderList(pageNum, pageSize);
        const pathMap = {
          imagetwin: "/scan/imagetwin/abnormal-orders",
          ithenticate: "/scan/crosscheck/abnormal-orders",
          dupliSee: "/scan/duplisee/abnormal-orders",
        };
        setCommitModalOpen(false);
        setCurrentRecord(null);
        const path = pathMap[props];
        if (path) dispatch(decreaseMenuBadge(path));
      } else {
        message.error(res?.message || "请联系管理员");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCommitLoadingMap((prev) => ({ ...prev, [taskId]: false }));
    }
  };



  const handleRollback = async (values) => {
    if (!currentRecord) return;
    try {
      setRefundLoading(true);
      const params = {
        orderNo: currentRecord.orderNo,
        email: currentRecord.email,
        reason: values.reason,
        password: values.password,
        refundAmount: 1,
      };
      const res = await refundExecute(params);
      if (res?.code === 200) {
        message.success(res?.message || "退款成功");
        handleOrderList(pageNum, pageSize);
        setRollbackOpen(false);
        setCurrentRecord(null);
        refundForm.resetFields();
      } else {
        message.error(res?.message || "请联系管理员");
      }
    } catch (error) {
      console.error(error);
      message.error(error.message || "请联系管理员");
    } finally {
      setRefundLoading(false);
    }
  };

  useEffect(() => {
    handleOrderList(1, pageSize);
  }, []);

  return (
    <PageCard
      title={title}
      rightActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => handleOrderList(1, pageSize)}
        >
          刷新数据
        </Button>
      }
    >
      <Table
        rowKey="id"
        columns={orderColumn}
        dataSource={orderList}
        loading={loading}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size);
            handleOrderList(page, size);
          },
        }}
      />
      {/* 1. 优化确认提交 Modal：使用 Descriptions 替代原生标签，样式更统一 */}
      <Modal
        open={commitModalOpen}
        title="确认手动提交"
        okText="确认提交"
        cancelText="取消"
        confirmLoading={commitLoadingMap[currentRecord?.id]}
        onOk={() => currentRecord && handleCommit(currentRecord.id)}
        onCancel={() => {
          setCommitModalOpen(false);
          setCurrentRecord(null);
        }}
        maskClosable={false}
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          确认要手动提交以下订单吗？此操作将重新发起检测。
        </Typography.Paragraph>

        {/* 使用 Ant Design 的 Descriptions 组件，排版更美观 */}
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="文章标题">{currentRecord?.title || '-'}</Descriptions.Item>
          <Descriptions.Item label="订单号">
            <Typography.Text copyable>{currentRecord?.orderNo || '-'}</Typography.Text>
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* 2. 优化退款 Modal：将 Form 与 Modal 更好地解耦，统一重置逻辑 */}
      <Modal
        open={rollbackOpen}
        title="确认退款"
        okText="确认退款"
        cancelText="取消"
        confirmLoading={refundLoading}
        onOk={() => refundForm.submit()}
        onCancel={() => {
          setRollbackOpen(false);
          setCurrentRecord(null);
          refundForm.resetFields(); // 统一在这里重置表单
        }}
        maskClosable={false}
        destroyOnHidden
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>
            订单邮箱：<Tag color="blue">{currentRecord?.email}</Tag>
          </Typography.Text>
          <br />
          <Typography.Text style={{ marginTop: 8, display: 'inline-block' }}>
            订单标题：<Tag color="blue">{currentRecord?.title}</Tag>
          </Typography.Text>
          <br />
          <Typography.Text style={{ marginTop: 8, display: 'inline-block' }}>
            订单编号：<Tag color="blue">{currentRecord?.orderNo}</Tag>
          </Typography.Text>
        </div>

        <Form
          form={refundForm}
          layout="vertical"
          onFinish={(values) => handleRollback(values)}
        >
          <Form.Item
            name="reason"
            label="退款原因"
            rules={[{ required: true, message: "请输入退款原因" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请详细说明退款原因..."
              maxLength={200}
              showCount
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>
    </PageCard >
  );
}
