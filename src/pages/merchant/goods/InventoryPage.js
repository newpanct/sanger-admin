import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Tag,
  Tooltip,
  Divider,
  InputNumber,
  Table,
  message,
  Modal,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import PageCard from "../../../components/PageCard";
import Highlighter from "react-highlight-words";
import { useSelector } from "react-redux";
import {
  cardkeyExtract,
  cardkeyInvalid,
  cardkeyPageList,
  markAsSoldBatch,
  usedAvailable,
} from "../../../server/api";

const { Text, Title } = Typography;

const INVENTORY_LIST = [
  {
    id: 1,
    name: "CrossCheck",
    type: "crosscheck",
    used: 120,
    remaining: 80,
    purchased: 200,
    sold: 150,
  },
  {
    id: 2,
    name: "Imagetwin",
    type: "imagetwin",
    used: 60,
    remaining: 40,
    purchased: 120,
    sold: 80,
  },
];

export default function InventoryPage() {
  const merchantId = useSelector((state) => state.auth.merchantId);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("card"); // card | table
  const [currentItem, setCurrentItem] = useState("");
  const [curOpenItem, setCurOpenItem] = useState("");
  const [debouncedCardKey, setDebouncedCardKey] = useState("");
  const [cardKey, setCardKey] = useState("");
  const [openPick, setOpenPick] = useState(false);
  const [pickList, setPickList] = useState([]);
  const [pickHistory, setPickHistory] = useState({
    crosscheck: [],
    imagetwin: [],
  });
  const [openSingleSale, setOpenSingleSale] = useState(false);
  const [singleSaleItem, setSingleSaleItem] = useState(null);
  const [openInvalid, setOpenInvalid] = useState(false);
  const [invalidLoading, setInvalidLoading] = useState(false);
  const [invalidItem, setInvalidItem] = useState(false);
  const [pickLoading, setPickLoading] = useState(false);
  const [openSale, setOpenSale] = useState(false);
  const [confirmSale, setConfirmSale] = useState(false);
  const [confirmPick, setConfirmPick] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderList, setOrderList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pickCount, setPickCount] = useState(1);
  const resetPick = () => {
    setOpenPick(false);
    setConfirmPick(false);
    setPickCount(1);
    setCurOpenItem("");
  };
  const [stat, setStat] = useState({
    crosscheckTotal: 0,
    crosscheckSold: 0,
    crosscheck: 0,
    crosscheckConsumed: 0,
    imagetwinTotal: 0,
    imagetwin: 0,
    imagetwinSold: 0,
    imagetwinConsumed: 0,
  });
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status !== 0,
    }),
  };

  const columns = [
    {
      title: "商品卡密",
      dataIndex: "cardKey",
      ellipsis: true,
      align: "center",
      render: (text) => (
        <Text copyable={{ text }}>
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[cardKey]}
            autoEscape
            textToHighlight={text ? text.toString() : ""}
          />
        </Text>
      ),
    },
    {
      title: "商品状态",
      dataIndex: "status",
      width: 200,
      ellipsis: true,
      align: "center",
      render: (status) => {
        const map = {
          0: { text: "正常", color: "success" },
          1: { text: "已消费", color: "processing" },
          2: { text: "报废", color: "error" },
        };
        const { text, color } = map[status] || {};
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      ellipsis: true,
      align: "center",
    },
    {
      title: "操作",
      ellipsis: true,
      width: 200,
      align: "center",
      render: (_, record) => {
        const disabled = record.status !== 0;
        return (
          <Space>
            <Tooltip title="出售">
              <Button
                size="small"
                icon={<ShoppingCartOutlined />}
                disabled={record.status !== 0}
                onClick={() => {
                  setSingleSaleItem(record);
                  setOpenSingleSale(true);
                }}
              />
            </Tooltip>

            <Tooltip title={"商品作废"}>
              <Button
                size="small"
                icon={<DisconnectOutlined />}
                onClick={() => {
                  setInvalidItem(record);
                  setOpenInvalid(true);
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handleOrderList = async (pageNum, pageSize) => {
    try {
      setLoading(true);
      const obj = {
        pageNum,
        pageSize,
        merchantId,
        status: 0,
        cardKey: debouncedCardKey,
        type: currentItem.type,
      };
      const res = await cardkeyPageList(obj);
      if (res?.code === 200) {
        setOrderList(res.data.records);
        setTotal(res.data.total);
      } else {
        message.error(res.message || "请联系管理员！");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailable = async () => {
    const res = await usedAvailable({ merId: merchantId });
    if (res?.code === 200) {
      setStat(res?.data);
    }
  };

  const getStatByType = (type) => {
    const map = {
      crosscheck: {
        total: stat?.crosscheckTotal || 0,
        sold: stat?.crosscheckSold || 0,
        remaining: stat?.crosscheck || 0,
        used: stat?.crosscheckConsumed || 0,
      },
      imagetwin: {
        total: stat?.imagetwinTotal || 0,
        sold: stat?.imagetwinSold || 0,
        remaining: stat?.imagetwin || 0,
        used: stat?.imagetwinConsumed || 0,
      },
    };

    return (
      map[type] || {
        total: 0,
        sold: 0,
        remaining: 0,
        used: 0,
      }
    );
  };

  const handlePick = async () => {
    try {
      setPickLoading(true);
      const obj = {
        merId: merchantId,
        count: pickCount,
        type: curOpenItem.type,
      };
      const res = await cardkeyExtract(obj);

      if (res?.code === 200) {
        const list = res?.data?.cardIdList || [];

        message.success(`提取卡密成功，已提取 ${list.length} 个`);

        setPickHistory((prev) => ({
          ...prev,
          [curOpenItem.type]: [
            ...list, // 新的在前（更直观）
            // ...prev[curOpenItem.type],
          ],
        }));

        resetPick();
      } else {
        message.error(res?.message || "提取失败");
      }
    } finally {
      setPickLoading(false);
    }
  };

  const handleSale = async () => {
    try {
      setSaleLoading(true);
      const obj = {
        ids: selectedRowKeys,
      };
      const res = await markAsSoldBatch(obj);
      if (res?.code === 200) {
        message.success(
          res?.message || `已成功出售${selectedRowKeys.length}个商品`
        );
        handleOrderList(pageNum, pageSize);
        setConfirmSale(false);
        setOpenSale(false);
      } else {
        message.error(res?.message || "出售失败，请联系管理员！");
      }
    } finally {
      setSaleLoading(false);
    }
  };

  const handleSingleSale = async () => {
    if (!singleSaleItem) return;

    try {
      setSaleLoading(true);
      const res = await markAsSoldBatch({
        ids: [singleSaleItem.id],
      });

      if (res?.code === 200) {
        message.success("出售成功");
        handleOrderList(pageNum, pageSize);
        setOpenSingleSale(false);
        setSingleSaleItem(null);
      } else {
        message.error(res?.message || "出售失败");
      }
    } finally {
      setSaleLoading(false);
    }
  };

  const handleInvalid = async () => {
    try {
      setInvalidLoading(true);
      const res = await cardkeyInvalid(invalidItem.id);
      if (res?.code === 200) {
        message.success(res?.message || "当前卡密已作废成功");
        handleOrderList(pageNum, pageSize);
        setOpenInvalid(false);
      } else {
        message.error(res?.message || "商品作废失败，请联系管理员");
      }
    } finally {
      setInvalidLoading(false);
    }
  };

  useEffect(() => {
    handleAvailable();
  }, []);

  useEffect(() => {
    handleOrderList(pageNum, pageSize);
  }, [pageNum, pageSize, debouncedCardKey, currentItem]);

  /**提取记录 */
  const renderPickHistory = () => {
    const hasAny =
      pickHistory.crosscheck.length || pickHistory.imagetwin.length;

    if (!hasAny) return null;

    return (
      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        {Object.entries(pickHistory).map(([type, list]) => {
          if (!list.length) return null;

          const titleMap = {
            crosscheck: "CrossCheck 提取记录",
            imagetwin: "Imagetwin 提取记录",
          };

          return (
            <Col span={8} key={type}>
              <Card size="small" title={titleMap[type] || type}>
                <div className="space-y-1">
                  {list.map((item, index) => (
                    <Text
                      key={`${type}-${index}`}
                      copyable={{ text: item }}
                      style={{ display: "block" }}
                    >
                      {item}
                    </Text>
                  ))}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  /** 卡片视图 */
  const renderCardView = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        {INVENTORY_LIST.map((item) => {
          const s = getStatByType(item.type);

          return (
            <Col key={item.id} xs={24} md={8}>
              <Card
                hoverable
                className="w-full"
                title={<Title level={5}>{item.name}</Title>}
              >
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <Text type="secondary">剩余库存</Text>
                  <Text strong className="text-green-600">
                    {s.remaining}
                  </Text>

                  <Text type="secondary">已购入数量</Text>
                  <Text strong>{s.total}</Text>

                  <Text type="secondary">已出售数量</Text>
                  <Text strong>{s.sold}</Text>

                  <Text type="secondary">已消费数量</Text>
                  <Text strong>{s.used}</Text>
                </div>

                <Divider className="my-4" />

                <div className="flex justify-around">
                  <Button
                    type="primary"
                    onClick={() => {
                      setOpenPick(true);
                      setCurOpenItem(item);
                    }}
                  >
                    提取
                  </Button>
                  <Button
                    type="default"
                    onClick={() => {
                      setCurrentItem(item);
                      setViewMode("table");
                    }}
                  >
                    详情
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      {renderPickHistory()}
    </>
  );

  /** 表格视图 */
  const renderTableView = () => (
    <Table
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={orderList}
      rowSelection={rowSelection}
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
  );

  /** 卡头顶部 */
  const tableRightActions =
    viewMode === "table" ? (
      <div className="flex items-center gap-3">
        <Text type="secondary">已选 {selectedRowKeys.length} 条</Text>

        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          disabled={!selectedRowKeys.length}
          onClick={() => {
            setOpenSale(true);
          }}
        >
          批量出售
        </Button>
      </div>
    ) : null;

  return (
    <PageCard
      title={
        viewMode === "card" ? (
          "库存"
        ) : (
          <>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => setViewMode("card")}
              className="pl-0"
            >
              返回
            </Button>
            {currentItem?.name + "库存"}
          </>
        )
      }
      rightActions={tableRightActions}
    >
      {viewMode === "card" ? renderCardView() : renderTableView()}

      <Modal
        title={"你确认要出售商品?"}
        width={400}
        open={openSale}
        onCancel={() => setOpenSale(false)}
        footer={[
          <Button key="back" onClick={() => setOpenSale(false)}>
            返回
          </Button>,
          <Button
            key="sale"
            type="primary"
            onClick={() => setConfirmSale(true)}
          >
            下一步
          </Button>,
        ]}
      >
        {`已选择 ${selectedRowKeys.length} 条`}
      </Modal>
      <Modal
        title={`确认出售`}
        width={400}
        open={confirmSale}
        onCancel={() => setConfirmSale(false)}
        footer={[
          <Button key="back" onClick={() => setConfirmSale(false)}>
            返回
          </Button>,
          <Button
            type="primary"
            key="confirmSale"
            loading={saleLoading}
            onClick={() => handleSale()}
          >
            确认出售
          </Button>,
        ]}
      >
        {`确认出售 ${selectedRowKeys.length} 条`}
      </Modal>

      <Modal
        title={`提取 ${curOpenItem?.name}`}
        width={400}
        open={openPick}
        onCancel={resetPick}
        footer={[
          <Button key="back" onClick={resetPick}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={!pickCount || pickCount <= 0}
            onClick={() => setConfirmPick(true)}
          >
            下一步
          </Button>,
        ]}
      >
        <div className="space-y-2">
          <Text type="secondary">请输入提取数量</Text>
          <InputNumber
            min={1}
            max={getStatByType(curOpenItem?.type).remaining}
            value={pickCount}
            onChange={setPickCount}
            className="w-full"
          />
          <Text type="secondary" className="text-xs">
            当前可用库存：
            <Text strong className="ml-1">
              {getStatByType(curOpenItem?.type).remaining}
            </Text>
          </Text>
        </div>
      </Modal>

      <Modal
        title="确认提取卡密"
        width={400}
        open={confirmPick}
        onCancel={() => setConfirmPick(false)}
        footer={[
          <Button key="back" onClick={() => setConfirmPick(false)}>
            返回
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={pickLoading}
            onClick={() => handlePick()}
          >
            确认提取
          </Button>,
        ]}
      >
        <Text>
          确认从 <Text strong>{curOpenItem?.name}</Text> 中提取
          <Text strong className="mx-1 text-red-500">
            {pickCount}
          </Text>
          个卡密？
        </Text>
      </Modal>

      <Modal
        title="商品作废"
        width={400}
        open={openInvalid}
        onCancel={() => setOpenInvalid(false)}
        footer={[
          <Button key="back" onClick={() => setOpenInvalid(false)}>
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={invalidLoading}
            onClick={() => handleInvalid()}
          >
            确认作废
          </Button>,
        ]}
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
          <Text>
            您确定要作废当前商品{currentItem.cardKey}
            吗？作废之后该商品会失效！请谨慎选择
          </Text>
        </Space>
      </Modal>

      <Modal
        title="确认出售商品"
        width={400}
        open={openSingleSale}
        onCancel={() => {
          setOpenSingleSale(false);
          setSingleSaleItem(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setOpenSingleSale(false);
              setSingleSaleItem(null);
            }}
          >
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            icon={<ShoppingCartOutlined />}
            loading={saleLoading}
            onClick={handleSingleSale}
          >
            确认出售
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <Text>您确定要出售商品{singleSaleItem?.cardKey}吗？</Text>
        </Space>
      </Modal>
    </PageCard>
  );
}
