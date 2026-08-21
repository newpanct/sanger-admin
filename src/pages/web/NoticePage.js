import { useEffect, useState, useRef } from "react";
import {
  Button,
  Table,
  Tooltip,
  Space,
  Input,
  Modal,
  Form,
  DatePicker,
  Select,
  AutoComplete,
  Descriptions,
  Tag,
  message,
  Divider,
  Typography,
  Alert,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Marquee from "react-fast-marquee";
import PageCard from "../../components/PageCard";
import {
  noticePageList,
  noticeAdd,
  noticeDelete,
  noticeGetLatestActive,
} from "../../server/api";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

// type → 样式映射（与首页 ActiveAlert 一致）
const TYPE_STYLE_MAP = {
  info: { background: "#1677ff", color: "#fff" },
  warning: { background: "#FF6B00", color: "#fff" },
  error: { background: "#ff4d4f", color: "#fff" },
};

const TYPE_TAG_COLOR = {
  info: "blue",
  warning: "orange",
  error: "red",
};

// 服务名称与站点对应关系
const SERVICE_SITE_MAP = {
  dedup: "scholar.sangerbox.com",
};

// 当前预览的服务（scholar 站点对应 dedup）
const PREVIEW_SERVICE_NAME = "dedup";

const SERVICE_NAME_OPTIONS = [
  {
    value: "dedup",
    label: "dedup（scholar.sangerbox.com 首页横幅）",
  },
];

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const NOTICE_LINK_STYLE = `
  .notice-banner-content a {
    color: inherit;
    text-decoration: underline;
    font-weight: 600;
    cursor: pointer;
  }
  .notice-banner-content a:hover {
    opacity: 0.85;
  }
  .notice-detail-content a {
    color: #1677ff;
    text-decoration: underline;
    font-weight: 500;
  }
  .notice-detail-content a:hover {
    color: #4096ff;
  }
`;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSafeHref(href) {
  if (!href) return false;
  const value = href.trim();
  if (value.startsWith("/") || value.startsWith("#")) return true;
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

/** 仅保留 a 标签，过滤其它 HTML，防止 XSS */
function sanitizeNoticeHtml(content) {
  if (!content) return "";

  const serializeChildren = (el, serialize) =>
    Array.from(el.childNodes).map((node) => serialize(node)).join("");

  const serialize = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();
    if (tag === "a") {
      const href = (node.getAttribute("href") || "").trim();
      if (!isSafeHref(href)) {
        return serializeChildren(node, serialize);
      }
      const inner = serializeChildren(node, serialize);
      return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
    }
    return serializeChildren(node, serialize);
  };

  return content
    .split("\n")
    .map((line) => {
      const div = document.createElement("div");
      div.innerHTML = line;
      return serializeChildren(div, serialize);
    })
    .join("<br />");
}

/** 列表展示用：去掉 HTML 标签 */
function stripNoticeHtml(content) {
  if (!content) return "";
  const div = document.createElement("div");
  div.innerHTML = content;
  return div.textContent || "";
}

/** 是否为自定义样式（type 为空且两色齐全） */
function isCustomStyle(record) {
  return !record?.type && !!record?.backgroundColor && !!record?.textColor;
}

/** 解析横幅样式：自定义色优先，其次 type，与线上一致 */
function resolveNoticeStyle(data) {
  const hasCustom = !!(data?.backgroundColor && data?.textColor);
  if (hasCustom) {
    return {
      mode: "custom",
      background: data.backgroundColor,
      color: data.textColor,
    };
  }
  const type = TYPE_STYLE_MAP[data?.type] ? data.type : "info";
  return {
    mode: "type",
    type,
    background: TYPE_STYLE_MAP[type].background,
    color: TYPE_STYLE_MAP[type].color,
  };
}

/** 列表/详情用的类型标签 */
function getNoticeTypeLabel(record) {
  if (isCustomStyle(record)) {
    return { text: "自定义", tagColor: "purple" };
  }
  if (record?.type && TYPE_STYLE_MAP[record.type]) {
    return { text: record.type, tagColor: TYPE_TAG_COLOR[record.type] };
  }
  return { text: "-", tagColor: "default" };
}

function ColorSwatch({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        background: color,
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.1)",
        verticalAlign: "middle",
      }}
    />
  );
}

/**
 * 横幅预览组件（与首页 ActiveAlert 样式一致）
 */
