import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Tag,
  Space,
  Tooltip,
  Input,
  Flex,
  Modal,
  message,
} from "antd";
import {
  ReloadOutlined,
  LinkOutlined,
  DeleteOutlined,
  SearchOutlined,
  DownloadOutlined,
  VerticalAlignBottomOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import PageCard from "../../../components/PageCard";
import CopyableEllipsisText from "../../../components/CopyableEllipsisText";
import {
  imagetwinPageList,
  ithenticatePageList,
  getResLink,
  deleteImagetwinById,
  deleteIthenticateById,
  dupliseePageList,
  dupliSeeDeleteById,
} from "../../../server/api";

const SNAPSHOT_VIEW_BASE = "https://local.sangerbox.com/ith/snapshot_view/";


const linkBtnGroupStyle = {
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: 4,
  maxWidth: "100%",
};
const crossCheckLinkBtnStyle = {
  width: "100%",
  display: "inline-flex",
  justifyContent: "flex-start",
  alignItems: "center",
  textAlign: "left",
};
function getSnapshotViewUrl(record) {
  if (record.snapshotViewUrl) return record.snapshotViewUrl;
  if (!record.resultUrl) return undefined;
  const fileName = record.resultUrl.split("/").pop() || "";
  if (!fileName.includes("_")) return undefined;
  // resultUrl: .../{id}_{time}_{uuid}.pdf → keep id (before first _), prepend base
  const suffix = fileName.split("_")[0];
  return `${SNAPSHOT_VIEW_BASE}${suffix}`;
}
/** AIGC 下载按钮：问号在按钮外绝对定位，不占布局宽度；无链接时模拟 disabled */
function AigcDownloadLinkButton({
  url,
  label,
  tipLabel,
  tipHelp,
  btnStyle,
  longTooltipProps,
}) {
  const hasUrl = !!url;

  return (
    <span style={{ position: "relative", display: "block", width: "100%" }}>
      <Tooltip {...longTooltipProps} title={tipLabel}>
        <Button
          href={hasUrl ? url : undefined}
          target="_blank"
          onClick={!hasUrl ? (e) => e.preventDefault() : undefined}
          style={{
            ...btnStyle,
            ...(!hasUrl
              ? {
                cursor: "not-allowed",
                color: "rgba(0, 0, 0, 0.25)",
                borderColor: "#d9d9d9",
                background: "#f5f5f5",
              }
              : {}),
          }}
          icon={<VerticalAlignBottomOutlined />}
        >
          {label}
        </Button>
      </Tooltip>
      {!hasUrl && (
        <Tooltip {...longTooltipProps} title={tipHelp}>
          <QuestionCircleOutlined
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              position: "absolute",
              left: "100%",
              top: "50%",
              marginLeft: 4,
              transform: "translateY(-50%)",
              color: "rgba(0, 0, 0, 0.45)",
              cursor: "help",
              zIndex: 1,
            }}
          />
        </Tooltip>
      )}
    </span>
  );
}

