import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  Typography,
  message,
  Space,
  Tag,
} from "antd";
import { ReloadOutlined, ShoppingCartOutlined,ArrowUpOutlined , ArrowDownOutlined, SwapOutlined } from "@ant-design/icons";
import PageCard from "../../../components/PageCard";
import { cardkeyAdd, merchantOrderPageList } from "../../../server/api";
import { useSelector } from "react-redux";
import OrderTableCard from "./components/BillList";
const { Title, Text } = Typography;

// 商品数据
const PRODUCTS = [
  {
    id: 1,
    name: "CrossCheck",
    type: "crosscheck",
    price: 24, // 单价
    unit: "件",
    direction:
      "CrossCheck查重确保内容的原创性至关重要，保障论文的质量与可信度。",
    img: "/images/CrossCheck.png",
  },
  {
    id: 2,
    name: "imagetwin",
    type: "imagetwin",
    price: 49,
    unit: "件",
    direction:
      "Imagetwin 是一款图像分析 AI 工具，用于检测科研论文图片的完整性问题，例如重复使用（重复图/复用）、图像篡改、抄袭，以及 AI 生成内容。",
    img: "/images/imagetwin.svg",
  },
];

export default function PurchasePage() {
  const merchantId = useSelector((state) => state.auth.merchantId);
  const merchantBalance = useSelector((state) => state.auth.merchantBalance);
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false); // 订单列表
  const [purchaseLoading, setPurchaseLoading] = useState(false); // 下单
  const [confirmLoading, setConfirmLoading] = useState(false); // 确认支付按钮

  const [currentItem, setCurrentItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);
  const [form] = Form.useForm();
  const count = Form.useWatch("count", form) || 1;
  const totalAmount = count * (currentItem?.price || 0);
  const balanceEnough = merchantBalance >= totalAmount;
  const handleBuyClick = useCallback(
    (product) => {
      setCurrentItem(product);
      setOpen(true);
      form.setFieldsValue({ count: 1 }); // 重置购买数量为 1
    },
    [form]
  );
  const handlePageList = async (pageNum, pageSize) => {
    try {
      setListLoading(true);
      const obj = {
        pageNum,
        pageSize,
        merchantId,
      };
      const res = await merchantOrderPageList(obj);
      if (res?.code === 200) {
        setOrderList(res?.data.records);
        setTotal(res?.data.total);
      }
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    handlePageList(pageNum, pageSize);
  }, [pageNum, pageSize]);

  const handlePurchase = async (values) => {
    if (!merchantId || !currentItem) return;

    const { count } = values;

    try {
      setConfirmLoading(true);

      const obj = {
        merchantId,
        count,
        type: currentItem.type,
      };
      // 模拟 API 调用
      const res = await cardkeyAdd(obj);

      if (res.code === 200) {
        message.success(res.message || "购买成功！");
        setConfirmOpen(false);
        setOpen(false);
        handlePageList(pageNum, pageSize);
        form.resetFields();
      } else {
        message.error({
          content: res.message || "购买失败，请重试。",
          key: "purchase",
        });
      }
    } catch (error) {
      console.error(error);
      message.error({ content: "购买请求发生错误。", key: "purchase" });
    } finally {
      setConfirmLoading(false);
    }
  };

  // 3. 计算总价 (用于模态框中的实时显示)
  const calculateTotal =
    Form.useWatch("count", form) * (currentItem?.price || 0);

  const handlePreConfirm = () => {
    form.validateFields().then((values) => {
      setPendingValues(values);
      setConfirmOpen(true);
    });
  };

  return (
    <PageCard
      title={"购买商品"}
      rightActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => handlePageList(pageNum, pageSize)}
        >
          刷新账单
        </Button>
      }
    >
      {/* 商品卡片列表 */}
      <Row gutter={[16, 16]} align="stretch" style={{ marginTop: 12 }}>
        {PRODUCTS.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6} className="flex">
            <Card
              hoverable
              className="h-full w-full"
              title={product.name}
              extra={
                <Text className="text-green-600 font-semibold">
                  ¥ {product.price} / {product.unit}
                </Text>
              }
            >
              <div className="flex h-[230px] flex-col">
                {/* 图片 */}
                <div className="flex h-[80px] items-center justify-center mb-2">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* 描述 */}
                <p className="flex-1 text-gray-500 leading-relaxed line-clamp-3">
                  {product.direction}
                </p>

                {/* 底部按钮 */}
                <div className="mt-3">
                  <Button
                    type="primary"
                    block
                    icon={<ShoppingCartOutlined />}
                    onClick={() => handleBuyClick(product)}
                  >
                    立即购买
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>


      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        <Col xs={24} md={24}>
          <OrderTableCard
            title="账单记录"
            dataSource={orderList}
            loading={loading}
            pageNum={pageNum}
            pageSize={pageSize}
            total={total}
            onPageChange={(page, size) => {
              setPageNum(page);
              setPageSize(size);
            }}
          />
        </Col>
      </Row>
      {/* 购买模态框 */}
      <Modal
        title={`购买 ${currentItem?.name || ""}`}
        open={open}
        width={400}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="back" onClick={() => setOpen(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handlePreConfirm}>
            确认购买 (总价: ¥ {calculateTotal.toFixed(2)})
          </Button>,
        ]}
      >
        {currentItem && (
          <Form
            form={form}
            name="purchaseForm"
            onFinish={handlePurchase}
            initialValues={{ count: 1 }}
            layout="vertical"
            style={{ marginTop: 20 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text>
                单价: ¥ {currentItem.price} / {currentItem.unit}
              </Text>
              <Form.Item
                name="count"
                label={`购买数量 (最低 1 ${currentItem.unit})`}
                rules={[
                  { required: true, message: "请输入购买数量！" },
                  { type: "number", min: 1, message: "数量必须大于等于1" },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder="请输入数量"
                  precision={0}
                />
              </Form.Item>

              <Text type="secondary">
                总金额:{" "}
                <Text strong style={{ fontSize: 16 }}>
                  ¥ {calculateTotal.toFixed(2)}
                </Text>
              </Text>
            </Space>
          </Form>
        )}
      </Modal>

      {/* 确认 */}
      <Modal
        title="确认支付"
        open={confirmOpen}
        width={400}
        onCancel={() => setConfirmOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmOpen(false)}>
            取消
          </Button>,
          <Button
            key="pay"
            type="primary"
            loading={confirmLoading}
            disabled={!balanceEnough}
            onClick={() => handlePurchase(pendingValues)}
          >
            确认支付
          </Button>,
        ]}
      >
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between">
            <Text>商品</Text>
            <Text strong>{currentItem?.name}</Text>
          </div>

          <div className="flex justify-between">
            <Text>购买数量</Text>
            <Text strong>{count}</Text>
          </div>

          <div className="flex justify-between">
            <Text>订单金额</Text>
            <Text strong className="text-red-500">
              ¥ {totalAmount.toFixed(2)}
            </Text>
          </div>

          <div className="flex justify-between">
            <Text>当前余额</Text>
            <Text
              strong
              className={balanceEnough ? "text-green-600" : "text-red-500"}
            >
              ¥ {merchantBalance?.toFixed(2)}
            </Text>
          </div>

          {!balanceEnough && (
            <Text type="danger" className="text-sm">
              余额不足，请先充值
            </Text>
          )}
        </Space>
      </Modal>
    </PageCard>
  );
}