function BannerPreview({ data }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setShouldScroll(contentWidth > containerWidth);
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [data]);

  if (!data || !data.content) return <Text type="secondary">暂无公告内容</Text>;

  const { background, color } = resolveNoticeStyle(data);
  const htmlContent = sanitizeNoticeHtml(data.content);

  const contentNode = (
    <div
      ref={contentRef}
      className="notice-banner-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{ color, display: "inline-block" }}
    />
  );

  return (
    <>
      <style>{NOTICE_LINK_STYLE}</style>
      <Alert
        style={{
          background,
          color,
          border: "none",
          borderRadius: 0,
          overflow: "hidden",
        }}
        message={
          <div ref={containerRef} style={{ width: "100%", textAlign: "center" }}>
            {shouldScroll ? (
              <Marquee
                gradient={false}
                speed={50}
                pauseOnHover
                pauseOnClick
                style={{ color }}
              >
                {contentNode}
              </Marquee>
            ) : (
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color,
                }}
              >
                {contentNode}
              </div>
            )}
          </div>
        }
      />
    </>
  );
}

export default function NoticePage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 搜索条件
  const [searchServiceName, setSearchServiceName] = useState("");
  const [searchTitle, setSearchTitle] = useState("");

  // 弹窗
  const [openDel, setOpenDel] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [addForm] = Form.useForm();
  const styleMode = Form.useWatch("styleMode", addForm) || "type";

  // 最新激活横幅
  const [latestActive, setLatestActive] = useState(null);

  const columns = [
    {
      title: "服务名称",
      dataIndex: "serviceName",
      align: "center",
      render: (name) => (
        <Space direction="vertical" size={0}>
          <span>{name}</span>
          {SERVICE_SITE_MAP[name] && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              → {SERVICE_SITE_MAP[name]}
            </Text>
          )}
        </Space>
      ),
    },
    { title: "公告标题", dataIndex: "title", align: "center" },
    {
      title: "公告内容",
      dataIndex: "content",
      align: "center",
      ellipsis: true,
      render: (content) => stripNoticeHtml(content),
    },
    {
      title: "类型",
      dataIndex: "type",
      align: "center",
      width: 90,
      render: (_, record) => {
        const { text, tagColor } = getNoticeTypeLabel(record);
        return text === "-" ? "-" : <Tag color={tagColor}>{text}</Tag>;
      },
    },
    {
      title: "过期时间",
      dataIndex: "expireTime",
      align: "center",
      render: (time) => (time ? dayjs(time).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "操作",
      dataIndex: "id",
      align: "center",
      width: 300,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setCurrentItem(record);
                setOpenView(true);
              }}
            >
              查看
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentItem(record);
                setOpenAdd(true);
                const custom = isCustomStyle(record);
                addForm.setFieldsValue({
                  serviceName: record.serviceName,
                  title: record.title,
                  content: record.content,
                  styleMode: custom ? "custom" : "type",
                  type: custom ? null : record.type || "info",
                  backgroundColor: custom ? record.backgroundColor : null,
                  textColor: custom ? record.textColor : null,
                  expireTime: record.expireTime
                    ? dayjs(record.expireTime)
                    : null,
                });
              }}
            >
              编辑
            </Button>
          </Tooltip>
          <Tooltip title="删除">
            <Button
              
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setCurrentItem(record);
                setOpenDel(true);
              }}
            >
              删除
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleList = async (pageNum, pageSize, serviceName, title) => {
    try {
      setLoading(true);
      const res = await noticePageList({
        pageNum,
        pageSize,
        serviceName: serviceName || undefined,
        title: title || undefined,
      });
      if (res?.code === 200) {
        setList(res?.data?.records || []);
        setTotal(res?.data?.total || 0);
      } else {
        message.error(res?.message || "获取公告列表失败！");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestActive = async (serviceName = PREVIEW_SERVICE_NAME) => {
    try {
      const res = await noticeGetLatestActive(serviceName);
      if (res?.code === 200 && res.data) {
        setLatestActive(res.data);
      } else {
        setLatestActive(null);
      }
    } catch (err) {
      console.error("getLatestActive error:", err);
      setLatestActive(null);
    }
  };

  const handleDelete = async () => {
    try {
      setBtnLoading(true);
      const res = await noticeDelete(currentItem.id);
      if (res?.code === 200) {
        handleList(pageNum, pageSize, searchServiceName, searchTitle);
        fetchLatestActive();
        setOpenDel(false);
        message.success(res?.message || "删除公告成功！");
      } else {
        message.error(res?.message || "删除公告失败！");
      }
    } finally {
      setBtnLoading(false);
    }
  };

  const buildNoticePayload = (values) => {
    const { styleMode: mode, serviceName, title, content, type, backgroundColor, textColor, expireTime } = values;
    const payload = {
      serviceName,
      title,
      content,
      expireTime: expireTime
        ? dayjs(expireTime).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
    };

    if (mode === "type") {
      payload.type = type;
      payload.backgroundColor = null;
      payload.textColor = null;
    } else {
      payload.type = null;
      payload.backgroundColor = backgroundColor;
      payload.textColor = textColor;
    }

    if (currentItem.id) {
      payload.id = currentItem.id;
    }

    return payload;
  };

  const handleSave = async (values) => {
    try {
      setBtnLoading(true);
      const obj = buildNoticePayload(values);
      const res = await noticeAdd(obj);
      if (res?.code === 200) {
        message.success(res?.message || "操作成功！");
        setOpenAdd(false);
        handleList(pageNum, pageSize, searchServiceName, searchTitle);
        fetchLatestActive();
      } else {
        message.error(res?.message || "操作失败！");
      }
    } finally {
      setBtnLoading(false);
    }
  };

  const handleSearch = () => {
    setPageNum(1);
    handleList(1, pageSize, searchServiceName, searchTitle);
  };

  const handleReset = () => {
    setSearchServiceName("");
    setSearchTitle("");
    setPageNum(1);
    handleList(1, pageSize, "", "");
  };

  useEffect(() => {
    handleList(pageNum, pageSize, searchServiceName, searchTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize]);

  useEffect(() => {
    fetchLatestActive();
  }, []);

  return (
    <PageCard
      title={"公告管理"}
      extraActions={
        <Space>
          <Input
            placeholder="服务名称"
            value={searchServiceName}
            onChange={(e) => setSearchServiceName(e.target.value)}
            style={{ width: 150 }}
            onPressEnter={handleSearch}
          />
          <Input
            placeholder="公告标题"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            style={{ width: 150 }}
            onPressEnter={handleSearch}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      }
      rightActions={
        <>
          <Tooltip title={"新增公告"}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setOpenAdd(true);
                setCurrentItem({});
                addForm.resetFields();
                addForm.setFieldsValue({
                  serviceName: PREVIEW_SERVICE_NAME,
                  styleMode: "type",
                  type: "info",
                  backgroundColor: null,
                  textColor: null,
                });
              }}
            >
              新增公告
            </Button>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title={"刷新数据"}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                handleList(pageNum, pageSize, searchServiceName, searchTitle);
                fetchLatestActive();
              }}
            >
              刷新数据
            </Button>
          </Tooltip>
        </>
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="服务名称说明"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <Text strong>dedup</Text> — 控制{" "}
              <Text code>scholar.sangerbox.com</Text> 首页公告横幅
            </li>
            <li>服务名称支持自定义填写，用于绑定不同站点的公告</li>
            <li>
              公告内容支持 HTML 超链接，例如：维护通知，请
              <Text code>
                {"<a href=\"https://example.com\">点击这里</a>"}
              </Text>
            </li>
          </ul>
        }
      />

      {/* 当前最新激活横幅预览 */}
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
          当前线上最新横幅（{PREVIEW_SERVICE_NAME} → scholar.sangerbox.com）：
        </Text>
        {latestActive ? (
          <BannerPreview data={latestActive} />
        ) : (
          <Alert
            type="warning"
            showIcon
            message={`${PREVIEW_SERVICE_NAME} 暂无激活中的公告横幅`}
          />
        )}
      </div>

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

      {/* 删除确认弹窗 */}
      <Modal
        title={"删除公告"}
        open={openDel}
        onCancel={() => setOpenDel(false)}
        onOk={handleDelete}
        destroyOnHidden
        okText="确认删除"
        okButtonProps={{ danger: true, loading: btnLoading }}
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
            您确定要删除公告
            <span style={{ fontWeight: 600 }}>{currentItem.title}</span> 吗？
          </div>
        </Space>
      </Modal>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentItem.id ? "编辑公告" : "新增公告"}
        open={openAdd}
        confirmLoading={btnLoading}
        onCancel={() => setOpenAdd(false)}
        onOk={() => addForm.submit()}
        okText="确认"
        destroyOnHidden
        width={480}
        styles={{ body: { paddingTop: 12, paddingBottom: 8 } }}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12, padding: "6px 12px" }}
          message="横幅展示时，自定义背景色与文字色优先于公告类型配色"
        />
        <Form
          form={addForm}
          layout="vertical"
          
          onFinish={handleSave}
          initialValues={{
            styleMode: "type",
            type: "info",
            serviceName: PREVIEW_SERVICE_NAME,
            backgroundColor: null,
            textColor: null,
          }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="服务名称"
                name="serviceName"
                rules={[{ required: true, message: "请输入服务名称" }]}
                style={{ marginBottom: 12 }}
              >
                <AutoComplete
                  options={SERVICE_NAME_OPTIONS}
                  placeholder="如 dedup"
                  filterOption={(input, option) =>
                    (option?.value ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="公告标题"
                name="title"
                rules={[{ required: true, message: "请输入公告标题" }]}
                style={{ marginBottom: 12 }}
              >
                <Input placeholder="公告标题" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="公告内容"
            name="content"
            rules={[{ required: true, message: "请输入公告内容" }]}
            style={{ marginBottom: 12 }}
            extra='支持换行；可使用 a 标签添加链接，如：<a href="https://example.com">点击查看</a>'
          >
            <TextArea
              rows={5}
              placeholder='如：系统维护中，详情请<a href="https://example.com">点击这里</a>'
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="样式模式"
                name="styleMode"
                style={{ marginBottom: 12 }}
              >
                <Select
                  options={[
                    { value: "type", label: "按公告类型" },
                    { value: "custom", label: "自定义颜色" },
                  ]}
                  onChange={(mode) => {
                    if (mode === "type") {
                      addForm.setFieldsValue({
                        backgroundColor: null,
                        textColor: null,
                        type: addForm.getFieldValue("type") || "info",
                      });
                    } else {
                      addForm.setFieldsValue({
                        type: null,
                        backgroundColor: "#1677ff",
                        textColor: "#ffffff",
                      });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {styleMode === "type" ? (
                <Form.Item
                  label="公告类型"
                  name="type"
                  rules={[{ required: true, message: "请选择公告类型" }]}
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择类型"
                    options={[
                      { value: "info", label: "信息 (蓝)" },
                      { value: "warning", label: "警告 (橙)" },
                      { value: "error", label: "错误 (红)" },
                    ]}
                  />
                </Form.Item>
              ) : (
                <Form.Item label="自定义颜色" style={{ marginBottom: 12 }}>
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item
                      name="backgroundColor"
                      noStyle
                      rules={[
                        { required: true, message: "请输入背景色" },
                        {
                          pattern: HEX_COLOR_PATTERN,
                          message: "#RRGGBB",
                        },
                      ]}
                    >
                      <Input placeholder="背景 #1677ff" />
                    </Form.Item>
                    <Form.Item
                      name="textColor"
                      noStyle
                      rules={[
                        { required: true, message: "请输入文字色" },
                        {
                          pattern: HEX_COLOR_PATTERN,
                          message: "#RRGGBB",
                        },
                      ]}
                    >
                      <Input placeholder="文字 #ffffff" />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              )}
            </Col>
          </Row>

          <Form.Item
            label="过期时间"
            name="expireTime"
            rules={[{ required: true, message: "请选择过期时间" }]}
            style={{ marginBottom: 8 }}
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              placeholder="请选择过期时间"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看弹窗 */}
      <Modal
        title="公告预览"
        open={openView}
        onCancel={() => setOpenView(false)}
        footer={null}
        destroyOnHidden
        width={640}
      >
        <div style={{ marginBottom: 20 }}>
          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            横幅效果预览
          </Text>
          <BannerPreview data={currentItem} />
        </div>

        <Descriptions column={2} bordered >
          <Descriptions.Item label="服务名称" span={2}>
            <Space direction="vertical" size={0}>
              <span>{currentItem.serviceName}</span>
              {SERVICE_SITE_MAP[currentItem.serviceName] && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  → {SERVICE_SITE_MAP[currentItem.serviceName]}
                </Text>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="公告标题" span={2}>
            {currentItem.title}
          </Descriptions.Item>
          <Descriptions.Item label="样式模式">
            {(() => {
              const { text, tagColor } = getNoticeTypeLabel(currentItem);
              return text === "-" ? (
                "-"
              ) : (
                <Tag color={tagColor}>{text}</Tag>
              );
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="过期时间">
            {currentItem.expireTime
              ? dayjs(currentItem.expireTime).format("YYYY-MM-DD HH:mm")
              : "-"}
          </Descriptions.Item>
          {resolveNoticeStyle(currentItem).mode === "custom" && (
            <>
              <Descriptions.Item label="背景色">
                <Space size={8}>
                  <ColorSwatch color={currentItem.backgroundColor} />
                  <Text code>{currentItem.backgroundColor}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="文字色">
                <Space size={8}>
                  <ColorSwatch color={currentItem.textColor} />
                  <Text code>{currentItem.textColor}</Text>
                </Space>
              </Descriptions.Item>
            </>
          )}
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <Text type="secondary">公告内容</Text>
          <div
            className="notice-detail-content"
            style={{
              marginTop: 8,
              padding: 12,
              background: "#fafafa",
              borderRadius: 6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
            dangerouslySetInnerHTML={{
              __html: sanitizeNoticeHtml(currentItem.content),
            }}
          />
        </div>
      </Modal>
    </PageCard>
  );
}
