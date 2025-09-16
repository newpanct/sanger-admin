import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Spin,
  Tag,
  Input,
  Modal,
  Image,
  message,
  Flex,
} from "antd";
import {  ReloadOutlined } from "@ant-design/icons";
import PageCard from "../../components/PageCard";
const { Search } = Input;

const SangerPage = () => {
  const [spinning, setSpinning] = useState(false);
  const [certificationArr, setCertificationArr] = useState([]); // data 数组数据
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [title, setTitle] = useState("");

  const [showDel, setShowDel] = useState(false);

  // 弹窗状态
  const [visible, setVisible] = useState(false);
  // 存储当前选中的标题列表
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedResult, setSelectedResult] = useState("");

  const handleViewResult = (record) => {
    setVisible(true);
    setSelectedResult(record.result); // 存储当前选中的结果内容
  };

  const columns = [
    {
      title: "编号",
      dataIndex: "nid",
      key: "nid",
      align: "center",
    },
    {
      title: "标题",
      key: "title",
      dataIndex: "title",
      align: "center",
      ellipsis: true,
      render: (text) => {
        return (
          <>
            <Tag>{text}</Tag>
          </>
        );
      },
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "日期",
      dataIndex: "updateTime",
      key: "updateTime",
      align: "center",
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      render: (_, record) => (
        <>
          <Tag color="#1677ff" onClick={handleViewResult}>
            <a>查看结果</a>
          </Tag>
          {record.is_del % 2 === 1 ? (
            <Tag color="#ff4d4f" onClick={() => setShowDel(true)}>
              <a>下线</a>
            </Tag>
          ) : (
            <Tag color="#1677ff" onClick={() => message.success("上线")}>
              {/* <a>{record}</a> */}
              <a>上线</a>
            </Tag>
          )}
        </>
      ),
    },
  ];

  const generateTitles = (count) => {
    count = count + 1;
    if (typeof count !== "number" || count < 1 || !Number.isInteger(count)) {
      throw new Error("count 必须为正整数");
    }

    const titles = [];
    for (let i = 1; i <= count; i++) {
      titles.push(`标题${i}`);
    }

    return titles.join(",") + ",";
  };

  const data = Array.from({ length: 31 }, (_, index) => ({
    nid: "id-thesis202505-" + String(index + 1),
    key: String(index + 1),
    email: String(index + 1) + "@email.com",
    title: "title-" + String(index + 1),
    updateTime: `2025-5-${index + 1}`,
    is_del: index % 2 === 0 ? 0 : 1,
  }));

  return (
    <PageCard
      title="ithenticate(暂无数据)"
      extraActions={
        <Button type="primary" icon={<ReloadOutlined />}>
          刷新数据
        </Button>
      }
      rightActions={
        <Space>
          <Search
            placeholder="请输入标题..."
            //   onSearch={onSearch}
            style={{ width: 220 }}
          />
        </Space>
      }
    >
      <Spin spinning={spinning} fullscreen />
      <Table
        rowKey="nid"
        columns={columns}
        dataSource={data}
        bordered
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "15"],
        }}
      />
      <Modal
        title="论文结果详情"
        open={visible}
        okText="链接"
        onOk={() => {
          message.info("链接接口");
        }}
        onCancel={() => setVisible(false)}
        // footer={null}
        width={800}
      >
        <p>
          本链接为临时链接，一共还可以获取n次，点击链接后进入如图网页，可以下载pdf版报告至本地电脑
        </p>
        <Image src="/images/history.png" alt="viewImg" />
      </Modal>

      {/* 删除下线 */}
      <Modal
        title="下线操作"
        open={showDel}
        onCancel={() => {
          setShowDel(false);
        }}
        footer={null}
      >
        <p>请选择</p>
        <Flex justify="space-evenly">
          <Button
            color="danger"
            variant="solid"
            onClick={() => {
              message.success("下线成功");
            }}
          >
            下线
          </Button>
          <Button
            color="danger"
            variant="solid"
            onClick={() => {
              message.success("删除成功");
            }}
          >
            删除
          </Button>
          <Button
            onClick={() => {
              setShowDel(false);
            }}
          >
            取消
          </Button>
        </Flex>
      </Modal>
    </PageCard>
  );
};

export default SangerPage;
