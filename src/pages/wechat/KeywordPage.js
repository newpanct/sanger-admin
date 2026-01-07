import React, { useEffect, useState, useCallback } from "react";
import {
  Divider,
  Button,
  Input,
  Space,
  Tooltip,
  Tag,
  Table,
  Modal,
  Form,
  Select,
  Radio,
  message,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import PageCard from "../../components/PageCard";
import Highlighter from "react-highlight-words";
import { debounce } from "lodash";
import {
  replyPageList,
  addKeyword,
  updateKeyword,
  deleteKeyword,
} from "../../server/api";
export default function KeywordPage() {
  const [form] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDel, setOpenDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openType, setOpenType] = useState(null);
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [currentItem, setCurrentItem] = useState({});
  const [debouncedCardKey, setDebouncedCardKey] = useState("");
  const columns = [
    {
      title: "关键词",
      dataIndex: "keyword",
      align: "center",
      render: (text) => (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[debouncedCardKey]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ),
    },
    { title: "消息类型", dataIndex: "msgType", align: "center" },
    { title: "回复内容", dataIndex: "replyContent", align: "center" },
    {
      title: "状态",
      dataIndex: "status",
      align: "center",
      render: (_, record) => {
        if (record.status === 1) {
          return <Tag color="success">启用</Tag>;
        }
        if (record.status === 0) {
          return <Tag color="error">禁用</Tag>;
        }
        return <Tag color="processing">{record.status}</Tag>;
      },
    },
    { title: "创建时间", dataIndex: "createTime", align: "center" },
    {
      title: "操作",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="修改">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setOpen(true);
                setOpenType("update");
                setCurrentItem(record);
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setCurrentItem(record);
                setOpenDel(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleList = async (pageNum, pageSize, keyword) => {
    try {
      setLoading(true);
      const obj = {
        pageNum,
        pageSize,
        keyword,
      };
      const res = await replyPageList(obj);
      if (res?.code === 200) {
        setList(res?.data.records);
        setTotal(res?.data.total);
      } else {
        message.error(res.message || "请联系管理员！");
      }
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useCallback(
    debounce((val) => {
      setDebouncedCardKey(val);
      setPageNum(1);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
    debounceSearch(e.target.value);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await deleteKeyword(currentItem.id);
      if (res?.code === 200) {
        setOpenDel(false);
        handleList(pageNum, pageSize, debouncedCardKey);
        message.success(
          res?.message || `删除关键字${currentItem.keyword}成功！`
        );
      } else {
        message.error(res?.message || `删除关键字${currentItem.keyword}失败！`);
      }
    } finally {
      setDeleting(false);
    }
  };

  const apiMap = {
    add: addKeyword,
    update: updateKeyword,
  };

  const handleAddOrUpdate = async (values) => {
    try {
      setAdding(true);

      const api = apiMap[openType];

      const params = {
        id: openType === "update" ? currentItem.id : undefined,
        keyword: values.keyword,
        reply: values.reply,
        status: values.status,
        msgType: values.msgType,
      };

      const res = await api(params);

      if (res?.code === 200) {
        message.success(
          openType === "add" ? "新增关键词成功" : "修改关键词成功"
        );
        setOpen(false);
        form.resetFields();
        handleList(pageNum, pageSize, debouncedCardKey);
      } else {
        message.error(res?.message || "操作失败");
      }
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    handleList(pageNum, pageSize, debouncedCardKey);
  }, [pageNum, pageSize, debouncedCardKey]);

  useEffect(() => {
    if (!open) return;
  
    if (openType === "add") {
      form.resetFields();
    }
  
    if (openType === "update") {
      form.setFieldsValue({
        keyword: currentItem.keyword,
        reply: currentItem.replyContent,
        status: currentItem.status,
        msgType: currentItem.msgType,
      });
    }
  }, [open, openType, currentItem, form]);
  
  return (
    <PageCard
      title="关键词回复"
      extraActions={
        <Input
          placeholder="请搜索关键词..."
          prefix={<SearchOutlined />}
          allowClear
          value={keyword}
          onChange={handleSearchChange}
        />
      }
      rightActions={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setOpen(true);
              setOpenType("add");
              setCurrentItem({});
            }}
          >
            新增关键词
          </Button>
          <Divider type="vertical" />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => handleList(pageNum, pageSize, debouncedCardKey)}
          >
            刷新数据
          </Button>
        </Space>
      }
    >
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
      <Modal
        title={`删除关键词${currentItem.keyword}`}
        width={400}
        open={openDel}
        onOk={handleDelete}
        onCancel={() => setOpenDel(false)}
        destroyOnHidden
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{
          danger: true,
          loading: deleting,
        }}
      >
        <Space
          direction="vertical"
          size="middle"
          align="center"
          style={{ width: "100%", padding: "16px 0" }}
        >
          <ExclamationCircleOutlined
            style={{ fontSize: "48px", color: "#ff4d4f" }}
          />

          <div>
            您确定要删除关键字
            <span style={{ fontWeight: 600 }}>{currentItem.keyword}</span>吗？
          </div>
        </Space>
      </Modal>
      <Modal
        title={openType === "add" ? "新增关键词" : "修改关键词"}
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={adding}
        okText={openType === "add" ? "确认新增" : "确认修改"}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Form.Item
            label="关键词"
            name="keyword"
            rules={[{ required: true, message: "请输入关键词" }]}
          >
            <Input placeholder="请输入关键词" />
          </Form.Item>

          <Form.Item
            label="回复内容"
            name="reply"
            rules={[{ required: true, message: "请输入回复内容" }]}
          >
            <Input.TextArea rows={4} placeholder="请输入回复内容" />
          </Form.Item>

          <Form.Item
            label="消息类型"
            name="msgType"
            rules={[{ required: true, message: "请选择消息类型" }]}
          >
          <Select
            placeholder="请选择消息类型"
            options={[
              { label: "test", value: "test" },
            ]}
          />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            initialValue={0}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value={1}>启用</Radio>
              <Radio value={0}>禁用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </PageCard>
  );
}
