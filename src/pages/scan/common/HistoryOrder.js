import { useEffect, useState, useRef } from "react";
import {
  Button,
  Space,
  Input,
  Table,
  Tag,
  Typography,
  Divider,
  message,
  Popconfirm,
  Tooltip,
  Modal,
} from "antd";
import PageCard from "../../../components/PageCard";
import {
  DownloadOutlined,
  LinkOutlined,
  ReloadOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  delTurFaiOrder,
  turnicheckFailedPageList,
  turnicheckPageList,
} from "../../../server/api";
import { useDispatch } from "react-redux";
import Highlighter from "react-highlight-words";
import { decreaseMenuBadge } from "../../../store/menuBadgeSlice";
import { createStyles } from "antd-style";
const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
          }
        }
      }
    `,
  };
});

export default function HistoryOrder({ props, title }) {
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState(null);
  const [loading, serLoading] = useState(false);
  const [openText, setOpenText] = useState(false);
  const [commitLoadingMap, setCommitLoadingMap] = useState({});
  const [currentText, setCurrentText] = useState({});
  const [orderList, setOrderList] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchMobile, setSearchMobile] = useState(null);
  const [searchOrderNo, setSearchOrderNo] = useState(null);
  const searchInput = useRef(null);
  const [inputOrderNo, setInputOrderNo] = useState("");
  const [inputMobile, setInputMobile] = useState("");
  const [commitModalOpen, setCommitModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [searchTexts, setSearchTexts] = useState({
    orderNo: "",
    mobile: "",
  });
  const { styles } = useStyle();
  /** 表头搜索 */
  const handleColumnSearch = (dataIndex, value) => {
    setPageNum(1);

    setSearchTexts((prev) => ({
      ...prev,
      [dataIndex]: value || "",
    }));

    if (dataIndex === "orderNo") setSearchOrderNo(value || "");
    if (dataIndex === "mobile") setSearchMobile(value || "");
  };

  const handleColumnReset = (dataIndex) => {
    setPageNum(1);

    setSearchTexts((prev) => ({
      ...prev,
      [dataIndex]: "",
    }));

    if (dataIndex === "orderNo") setSearchOrderNo("");
    if (dataIndex === "mobile") setSearchMobile("");
  };

  const getColumnSearchProps = (dataIndex, label) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8, width: 260 }}>
        <Input
          ref={searchInput}
          placeholder={`搜索${label}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => {
            confirm();
            handleColumnSearch(dataIndex, selectedKeys[0]);
          }}
          style={{ marginBottom: 8 }}
        />
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SearchOutlined />}
            style={{ width: 90 }}
            onClick={() => {
              confirm();
              handleColumnSearch(dataIndex, selectedKeys[0]);
            }}
          >
            搜索
          </Button>
          <Button
            size="small"
            style={{ width: 90 }}
            onClick={() => {
              clearFilters();
              handleColumnReset(dataIndex);
            }}
          >
            重置
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            关闭
          </Button>
        </Space>
      </div>
    ),

    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),

    filteredValue:
      dataIndex === "orderNo"
        ? searchOrderNo
          ? [searchOrderNo]
          : null
        : dataIndex === "mobile"
        ? searchMobile
          ? [searchMobile]
          : null
        : null,

    render: (text) => {
      const highlightText = searchTexts[dataIndex];

      return highlightText ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[highlightText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      );
    },
  });

  const columns = [
    // { title: "ID", dataIndex: "id", ellipsis: true, align: "center" },
    {
      title: "手机号",
      dataIndex: "mobile",
      key: "operation",
      ellipsis: true,
      align: "center",
      ...getColumnSearchProps("mobile", "手机号"),
    },
    {
      title: "订单号",
      dataIndex: "orderId",
      ellipsis: true,
      align: "center",
      ...getColumnSearchProps("orderNo", "订单号"),
    },
    // { title: "代理订单ID", dataIndex: "agentOrderId", ellipsis: true, align: "center" },
    // { title: "支付订单编号", dataIndex: "orderNo", ellipsis: true, align: "center", },
    // { title: "UUID", dataIndex: "uuid", ellipsis: true, align: "center" },
    // { title: "turncheckId", dataIndex: "turncheckId", ellipsis: true, align: "center" },
    // { title: "sxruserId", dataIndex: "sxruserId", ellipsis: true, align: "center" },
    {
      title: "商品名",
      dataIndex: "goodsName",
      ellipsis: true,
      align: "center",
    },
    // { title: "标题", dataIndex: "title", ellipsis: true, align: "center" },
    // { title: "作者", dataIndex: "author", ellipsis: true, align: "center" },
    // { title: "查重文本内容", dataIndex: "txtContent", ellipsis: true, align: "center" },
    // { title: "文本内容字数", dataIndex: "wordCount", ellipsis: true, align: "center" },
    // { title: "数量", dataIndex: "num", ellipsis: true, align: "center" },
    // { title: "成本价", dataIndex: "price", ellipsis: true, align: "center" },
    {
      title: "应付金额",
      dataIndex: "payMoney",
      ellipsis: true,
      align: "center",
    },
    // { title: "类型标识", dataIndex: "type", ellipsis: true, align: "center" },
    {
      title: "确认状态",
      dataIndex: "isAck",
      ellipsis: true,
      align: "center",
      render: (isAck) => {
        const map = {
          1: { text: "已确认", color: "success" },
          0: { text: "未确认", color: "error" },
        };
        const { text, color } = map[isAck] || {};
        return <Tag color={color}>{text}</Tag>;
      },
    },
    // { title: "支付状态", dataIndex: "isPay", ellipsis: true, align: "center",render:(isPay)=>{ const map = {1:{text:"已支付",color:"success"},0:{text:"未支付",color:"error"}}; const { text ,color} = map[isPay] || {};return <Tag color={color}>{text}</Tag>} },
    {
      title: "支付状态",
      dataIndex: "payStatus",
      ellipsis: true,
      align: "center",
    },
    {
      title: "检测状态",
      dataIndex: "turncheckStatus",
      ellipsis: true,
      align: "center",
    },
    // { title: "重复率", dataIndex: "similarityIndex", ellipsis: true, align: "center" },
    // { title: "查重文件下载地址", dataIndex: "downloadUrl", ellipsis: true, align: "center",render:(downloadUrl)=> (<Typography.Text copyable={{text:downloadUrl}} style={{whiteSpace:"nowrap"}}>{downloadUrl}</Typography.Text>)},
    // { title: "上传文件路径", dataIndex: "infilePath", ellipsis: true, align: "center" },
    // { title: "下载文件路径", dataIndex: "outfilePath", ellipsis: true, align: "center" },
    {
      title: "生成时间",
      dataIndex: "createTime",
      ellipsis: true,
      align: "center",
    },
    // { title: "更新时间", dataIndex: "updateTime", ellipsis: true, align: "center" },
    // { title: "是否删除", dataIndex: "isDel", ellipsis: true, align: "center",render:(isPay)=>{ const map = {1:{text:"已删除",color:"success"},0:{text:"未删除",color:"error"}}; const { text ,color} = map[isPay] || {};return <Tag color={color}>{text}</Tag>} },
    // { title: "网页版地址相关UUID", dataIndex: "titleUuid", ellipsis: true, align: "center" },
    // { title: "提交ID", dataIndex: "submitId", ellipsis: true, align: "center" },
    // { title: "是否已发送邮箱", dataIndex: "isEmail", ellipsis: true, align: "center",render:(isPay)=>{ const map = {1:{text:"已发送",color:"success"},0:{text:"未发送",color:"error"}}; const { text ,color} = map[isPay] || {};return <Tag color={color}>{text}</Tag>} },
    {
      title: "操作",
      ellipsis: true,
      align: "center",
      render: (_, record) => {
        return (
          <Space>
            {props === "regular" ? (
              <>
                <Tooltip title={"下载链接"}>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    href={record.downloadUrl || undefined}
                    target="_blank"
                    disabled={!record.downloadUrl}
                  />
                </Tooltip>
                <Tooltip title={"查看文本"}>
                  <Button
                    size="small"
                    icon={<LinkOutlined />}
                    onClick={() => {
                      setOpenText(true);
                      setCurrentText(record.txtContent);
                    }}
                  />
                </Tooltip>
              </>
            ) : (
              <Tooltip title="手动提交">
                <Button
                  size="small"
                  icon={<UploadOutlined />}
                  loading={commitLoadingMap[record.orderId]}
                  onClick={() => {
                    setCurrentOrder(record);
                    setCommitModalOpen(true);
                  }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const apiMap = {
    regular: turnicheckPageList,
    failed: turnicheckFailedPageList,
  };

  const handleOrderList = async (page = pageNum, size = pageSize) => {
    serLoading(false);
    setErrMsg(null);
    try {
      const params = {
        pageNum: page,
        pageSize: size,
        mobile: searchMobile || null,
        orderNo: searchOrderNo || null,
      };
      const api = apiMap[props];
      if (!api) throw new Error("未匹配正确接口");
      const res = await api(params);
      if (res?.code === 200) {
        const { records = [], total = 0 } = res.data || {};
        setOrderList(records);
        setTotal(total);
      } else {
        message.error(res?.msg || "请联系管理员！");
      }
    } catch (e) {
      console.error(e);
      setErrMsg("数据加载失败，请重试");
    } finally {
      serLoading(false);
    }
  };

  const handleCommit = async (order) => {
    try {
      setCommitLoadingMap((prev) => ({ ...prev, [order.orderId]: true }));
      const res = await delTurFaiOrder(order.orderId, order.mobile);
      if (res?.code === 200) {
        message.success(res?.message || `已手动提交订单${order.orderId}成功！`);
        dispatch(decreaseMenuBadge("/scan/history/abnormal-orders"))
        handleOrderList(pageNum, pageSize);
      } else {
        message.error(res?.message || "提交失败，请联系管理员！");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCommitLoadingMap((prev) => ({ ...prev, [order.orderId]: false }));
    }
  };

  useEffect(() => {
    handleOrderList(pageNum, pageSize);
  }, [pageNum, pageSize, searchMobile, searchOrderNo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNum(1);

      setSearchOrderNo(inputOrderNo || "");
      setSearchMobile(inputMobile || "");

      setSearchTexts({
        orderNo: inputOrderNo || "",
        mobile: inputMobile || "",
      });
    }, 500); // 500ms 防抖

    return () => clearTimeout(timer);
  }, [inputOrderNo, inputMobile]);

  return (
    <PageCard
      title={title}
      rightActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => handleOrderList()}
        >
          刷新数据
        </Button>
      }
      extraActions={
        <Space>
          {/* 订单号搜索 */}
          <Input
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            placeholder="搜索订单号"
            value={inputOrderNo}
            onChange={(e) => setInputOrderNo(e.target.value)}
          />
          <Divider type="vertical" />

          {/* 手机号搜索 */}
          <Input
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            placeholder="搜索手机号"
            value={inputMobile}
            onChange={(e) => setInputMobile(e.target.value)}
          />
        </Space>
      }
    >
      {errMsg ? (
        <div className="text-center">
          <p>{errMsg}</p>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => handleOrderList()}
          ></Button>
        </div>
      ) : (
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={orderList}
          className={styles.customTable}
          scroll={{ x: "max-content" }}
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
      <Modal
        open={openText}
        onCancel={() => setOpenText(false)}
        title={"上传文本"}
        footer={null}
      >
        <div className="text-center">{currentText}</div>
      </Modal>
      <Modal
        open={commitModalOpen}
        title="确认手动提交"
        okText="确认提交"
        cancelText="取消"
        confirmLoading={commitLoadingMap[currentOrder?.orderId]}
        onOk={async () => {
          if (!currentOrder) return;
          await handleCommit(currentOrder);
          setCommitModalOpen(false);
          setCurrentOrder(null);
        }}
        onCancel={() => {
          setCommitModalOpen(false);
          setCurrentOrder(null);
        }}
        maskClosable={false}
        destroyOnHidden
        okButtonProps={{ danger: true }}
      >
        <Typography.Text>确认要手动提交以下订单吗？</Typography.Text>

        <div style={{ marginTop: 12 }}>
          <p>
            <strong>订单号：</strong>
            {currentOrder?.orderId}
          </p>
          <p>
            <strong>手机号：</strong>
            {currentOrder?.mobile}
          </p>
          <p>
            <strong>商品：</strong>
            {currentOrder?.goodsName}
          </p>
        </div>
      </Modal>
    </PageCard>
  );
}
