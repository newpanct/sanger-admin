import { useEffect, useState, useRef } from "react";
import PageCard from "../components/PageCard";
import Editor from "@monaco-editor/react";
import { compressEmailHtml } from "../utils/html";
import {
  Button,
  Table,
  Tag,
  Tooltip,
  Modal,
  Space,
  message,
  Row,
  Col,
  Form,
  Drawer,
  Input,
  Divider,
  Select,
} from "antd";
import {
  mailTemplateDelete,
  mailTemplatePageList,
  mailTemplateUpsert,
  getMailTemplateEnumList,
} from "../server/api";
import {
  ReloadOutlined,
  EyeOutlined,
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  FormatPainterOutlined,
} from "@ant-design/icons";
const EMAIL_HTML_TEMPLATE = `
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>模拟发送</title>
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4A90E2;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .verification-code {
            font-size: 36px;
            font-weight: bold;
            color: #4A90E2;
            margin: 30px 0;
            letter-spacing: 5px;
        }
        .info {
            background-color: #f8f9fa;
            border-left: 4px solid #4A90E2;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
        .company-name {
            font-weight: bold;
            color: #4A90E2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{server}}</h1>
        </div>
        <div class="content">
            <p>您好！</p>
            <p>您正在使用 <span class="company-name">{{subject}}</span> 的服务，</p>
            <p>请使用以下验证码完成您的操作：</p>
            
            <div class="verification-code">{{verificationCode}}</div>
            
            <div class="info">
                <p><strong>验证码类型：</strong>{{templateTypeDescription}}</p>
                <p><strong>有效时间：</strong>5分钟</p>
                <p><strong>安全提醒：</strong>请勿将验证码透露给他人</p>
            </div>
            
            <p>如非本人操作，请忽略此邮件。</p>
        </div>
        <div class="footer">
            <p>此邮件由 <span class="company-name">{{server}}</span> 系统自动发送，请勿回复。</p>
            <p>2026 {{server}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export default function EmailPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [emailType, setEmailType] = useState(null);

  const editorRef = useRef(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addLoadin, setAddLoading] = useState(false);
  const [addForm] = Form.useForm();
  const [contentHtml, setContentHtml] = useState(EMAIL_HTML_TEMPLATE);
  const [addPreviewOpen, setAddPreviewOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [customType, setCustomType] = useState("");
  const [emailTypeOptions, setEmailTypeOptions] = useState([]);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  const columns = [
    { title: "模板编号", dataIndex: "code", align: "center" },
    { title: "邮件主题", dataIndex: "subject", align: "center" },
    {
      title: "邮件类型",
      dataIndex: "type",
      align: "center",
      render: (val) => {
        const match = emailType?.find((i) => i.value === val);
        return match?.label || val;
      },
    },
    { title: "创建时间", dataIndex: "createdAt", align: "center" },
    {
      title: "操作",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditMode(true);
                setAddOpen(true);
                setCurrentRecord(record);

                addForm.setFieldsValue({
                  code: record.code,
                  type: record.type,
                  subject: record.subject,
                });

                setContentHtml(record.content);
              }}
            />
          </Tooltip>

          <Tooltip title="查看邮件模板详情">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setPreviewHtml(record.content);
                setPreviewOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="删除">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={record.deletable !== 0}
              onClick={() => {
                setCurrentRecord(record);
                setConfirmOpen(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getAllEmailType = async () => {
    const res = await getMailTemplateEnumList();
    if (res?.code === 200) {
      const options = (res.data || []).map((item) => ({
        label: item,
        value: item,
      }));

      setEmailTypeOptions(options);
      setEmailType([{ label: "所有模板类型", value: "" }, ...options]);
    }
  };

  const handleList = async (pageNum, pageSize, type) => {
    try {
      setLoading(true);
      const res = await mailTemplatePageList({
        pageNum,
        pageSize,
        type: type || undefined, // 空时不传
      });
      if (res?.code === 200) {
        setList(res?.data?.records || []);
        setTotal(res?.data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const onEmailDelete = async () => {
    try {
      setConfirmLoading(true);
      const res = await mailTemplateDelete(currentRecord.code);
      if (res?.code === 200) {
        message.success(
          res?.message || `已删除编号${currentRecord.code}成功！`
        );
        handleList(pageNum, pageSize);
        setConfirmOpen(false);
      } else {
        message.warning(
          res?.message || `删除编号${currentRecord.code}失败，请联系管理员！`
        );
      }
    } finally {
      setConfirmLoading(false);
    }
  };
  useEffect(() => {
    getAllEmailType();
  }, []);
  useEffect(() => {
    handleList(pageNum, pageSize, filterType);
  }, [pageNum, pageSize, filterType]);

  return (
    <PageCard
      title="邮件模板管理"
      extraActions={
        <Select
          allowClear
          placeholder="所有邮件类型"
          options={emailType}
          value={filterType || undefined}
          onChange={(val) => {
            setFilterType(val || "");
            setPageNum(1);
          }}
        />
      }
      rightActions={
        <>
          <Tooltip title="新增邮件模板">
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                setAddOpen(true);
              }}
            >
              新增模板
            </Button>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="刷新数据">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              disabled={!emailType?.length}
              onClick={() => handleList(pageNum, pageSize)}
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
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size);
          },
        }}
      />
      {/* 新增模板 */}
      <Drawer
        title={editMode ? "编辑邮件模板" : "新增邮件模板"}
        open={addOpen}
        width={"80%"}
        destroyOnHidden
        onClose={() => {
          setAddOpen(false);
          setEditMode(false);
          setCurrentRecord(null);
          addForm.resetFields();
          setContentHtml(EMAIL_HTML_TEMPLATE);
        }}
        extra={
          <Space>
            <Button
              onClick={() => {
                setAddOpen(false);
                addForm.resetFields();
                setContentHtml(EMAIL_HTML_TEMPLATE);
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              loading={addLoadin}
              onClick={() => addForm.submit()}
            >
              {editMode ? "保存修改" : "保存模板"}
            </Button>
          </Space>
        }
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setAddLoading(true);

              const params = {
                code: values.code, // 新增 & 编辑都用它
                type: values.type,
                subject: values.subject,
                content: compressEmailHtml(contentHtml),
              };

              const res = await mailTemplateUpsert(params);

              if (res?.code === 200) {
                message.success(
                  res?.message || (editMode ? "模板修改成功" : "新增模板成功")
                );
                getAllEmailType();
                setAddOpen(false);
                setEditMode(false);
                setCurrentRecord(null);
                addForm.resetFields();
                setContentHtml(EMAIL_HTML_TEMPLATE);
                handleList(pageNum, pageSize);
              } else {
                message.warning(res?.message || "操作失败");
              }
            } finally {
              setAddLoading(false);
            }
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="模板编号"
                name="code"
                rules={[{ required: true, message: "请输入模板编号" }]}
              >
                <Input placeholder="如：REGISTER_EMAIL" disabled={editMode} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="邮件主题"
                name="subject"
                rules={[{ required: true, message: "请输入邮件主题" }]}
              >
                <Input placeholder="如：注册成功邮件" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="邮件类型"
                name="type"
                rules={[{ required: true, message: "请选择或输入邮件类型" }]}
              >
                <Select
                  placeholder="请选择或输入邮件类型"
                  options={emailTypeOptions}
                  showSearch
                  optionFilterProp="label"
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 4px" }}>
                        <Input
                          placeholder="自定义邮件类型"
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          onPressEnter={() => {
                            if (!customType) return;

                            const exists = emailTypeOptions.some(
                              (i) => i.value === customType
                            );
                            if (!exists) {
                              const newOption = {
                                label: customType,
                                value: customType,
                              };
                              setEmailTypeOptions((prev) => [
                                ...prev,
                                newOption,
                              ]);
                            }

                            addForm.setFieldsValue({ type: customType });
                            setCustomType("");
                          }}
                        />
                        <Button
                          type="text"
                          onClick={() => {
                            if (!customType) return;

                            const exists = emailTypeOptions.some(
                              (i) => i.value === customType
                            );
                            if (!exists) {
                              const newOption = {
                                label: customType,
                                value: customType,
                              };
                              setEmailTypeOptions((prev) => [
                                ...prev,
                                newOption,
                              ]);
                            }

                            addForm.setFieldsValue({ type: customType });
                            setCustomType("");
                          }}
                        >
                          添加
                        </Button>
                        <Tag color="error">添加后可以新增或修改新的邮件类型</Tag>
                      </Space>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Monaco + 实时预览 */}
          <Form.Item
            label={
              <Space>
                邮件 HTML 模板
                <Tooltip title="自动格式化 HTML">
                  <Button
                    size="small"
                    icon={<FormatPainterOutlined />}
                    type="link"
                    onClick={() => {
                      editorRef.current
                        ?.getAction("editor.action.formatDocument")
                        ?.run();
                    }}
                  >
                    格式化
                  </Button>
                </Tooltip>
              </Space>
            }
            required
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                height:'74vh'
              }}
            >
              {/* 左侧编辑 */}
              <div style={{ flex: 1, border: "1px solid #f0f0f0" }}>
                <Editor
                  height="100%"
                  language="html"
                  value={contentHtml}
                  onChange={(v) => setContentHtml(v || "")}
                  onMount={(editor) => {
                    editorRef.current = editor;
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </div>

              {/* 右侧预览 */}
              {/* <div
                style={{
                  flex: 1,
                  border: "1px solid #f0f0f0",
                  background: "#f2f4f6",
                  overflow: "auto",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    maxWidth: 600,
                    margin: "0 auto",
                    background: "#ffffff",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: contentHtml,
                  }}
                />
              </div> */}
              <div
                style={{
                  flex: 1,
                  border: "1px solid #f0f0f0",
                  background: "#f2f4f6",
                  overflow: "auto",
                }}
              >
                <iframe
                  title="live-email-preview"
                  srcDoc={contentHtml}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "#fff",
                  }}
                />
              </div>
            </div>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 查看邮件正文 Modal */}
      <Modal
        title="邮件正文模板"
        open={previewOpen}
        footer={null}
        width={800}
        onCancel={() => setPreviewOpen(false)}
      >
        <iframe
          title="email-preview"
          srcDoc={previewHtml}
          style={{
            width: "100%",
            height: "600px",
            border: "none",
            background: "#fff",
          }}
        />
        {/* <div dangerouslySetInnerHTML={{ __html: previewHtml }} /> */}
      </Modal>

      <Modal
        open={confirmOpen}
        width={400}
        title={"确认删除"}
        onCancel={() => setConfirmOpen(false)}
        footer={[
          <Button key="back" onClick={() => setConfirmOpen(false)}>
            返回
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={confirmLoading}
            onClick={() => {
              onEmailDelete();
            }}
          >
            确认删除
          </Button>,
        ]}
      >
        <p>确认要删除该邮件模板吗？</p>
      </Modal>
    </PageCard>
  );
}
