/* global WxLogin */
import { useEffect, useState, useRef } from "react";
import PageCard from "../../../components/PageCard";
import { ApiOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  Button,
  Row,
  Col,
  Badge,
  Skeleton,
  Statistic,
  Card,
  Table,
  Modal,
  Typography,
  message,
  Space,
} from "antd";
import { useSelector } from "react-redux";
import {
  generateState,
  merchantDashboard,
  merchantOrderPageList,
  wxchatBindState,
} from "../../../server/api";
import OrderTableCard from "./components/BillList";
const { Text } = Typography;
export default function InformationPage() {
  const merchantBalance = useSelector((state) => state.auth.merchantBalance);
  const wechatName = useSelector((state) => state.auth.wechatName);
  const merchantId = useSelector((state) => state.auth.merchantId);
  const [loading, setLoading] = useState(false);
  const [openBindWechat, setOpenBindWechat] = useState(false);
  const [openIsBind, setOpenIsBind] = useState(false);
  const [wxState, setWxState] = useState(""); //nickName
  const pollTimerRef = useRef(null);
  const startTimeRef = useRef(0);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderList, setOrderList] = useState([]);
  const [merchantInfo, setMerchantInfo] = useState({
    totalOrders: 0, //总单数
    soldOrders: 0, //出售单数
    consumeOrders: 0, //消费单数
    scrapOrders: 0, //报废单数
  });
  const metrics = [
    {
      title: "当前账号余额",
      value: merchantBalance,
      suffix: "元",
      color: "#3f8600",
    },
    {
      title: "已购入商品",
      value: merchantInfo?.totalOrders|| 0,
      suffix: "个",
      color: "#1E9FFF",
    },
    {
      title: "已出售商品",
      value: merchantInfo?.soldOrders|| 0,
      suffix: "个",
      color: "#2F4056",
    },
    {
      title: "已消费商品",
      value: merchantInfo?.consumeOrders|| 0,
      suffix: "个",
      color: "#009688",
    },
    {
      title: "已作废商品",
      value: merchantInfo?.scrapOrders || 0,
      suffix: "个",
      color: "#FFB800",
    },
  ];

  const handleInfo = async () => {
    try {
      setLoading(true);
      const obj = {
        merId: merchantId,
      };
      const res = await merchantDashboard(obj);
      if (res?.code === 200) {
        setMerchantInfo((prev) => ({
          ...prev,
          totalOrders: res.data?.totalOrders,
          soldOrders: res.data?.soldOrders,
          consumeOrders: res.data?.consumeOrders,
          scrapOrders: res.data?.scrapOrders,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // const handlePageList = async (pageNum, pageSize) => {
  //   try {
  //     setLoading(true);
  //     const obj = {
  //       pageNum,
  //       pageSize,
  //       merchantId,
  //     };
  //     const res = await merchantOrderPageList(obj);
  //     if (res?.code === 200) {
  //       setOrderList(res?.data.records);
  //       setTotal(res?.data.total);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onGetState = async () => {
    const res = await generateState(merchantId);
    if (res?.code === 200) {
      return res.data;
    } else {
      return null;
    }
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!openBindWechat) return;

    (async () => {
      const state = await onGetState();
      setWxState(state);
    })();
  }, [openBindWechat]);

  useEffect(() => {
    if (!wxState) return;
    const container = document.getElementById("wxLoginContainer");
    if (!container) return;

    container.innerHTML = "";

    const redirect = encodeURIComponent(
      "https://sangerbox.com/api/v2/user/merchant/wechat/bind/callback"
    );

    new WxLogin({
      self_redirect: true,
      id: "wxLoginContainer",
      appid: "wx214d2ccc7c0b3d3b",
      scope: "snsapi_login",
      redirect_uri: redirect,
      state: wxState,
    });
  }, [wxState]);

  useEffect(() => {
    if (!wxState || !openBindWechat) return;

    startTimeRef.current = Date.now();

    pollTimerRef.current = setInterval(async () => {
      const res = await wxchatBindState(wxState);

      if (res?.data?.status === 1) {
        message.success(res?.message || "商户绑定微信成功！");

        setMerchantInfo((prev) => ({
          ...prev,
          wechatNickname: res.data.nickName || "已绑定",
        }));

        stopPolling();
        setOpenBindWechat(false);
      } else if (res?.data?.status === 2) {
        message.warning(res?.message || "商户取消授权！");
        stopPolling();
        setOpenBindWechat(false);
      }
    }, 2000);

    return stopPolling;
  }, [wxState, openBindWechat]);

  useEffect(() => {
    handleInfo();
  }, []);

  // useEffect(() => {
  //   handlePageList(pageNum, pageSize);
  // }, [pageNum, pageSize]);
  return (
    <PageCard
      title="商户信息"
      rightActions={
        <Button type="primary" icon={<ReloadOutlined />} loading={loading}>
          刷新数据
        </Button>
      }
    >
      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        {metrics.map((m, i) => (
          <Col xs={24} sm={12} md={8} lg={4} key={i}>
            <Badge.Ribbon text="实时" color={m.color}>
              <Card
                hoverable
                className={m.clickable ? "cursor-pointer" : ""}
                onClick={() => {
                  if (m.action === "bindWechat") {
                    setOpenBindWechat(true);
                  }
                }}
              >
                <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                  <Statistic
                    title={m.title}
                    value={m.value}
                    suffix={m.suffix}
                    valueStyle={{ color: m.color }}
                  />
                </Skeleton>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        <Col xs={6} md={6}>
          <Card size="small" title="绑定微信">
            <div className="text-center">
              {wechatName ? `商户已绑定微信：${wechatName}` : "当前商户未绑定微信"}
              <br />
              <Button
                type="primary"
                icon={<ApiOutlined />}
                className="mt-4"
                onClick={() => {
                  wechatName ? setOpenIsBind(true) : setOpenBindWechat(true);
                }}
              >
                绑定微信
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
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
      </Row> */}

      <Modal
        title={`当前商户已绑定微信`}
        width={400}
        open={openIsBind}
        onCancel={() => {
          setOpenIsBind(false);
        }}
        footer={[
          <Button
            key={"back"}
            onClick={() => {
              setOpenIsBind(false);
            }}
          >
            返回
          </Button>,
          <Button
            key={"bind"}
            type="primary"
            onClick={() => {
              setOpenIsBind(false);
              setOpenBindWechat(true);
            }}
          >
            下一步
          </Button>,
        ]}
      >
        <Space
          direction="vertical"
          size="middle"
          align="center"
          style={{ width: "100%", padding: "16px 0" }}
        >
          <ApiOutlined style={{ fontSize: "48px" }} />
          <Text>你当前已绑定微信</Text>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            如果你要更换微信的话点击下一步之后扫码重新绑定新微信即可
          </Text>
        </Space>
      </Modal>

      <Modal
        title={`${wechatName?"重新绑定新微信":"绑定微信"}`}
        open={openBindWechat}
        onCancel={() => {
          stopPolling();
          setOpenBindWechat(false);
        }}
        footer={null}
        width={400}
      >
        <div className="flex flex-col items-center space-y-4 py-4">
          <div id="wxLoginContainer" />
        </div>
      </Modal>
    </PageCard>
  );
}
