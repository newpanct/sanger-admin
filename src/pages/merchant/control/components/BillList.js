import React from "react";
import { Card, Table } from "antd";
import { Tag } from "antd";
import CopyableEllipsisText from "../../../../components/CopyableEllipsisText";

/**
 * 可复用账单表格卡片组件
 * @param {string} title 卡片标题
 * @param {array} dataSource 表格数据
 * @param {boolean} loading 是否加载中
 * @param {number} pageNum 当前页
 * @param {number} pageSize 每页数量
 * @param {number} total 数据总量
 * @param {function} onPageChange 页码或页大小变化回调 (page, size)
 */
export default function OrderTableCard({
  title = "账单记录",
  dataSource = [],
  loading = false,
  pageNum = 1,
  pageSize = 10,
  total = 0,
  onPageChange = () => {},
}) {
  const columns = [
    { title: "账单类型", dataIndex: "type", ellipsis: true, align: "center" },
    {
      title: "订单号",
      dataIndex: "orderNo",
      width: 240,
      align: "center",
      render: (v) => <CopyableEllipsisText text={v} />,
    },
    { title: "购买数量", dataIndex: "count", ellipsis: true, align: "center" },
    {
      title: "变动前金额",
      dataIndex: "beforeAmount",
      ellipsis: true,
      align: "center",
    },
    {
      title: "变动金额",
      dataIndex: "changeAmount",
      align: "center",
      render: (changeAmount, record) => {
        let color = "default";
        let text = changeAmount;

        switch (record.orderType) {
          case 0:
            color = "error";
            text = `扣款 ${changeAmount}`;
            break;
          case 1:
            color = "success";
            text = `充值 ${changeAmount}`;
            break;
          case 2:
            color = "error";
            text = `扣减 ${changeAmount}`;
            break;
          case 3:
            color = "processing";
            text = `充值退回 ${changeAmount}`;
            break;
          case 4:
            color = "processing";
            text = `管理员扣款 ${changeAmount}`;
            break;
          default:
            color = "default";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "变动后金额",
      dataIndex: "afterAmount",
      ellipsis: true,
      align: "center",
    },
    {
      title: "订单描述",
      dataIndex: "description",
      ellipsis: true,
      align: "center",
    },
    {
      title: "购买时间",
      dataIndex: "createTime",
      ellipsis: true,
      align: "center",
    },
  ];

  return (
    <Card size="small" title={title}>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: onPageChange,
        }}
      />
    </Card>
  );
}
