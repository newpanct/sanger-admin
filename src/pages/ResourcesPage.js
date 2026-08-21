import { useEffect, useState } from "react";
import PageCard from "../components/PageCard";
import {
  Button,
  Divider,
  Table,
  Tooltip,
  Space,
  Modal,
  message,
  Form,
  Input,
  Upload,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  staticUploadPageList,
  uploadStaticUpload,
  deleteStaticUpload,
} from "../server/api";
const { Text } = Typography;

export default function ResourcesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDel, setOpenDel] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [addForm] = Form.useForm();
  const columns = [
    { title: "文件名", dataIndex: "customName", align: "center" },
    {
      title: "文件md5",
      dataIndex: "fileMd5",
      align: "center",
      render: (text) => <Text copyable={{ text }}>{text}</Text>,
    },
    {
      title: "文件路径",
      dataIndex: "path",
      align: "center",
      render: (path) => <Text copyable={{ path }}>{path}</Text>,
    },
    { title: "文件分类", dataIndex: "fileCategory", align: "center" },
    { title: "文件后缀", dataIndex: "fileExtension", align: "center" },
    { title: "创建时间", dataIndex: "createdTime", align: "center" },
    {
      title: "操作",
      dataIndex: "fileMd5",
      render: (_, record) => (
        <Space>
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
  const handleList = async (pageNum, pageSize) => {
    try {
      setLoading(true);
      const obj = {
        pageNum,
        pageSize,
      };
      const res = await staticUploadPageList(obj);
      if (res?.code === 200) {
        setList(res?.data?.records || []);
        setTotal(res?.data.total || 0);
      } else {
        message.error(
          res?.message || `获取资格管理数据列表失败，请联系管理员！`
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    try {
      setBtnLoading(true);
      const res = await deleteStaticUpload(currentItem.id);
      if (res?.code === 200) {
        handleList(pageNum, pageSize);
        setOpenDel(false);
        message.success(
          res?.message || `删除静态资源${currentItem.fileMd5}成功！`
        );
      } else {
        message.error(
          res?.message || `删除静态资源${currentItem.fileMd5}失败！`
        );
      }
    } finally {
      setBtnLoading(false);
    }
  };

  const handleAdd = async (values) => {
    try {
      setBtnLoading(true);

      const file = values.file?.[0]?.originFileObj;
      if (!file) {
        message.error("请选择文件");
        return;
      }
      const obj = {
        customName: values.customName,
        category: values.category,
        file,
      };
      const res = await uploadStaticUpload(obj);

      if (res?.code === 200) {
        message.success(res?.message || "新增静态资源成功！");
        setOpenAdd(false);
        handleList(pageNum, pageSize);
      } else {
        message.error(res?.message || "新增静态资源失败！");
      }
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    handleList(pageNum, pageSize);
  }, [pageNum, pageSize]);
  return (
    <PageCard
      title={"资源管理"}
      rightActions={
        <>
          <Tooltip title={"新增静态文件"}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setOpenAdd(true);
                addForm.resetFields();
              }}
            >
              新增静态文件
            </Button>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title={"刷新数据"}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                handleList(pageNum, pageSize);
              }}
            >
              刷新数据
            </Button>
          </Tooltip>
        </>
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
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size);
          },
        }}
      />
      <Modal
        title={"删除静态文件"}
        open={openDel}
        onCancel={() => setOpenDel(false)}
        onOk={handleDelete}
        destroyOnHidden
        okText="确认删除"
        okButtonProps={{
          danger: true,
          loading: btnLoading,
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
            您确定要删除静态文件
            <span style={{ fontWeight: 600 }}>{currentItem.fileMd5}</span>吗？
          </div>
        </Space>
      </Modal>
      <Modal
        title={"新增静态文件"}
        open={openAdd}
        confirmLoading={btnLoading}
        onCancel={() => setOpenAdd(false)}
        onOk={() => addForm.submit()}
        okText="确认新增"
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            label="自定义名称"
            name="customName"
            rules={[{ required: true, message: "请输入自定义文件名称" }]}
            normalize={(v) => v?.trim()}
          >
            <Input placeholder="请输入自定义文件名称" />
          </Form.Item>

          <Form.Item
            label="文件分类"
            name="category"
            rules={[{ required: true, message: "请输入文件用途或分类" }]}
            normalize={(v) => v?.trim()}
          >
            <Input placeholder="请输入文件用途或分类" />
          </Form.Item>

          <Form.Item
            label="文件"
            name="file"
            rules={[{ required: true, message: "请选择文件" }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </PageCard>
  );
}
