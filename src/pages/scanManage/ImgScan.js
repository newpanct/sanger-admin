import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Spin,
  Tag,
  Popconfirm,
  Input,
  Modal,
  Flex,
  message,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
const { Search } = Input;

const ImgScan = () => {
  const [spinning, setSpinning] = useState(false);
  const [certificationArr, setCertificationArr] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [title, setTitle] = useState("");
  
  const [showDel,setShowDel] = useState(false);
  // 弹窗状态
  const [visible, setVisible] = useState(false);
  // 存储当前选中的标题列表
  const [selectedTitles, setSelectedTitles] = useState([]);

  // 处理标题点击事件
  const handleTitleClick = (titles) => {
    setSelectedTitles(titles);
    setVisible(true);
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
        // 处理标题数据（去除末尾逗号并分割）
        const titleList = text.slice(0, -1).split(",");
        return (
          <>
            {titleList.map((title, index) => (
              <Tag
                key={index}
                style={{ margin: "2px", cursor: "pointer" }}
                onClick={() => handleTitleClick(titleList)} // 点击时传递完整标题列表
              >
                {title}
              </Tag>
            ))}
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
          <Tag color="#B3DD00" onClick={() => message.success("待实现iw报告")}>
            <a>iw报告</a>
          </Tag>
          <Tag
            color="#3B444D"
            onClick={() => message.success("待实现桑格查重报告")}
          >
            <a>桑格查重报告</a>
          </Tag>
          {record.is_del % 2 === 1 ? (
            <Tag
              color="#cd201f"
              onClick={() => setShowDel(true)}
            >
              <a>下线</a>
            </Tag>
          ) : (
            <Tag
              color="#87d068"
              onClick={() => message.success("待实现桑格查重报告")}
            >
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

  const data = Array.from({ length: 21 }, (_, index) => ({
    nid: "id-imgs202505-" + String(index + 1),
    key: String(index + 1),
    email: String(index + 1) + "@email.com",
    title: generateTitles(index),
    updateTime: `2025-5-${index + 1}`,
    is_del: index % 2 === 0 ? 0 : 1,
  }));

  return (
    <>
      <Spin spinning={spinning} fullscreen />
        {/* 删除下线 */}
      <Modal
        title="下线操作"
        open={showDel}
        onCancel={()=>{setShowDel(false)}}
        footer={null}
      >
        <p>请选择</p>
        <Flex justify="space-evenly">
            <Button onClick={()=>{message.success("下线成功")}}>下线</Button>
            <Button onClick={()=>{message.success("删除成功")}}>删除</Button>
            <Button onClick={()=>{setShowDel(false)}}>取消</Button>
        </Flex>
      </Modal>
      <div>
        <h2>
          <span>图片管理</span>
          <Button
            type="link"
            //  onClick={handleShowAll}
          >
            全部图片
          </Button>
          <Search
            placeholder="请输入图片标题"
            //   onSearch={onSearch}
            style={{ width: 200 }}
          />
        </h2>
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
      </div>
      {/* 标题详情弹窗 */}
      <Modal
        title="标题详情"
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        width={500}
      >
        <div style={{ lineHeight: "1.8" }}>
          全部标题：
          <br />
          {selectedTitles.map((title, index) => (
            <Tag key={index} style={{ margin: "2px", cursor: "pointer" }}>
              {title}
            </Tag>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default ImgScan;
