import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Typography,
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
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import PageCard from "../../../components/PageCard";
import {
  imagetwinPageList,
  ithenticatePageList,
  getResLink,
  deleteImagetwinById,
  deleteIthenticateById,
  dupliseePageList,
  dupliSeeDeleteById,
} from "../../../server/api";

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
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
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
      ellipsis: true,
      dataIndex: "orderNo",
      align: "center",
      render: (v) => (
        <Typography.Text
          copyable={{ text: v }}
          style={{ whiteSpace: "nowrap" }}
        >
          {renderHighlight(v)}
        </Typography.Text>
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
      dataIndex: "email",
      align: "center",
      render: (v) => (
        <Typography.Text
          copyable={{ text: v }}
          style={{ whiteSpace: "nowrap" }}
        >
          {renderHighlight(v)}
        </Typography.Text>
      ),
    },
    {
      title: "链接",
      align: "center",
      render: (_, record) => {
        const disabled = record.status !== 2;
        return (<Space>
          {
            props !== "dupliSee" &&
            <Tooltip title="查看在线链接">
              <Button
                icon={<LinkOutlined />}
                disabled={disabled}
                onClick={() => {
                  if (!record.resultUrl)
                    return message.warning("请先从右侧获取新链接");
                  if (isExpired(record.expireTime) && props === "ithenticate")
                    return message.warning("链接已过期");
                  window.open(record.resultUrl);
                }}
              >在线链接</Button>
            </Tooltip>
          }
          {props === "imagetwin" ? (
            <Tooltip title="获取下载报告">
              <Button
                icon={<DownloadOutlined />}
                href={record.localFileUrl || undefined}
                target="_blank"
                disabled={!record.localFileUrl}
              >下载链接</Button>
            </Tooltip>
          ) : props === "ithenticate" ? (
            <Tooltip title="获取新链接">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => onGetNewLink(record.id)}
              >获取新链接</Button>
            </Tooltip>
          ) : props === "dupliSee" ? (
            <Tooltip title="获取下载报告">
              <Button
                icon={<DownloadOutlined />}
                href={record.pdfReportUrl || undefined}
                target="_blank"
                disabled={!record.pdfReportUrl}
              >下载链接</Button>
            </Tooltip>
          ) : null}

        </Space>);

      },
    },
    {
      title: "操作",
      align: "center",
      width: 100,
      render: (_, record) => {
        const disabled = record.status !== 2;
        return (
          <Space>
            {/* {
              props !== "dupliSee" &&
              <Tooltip title="查看结果链接">
                <Button
                  icon={<LinkOutlined />}
                  disabled={disabled}
                  onClick={() => {
                    if (!record.resultUrl)
                      return message.warning("请先从右侧获取新链接");
                    if (isExpired(record.expireTime) && props === "ithenticate")
                      return message.warning("链接已过期");
                    window.open(record.resultUrl);
                  }}
                />
              </Tooltip>
            }
            {props === "imagetwin" ? (
              <Tooltip title="下载">
                <Button
                  icon={<DownloadOutlined />}
                  href={record.localFileUrl || undefined}
                  target="_blank"
                  disabled={!record.localFileUrl}
                />
              </Tooltip>
            ) : props === "ithenticate" ? (
              <Tooltip title="获取新链接">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => onGetNewLink(record.id)}
                />
              </Tooltip>
            ) : props === "dupliSee" ? (
              <Tooltip title="获取新链接">
                <Button
                  icon={<DownloadOutlined />}
                  href={record.pdfReportUrl || undefined}
                  target="_blank"
                  disabled={!record.pdfReportUrl}
                />
              </Tooltip>
            ) :null} */}
            <Tooltip title="删除">
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deletingId === record.id}
                disabled={deletingId === record.id}
                onClick={() => onDeleteOrder(record.id)}
              />
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
