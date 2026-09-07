import React, { useEffect, useState } from "react";
import { Button, Table, Tag, Form, Descriptions, Input, Typography, Space, Tooltip, Modal, message, Flex, theme } from "antd";
import {
  ReloadOutlined, UploadOutlined,
  RollbackOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import PageCard from "../../../components/PageCard";
import CopyableEllipsisText from "../../../components/CopyableEllipsisText";
import {
  commitImagetwin,
  commitIthenticate,
  commitDuplisee,
  imagetwinFailedPageList,
  ithenticateFailedPageList,
  dupliseeFailedPageList,
  refundExecute,
  refundReasonListAll,
  ignoreTask,
} from "../../../server/api";
import useDedupTaskStatus from "../../../hooks/useDedupTaskStatus";
import { decreaseMenuBadge } from "../../../store/menuBadgeSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const findMenuPath = (menus = [], component, parentPath = "") => {
  for (const item of menus) {
    const fullPath = parentPath
      ? `${parentPath}/${item.path}`.replace(/\/+/g, "/")
      : `/${item.path}`;
    if (item.component === component) return fullPath;
    if (item.children?.length) {
      const nested = findMenuPath(item.children, component, fullPath);
      if (nested) return nested;
    }
  }
  return null;
};

export default function FailedOrderList({ title, props }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const statusMap = useDedupTaskStatus();
  const { token } = theme.useToken();
  const authMenus = useSelector((state) => state.auth.menus);
  const refundReasonPath = findMenuPath(authMenus, "RefundReasonPage");
  const [loading, setLoading] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [commitLoadingMap, setCommitLoadingMap] = useState({});
  const [commitModalOpen, setCommitModalOpen] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [ignoreOpen, setIgnoreOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [refundForm] = Form.useForm();
  const [ignoreForm] = Form.useForm();
  const [refundLoading, setRefundLoading] = useState(false);
  const [ignoreLoading, setIgnoreLoading] = useState(false);
  const [refundReasons, setRefundReasons] = useState([]);
  const selectedReason = Form.useWatch("reason", refundForm);
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
      width: 240,
      align: "center",
      render: (orderNo) => <CopyableEllipsisText text={orderNo} />,
    },
    {
      title: "任务状态",
      width: 100,
      dataIndex: "status",
      align: "center",
      render: (status) => {
        const meta = statusMap[status];
        const text = meta?.text ?? status;
        const color = meta?.color ?? "default";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "邮箱",
      dataIndex: "email",
      width: 220,
      align: "center",
      render: (email) => <CopyableEllipsisText text={email} />,
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
      width: 280,
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
                  fetchRefundReasons();
                }}
                icon={<RollbackOutlined />}
              >退款</Button>
            </Tooltip>
            <Tooltip title="忽略">
              <Button
                icon={<EyeInvisibleOutlined />}
                loading={ignoreLoading && currentRecord?.id === record.id}
                onClick={() => {
                  setCurrentRecord(record);
                  ignoreForm.resetFields();
                  setIgnoreOpen(true);
                }}
              >忽略</Button>
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

  const taskTypeMap = {
    imagetwin: "imagetwin",
    ithenticate: "ithenticate",
    dupliSee: "duplisee",
  };

  const pathMap = {
    imagetwin: findMenuPath(authMenus, "ImagetwinAbnOrderPage"),
    ithenticate: findMenuPath(authMenus, "CrossCheckAbnOrderPage"),
    dupliSee: findMenuPath(authMenus, "DupliSeeFaidPage"),
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

  const handleIgnore = async (values) => {
    if (!currentRecord) return;
    const taskType = taskTypeMap[props];
    if (!taskType) {
      message.error("未匹配到任务类型");
      return;
    }
    try {
      setIgnoreLoading(true);
      const res = await ignoreTask({
        taskId: currentRecord.id,
        taskType,
        ignoreReason: values.ignoreReason?.trim() || undefined,
      });
      if (res?.code === 200) {
        message.success(res?.message || "忽略成功");
        handleOrderList(pageNum, pageSize);
        setIgnoreOpen(false);
        setCurrentRecord(null);
        ignoreForm.resetFields();
        const path = pathMap[props];
        if (path) dispatch(decreaseMenuBadge(path));
      } else {
        message.error(res?.message || "请联系管理员");
      }
    } catch (error) {
      console.error(error);
      message.error(error.message || "请联系管理员");
    } finally {
      setIgnoreLoading(false);
    }
  };

  const fetchRefundReasons = async () => {
    const res = await refundReasonListAll();
    if (res?.code === 200) {
      setRefundReasons(res?.data || []);
    } else {
      message.error(res?.message || "获取退款理由失败");
      setRefundReasons([]);
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
        size="middle"
        rowKey="id"
        columns={orderColumn}
        dataSource={orderList}
        loading={loading}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
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
            <CopyableEllipsisText text={currentRecord?.orderNo} />
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
          <div style={{ marginTop: -8, marginBottom: 16 }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
              <Typography.Text type="secondary">快捷选择</Typography.Text>
              {refundReasonPath ? (
                <Typography.Link
                  onClick={() => {
                    setRollbackOpen(false);
                    setCurrentRecord(null);
                    refundForm.resetFields();
                    navigate(refundReasonPath);
                  }}
                  style={{ color: token.colorPrimary }}
                >
                  自定义快捷退款原因
                </Typography.Link>
              ) : null}
            </Flex>
            {refundReasons.length > 0 ? (
              <Space wrap size={[8, 8]}>
                {refundReasons.map((item) => (
                  <Tag
                    key={item.id}
                    color={selectedReason === item.reason ? "blue" : undefined}
                    style={{ cursor: "pointer" }}
                    onClick={() => refundForm.setFieldsValue({ reason: item.reason })}
                  >
                    {item.reason}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                暂无快捷原因
                {refundReasonPath ? "，可前往管理页添加" : ""}
              </Typography.Text>
            )}
          </div>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={ignoreOpen}
        title="确认忽略"
        okText="确认忽略"
        cancelText="取消"
        confirmLoading={ignoreLoading}
        onOk={() => ignoreForm.submit()}
        onCancel={() => {
          setIgnoreOpen(false);
          setCurrentRecord(null);
          ignoreForm.resetFields();
        }}
        maskClosable={false}
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          忽略后该任务将从异常列表临时删除，确认忽略以下订单吗？
        </Typography.Paragraph>
        <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="文章标题">{currentRecord?.title || "--"}</Descriptions.Item>
          <Descriptions.Item label="订单号">
            <CopyableEllipsisText text={currentRecord?.orderNo} />
          </Descriptions.Item>
        </Descriptions>
        <Form form={ignoreForm} layout="vertical" onFinish={handleIgnore}>
          <Form.Item name="ignoreReason" label="忽略原因">
            <Input.TextArea
              rows={3}
              placeholder="选填，可填写忽略原因或备注"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageCard >
  );
}
