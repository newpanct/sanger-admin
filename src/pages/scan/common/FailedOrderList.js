import React, { useEffect, useState } from "react";
import { Button, Table, Tag, Typography, Tooltip, Modal, message } from "antd";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import PageCard from "../../../components/PageCard";
import {
  commitImagetwin,
  commitIthenticate,
  imagetwinFailedPageList,
  ithenticateFailedPageList,
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
  const [currentRecord, setCurrentRecord] = useState(null);
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
      title: "手动提交",
      align: "center",
      width: 200,
      render: (_, record) => {
        return (
          <Tooltip title="手动提交">
            <Button
              size="small"
              icon={<UploadOutlined />}
              loading={commitLoadingMap[record.id]}
              onClick={() => {
                setCurrentRecord(record);
                setCommitModalOpen(true);
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  const apiCommmit = {
    imagetwin: commitImagetwin,
    ithenticate: commitIthenticate,
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

  // 误触弹出框
  const handleCommit = async (taskId) => {
    try {
      setCommitLoadingMap((prev) => ({ ...prev, [taskId]: true }));
      const api = apiCommmit[props];
      if (!api) throw new Error("未匹配到接口");
      const res = await api(taskId);
      // const pathMap = {
      //   imagetwin: "/scan/imagetwin/abnormal-orders",
      //   ithenticate: "/scan/crosscheck/abnormal-orders",
      // };
      // const path = pathMap[props];
      // if (path) dispatch(decreaseMenuBadge(path));
      if (res?.code === 200) {
        message.success(res?.message || "手动提交成功");
        handleOrderList(pageNum, pageSize);
        const pathMap = {
          imagetwin: "/scan/imagetwin/abnormal-orders",
          ithenticate: "/scan/crosscheck/abnormal-orders",
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
      <Modal
        open={commitModalOpen}
        title="确认手动提交"
        okText="确认提交"
        cancelText="取消"
        confirmLoading={commitLoadingMap[currentRecord?.id]}
        onOk={async () => {
          if (!currentRecord) return;
          await handleCommit(currentRecord.id);
        }}
        onCancel={() => {
          setCommitModalOpen(false);
          setCurrentRecord(null);
        }}
        maskClosable={false}
        destroyOnHidden
      >
        <Typography.Text>确认要手动提交以下订单吗？</Typography.Text>

        <div style={{ marginTop: 12 }}>
          <p>
            <strong>标题：</strong>
            {currentRecord?.title}
          </p>
          <p>
            <strong>订单号：</strong>
            {currentRecord?.orderNo}
          </p>
        </div>
      </Modal>
    </PageCard>
  );
}