const longTooltipProps = {
  color: "var(--app-info)",
  title: "该百分比表示可能是由 AI 生成的文本以及可能是由 AI 生成且经过 AI 改写的文本的总量。当前AI写作评估 可能并不准确 仅作参考 ,*%代表AIGC率低或未检测到AI生成的文本。",
  overlayInnerStyle: {
    maxWidth: 320,
    whiteSpace: "normal",
    fontSize: 12,
    lineHeight: 1.5,
    padding: "8px 12px",
  },
};
export default function OrderList({ title, props }) {
  const [errMsg, setErrMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // 搜索条件
  const [searchKeyword, setSearchKeyword] = useState("");

  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNum(1); // 搜索时回到第一页
      setDebouncedKeyword(searchKeyword);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  /** 是否过期 */
  const isExpired = (expireTime) => {
    if (!expireTime) return true;
    return new Date(expireTime.replace(/-/g, "/")) < new Date();
  };

  /** 接口映射 */
  const apiMap = {
    imagetwin: imagetwinPageList,
    ithenticate: ithenticatePageList,
    dupliSee: dupliseePageList,
  };

  const apiDeleteMap = {
    imagetwin: deleteImagetwinById,
    ithenticate: deleteIthenticateById,
    dupliSee: dupliSeeDeleteById,
  };

  /** 获取列表 */
  const handleOrderList = async (page = pageNum, size = pageSize) => {
    setLoading(true);
    setErrMsg(null);

    try {
      const params = {
        pageNum: page,
        pageSize: size,
        searchKeyword: debouncedKeyword || null,
      };

      const api = apiMap[props];
      if (!api) throw new Error("未匹配到接口");

      const res = await api(params);
      if (res?.code === 200) {
        const { records = [], total = 0 } = res.data || {};
        setOrderList(records);
        setTotal(total);
      } else {
        message.error(res?.message || "请联系管理员！");
      }
    } catch (e) {
      console.error(e);
      setErrMsg("数据加载失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const renderHighlight = (text) => {
    if (!debouncedKeyword) return text;

    return (
      <Highlighter
        highlightStyle={{ backgroundColor: "var(--app-highlight)", padding: 0 }}
        searchWords={[debouncedKeyword]}
        autoEscape
        textToHighlight={text ? text.toString() : ""}
      />
    );
  };

  /** 表格列 */
  const columns = [
    {
      title: "标题",
      width: 100, dataIndex: "title", ellipsis: true, align: "center"
    },
    { title: "创建时间", dataIndex: "createTime", align: "center" },
    {
      title: "订单号",
      width: 300,
      dataIndex: "orderNo",
      align: "center",
      render: (v) => (
        <CopyableEllipsisText text={v}>
          {renderHighlight(v)}
        </CopyableEllipsisText>
      ),
    },
    {
      title: "任务状态",
      width: 100,
      dataIndex: "status",
      align: "center",
      render: (status) => {
        const map = {
          1: { text: "已付款", color: "default" },
          2: { text: "成功", color: "success" },
          3: { text: "失败", color: "error" },
          4: { text: "稍后重试", color: "error" },
          5: { text: "已退款", color: "warning" },
        };
        const { text, color } = map[status] || {};
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "更新时间",
      width: 200,
      ellipsis: true, dataIndex: "updateTime", align: "center"
    },
    {
      title: "邮箱",
      width: 220,
      dataIndex: "email",
      align: "center",
      render: (v) => (
        <CopyableEllipsisText text={v}>
          {renderHighlight(v)}
        </CopyableEllipsisText>
      ),
    },
    {
      title: "链接",
      align: "center",
      render: (_, record) => {
        const disabled = record.status !== 2;

        const snapshotViewHref = getSnapshotViewUrl(record);

        return (<div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            whiteSpace: "normal",
            wordBreak: "break-word",
            width: "100%",
          }}>
          {props === "imagetwin" ? (
            <div style={linkBtnGroupStyle}>
              <Tooltip title="在线链接">
                <span style={{ display: "block", width: "100%" }}>
                  <Button
                    href={record.resultUrl || undefined}
                    target="_blank"
                    disabled={!record.resultUrl}
                    style={crossCheckLinkBtnStyle}
                    icon={<LinkOutlined />}
                  >
                    在线链接
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="下载链接">
                <span style={{ display: "block", width: "100%" }}>
                  <Button
                    href={record.localFileUrl || undefined}
                    target="_blank"
                    disabled={!record.localFileUrl}
                    style={crossCheckLinkBtnStyle}
                    icon={<VerticalAlignBottomOutlined />}
                  >
                    下载链接
                  </Button>
                </span>
              </Tooltip>
            </div>
          ) : props === "ithenticate" ? (
            <div style={linkBtnGroupStyle}>
              <Tooltip {...longTooltipProps} title="在线预览链接">
                <span style={{ display: "block", width: "100%" }}>
                  <Button
                    href={snapshotViewHref}
                    target="_blank"
                    icon={<LinkOutlined />}
                    style={crossCheckLinkBtnStyle}
                    disabled={!snapshotViewHref}
                  >
                    在线预览链接
                  </Button>
                </span>
              </Tooltip>
              <AigcDownloadLinkButton
                url={record.aiReportDownloadUrl}
                label="AIGC报告下载"
                tipLabel={'AIGC报告下载'}
                tipHelp={'早期版本不支持AI报告直接获取，可以在在线链接中查看'}
                btnStyle={crossCheckLinkBtnStyle}
                longTooltipProps={longTooltipProps}
              />

              <Tooltip {...longTooltipProps} title="相似性报告下载">
                <span style={{ display: "block", width: "100%" }}>
                  <Button
                    href={record.resultUrl}
                    target="_blank"
                    disabled={!record.resultUrl}
                    style={crossCheckLinkBtnStyle}
                    icon={<VerticalAlignBottomOutlined />}
                  >
                    相似性报告下载
                  </Button>
                </span>
              </Tooltip>
            </div>
          ) : props === "dupliSee" ? (
            <div style={linkBtnGroupStyle}>
              <Tooltip title={"下载链接"}>
                <span style={{ display: "block", width: "100%" }}>
                  <Button
                    href={record.pdfReportUrl || undefined}
                    target="_blank"
                    disabled={!record.pdfReportUrl}
                    style={crossCheckLinkBtnStyle}
                    icon={<VerticalAlignBottomOutlined />}
                  >
                    下载链接
                  </Button>
                </span>
              </Tooltip>
            </div>
          ) : null}

        </div>);

      },
    },
    {
      title: "操作",
      align: "center",
      width: 120,
      render: (_, record) => {
        const disabled = record.status !== 2;
        return (
          <Space>
            <Tooltip title="删除">
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deletingId === record.id}
                disabled={deletingId === record.id}
                onClick={() => onDeleteOrder(record.id)}
              >
                删除
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const onGetNewLink = async (id) => {
    try {
      const res = await getResLink(id);
      if (res?.code === 200) {
        message.success(res?.message || "获取新连接成功，请点击左侧查看");
        handleOrderList(pageNum, pageSize);
      } else {
        message.error(res.message || "请联系管理员！");
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const onDeleteOrder = (id) => {
    Modal.confirm({
      title: "删除订单",
      icon: null,
      closable: true,
      okType: "danger",
      content: "请确认是否删除该订单？删除后无法恢复。",
      okText: "确认删除",
      cancelText: "取消",
      maskClosable: true,
      footer: (_, { OkBtn, CancelBtn }) => (
        <Flex justify="space-evenly">
          <CancelBtn />
          <OkBtn className="del-btn" />
        </Flex>
      ),
      onOk: async () => {
        try {
          setDeletingId(id);

          const deleteApi = apiDeleteMap[props];
          const res = await deleteApi(id);

          if (res?.code !== 200) {
            message.error(res?.message || "删除失败");
            return;
          }

          message.success("删除成功");

          const newList = orderList.filter((item) => item.id !== id);

          const hasNext = pageNum * pageSize < total;

          if (hasNext) {
            const nextPageRes = await apiMap[props]({
              pageNum: pageNum + 1,
              pageSize: 1,
              searchKeyword: debouncedKeyword || null,
            });

            if (nextPageRes?.code === 200) {
              const nextRecord = nextPageRes.data?.records?.[0];
              if (nextRecord) {
                newList.push(nextRecord);
              }
            }
          }

          setOrderList(newList);
          setTotal((prev) => prev - 1);
        } catch (err) {
          console.error(err);
          message.error("删除失败，请稍后重试");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  useEffect(() => {
    handleOrderList(pageNum, pageSize);
  }, [pageNum, pageSize, debouncedKeyword]);

  return (
    <PageCard
      title={title}
      extraActions={
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="请输入订单号或邮箱"
          value={searchKeyword}
          onChange={(e) => {
            const value = e.target.value;
            setPageNum(1); // 重置到第一页
            setSearchKeyword(value);
          }}
          onPressEnter={() => {
            setPageNum(1);
            handleOrderList(1, pageSize);
          }}
        />
      }
      rightActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => handleOrderList()}
        >
          刷新数据
        </Button>
      }
    >
      {errMsg ? (
        <div className="text-center">
          <p>{errMsg}</p>
          <Button icon={<ReloadOutlined />} onClick={() => handleOrderList()}>
            重新加载
          </Button>
        </div>
      ) : (
        <Table
          rowKey="id" loading={loading}
          columns={columns}
          dataSource={orderList}
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
      )}
    </PageCard>
  );
}
