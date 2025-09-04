import React, { useEffect, useState } from "react";
import {
  Divider,
  Space,
  Button,
  Input,
  Table,
  Skeleton,
  Popconfirm,
  Tag,
  message,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import PageCard from "../../components/PageCard";
import { findAllCheckRecords } from "../../server/api";

const { Column } = Table;
const { Search } = Input;

const OrederPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderList, setOrderList] = useState([]);

  useEffect(() => {
    handleFindOrder();
  }, []);

  const handleFindOrder = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await findAllCheckRecords();
      if (response.code === 200) {
        message.success(response.msg || "加载订单成功");
        const newOrder = response.data.iw.concat(response.data.ith);
        setOrderList(newOrder.sort((a, b) => b.id - a.id));
        const allTypes = newOrder
          .map((item) => item.type)
          .filter((type) => type !== undefined);
      } else {
        message.warning(response.msg || "加载订单失败，请稍后再试");
      }
    } catch (error) {
      message.error("网络错误");
      setErrorMsg("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageCard
      title="订单列表"
      extraActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleFindOrder}
        >
          刷新数据
        </Button>
      }
      rightActions={
        <Space>
          <Search placeholder="请输入标题..." style={{ width: 220 }} />
          <Divider type="vertical" />
          <Button type="primary" icon={<PlusOutlined />}>
            新增
          </Button>
        </Space>
      }
    >
      {errorMsg ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>{errorMsg}</p>
          <Button onClick={handleFindOrder} icon={<ReloadOutlined />}>
            重新加载
          </Button>
        </div>
      ) : (
        <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
          <Table
            bordered
            rowKey="id"
            dataSource={orderList}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个订单`,
            }}
          >
            <Column title="id" dataIndex="id" key="id" align="center" />
            <Column
              title="标题"
              dataIndex="title"
              key="title"
              align="center"
              ellipsis={true}
            />
            <Column
              title="订单号"
              dataIndex="order_no"
              key="order_no"
              align="center"
            />
            <Column
              title="订单类型"
              dataIndex="type"
              key="type"
              align="center"
              filters={[
                { text: "iw_images", value: "iw_images" },
                { text: "iw_pdf", value: "iw_pdf" },
                { text: "iw_docx", value: "iw_docx" },
                { text: "ith_text", value: "ith_text" },
                { text: "ith_document", value: "ith_document" },
              ]}
              onFilter={(value, record) => record.type === value}
              render={(role) => {
                let tagColor = "";
                let txt = "";
                if (role === "iw_images") {
                  tagColor = "#B3DD00";
                  txt = "iw_images";
                } else if (role === "iw_pdf") {
                  tagColor = "#B3DD00";
                  txt = "iw_pdf";
                } else if (role === "iw_docx") {
                  tagColor = "#B3DD00";
                  txt = "iw_docx";
                } else if (role === "ith_text") {
                  tagColor = "#0096FF";
                  txt = "ith_text";
                } else if (role === "ith_document") {
                  tagColor = "#0096FF";
                  txt = "ith_document";
                }
                return <Tag color={tagColor}>{txt}</Tag>;
              }}
            />
            <Column
              title="金额"
              dataIndex="price"
              key="price"
              align="center"
              sorter={(a, b) => b.price - a.price}
              render={(data) => (data ? data : "暂无数据")}
            />
            <Column
              title="用户/商户"
              dataIndex="email"
              key="email"
              align="center"
              ellipsis={true}
              render={(data) => (data ? data : "暂无数据")}
            />
            <Column
              title="更新时间"
              dataIndex="update_time"
              key="update_time"
              align="center"
              sorter={(a, b) =>
                new Date(a.update_time) - new Date(b.update_time)
              }
              render={(time) => <span>{time || "-"}</span>}
            />
            {/* <Column
              title="操作"
              key="action"
              align="center"
              render={(_, record) => (
                <Space size="middle">
                  <Popconfirm
                    title={`${record.order_no}`}
                    description={`删除后不可恢复`}
                    onConfirm={() => message.info("删除测试")}
                    onCancel={() => message.info("已取消删除")}
                    okText="删除"
                    okType="danger"
                    cancelText="取消"
                  >
                    <Button
                      variant="link"
                      color="danger"
                      // disabled={record.user_type === -1}
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              )}
            /> */}
          </Table>
        </Skeleton>
      )}
    </PageCard>
  );
};

export default OrederPage;
