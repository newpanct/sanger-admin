import PageCard from "../../components/PageCard";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Row,
  Col,
  InputNumber,
  Modal,
  message,
} from "antd";
import { useState } from "react";
import {
  memberCompensate,
  memberCount,
  queryByModileOrUserId,
} from "../../server/api";
export default function MemberPage() {
  const [searchForm] = Form.useForm();

  const [phoneForm] = Form.useForm();
  const [dateForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 控制补偿填写弹窗
  const [compensateOpen, setCompensateOpen] = useState(false);

  // 控制弹窗
  const [open, setOpen] = useState(false);

  // 保存当前要确认的数据
  const [confirmData, setConfirmData] = useState(null);

  /* 单个补偿 */
  const handlePhoneSearch = (values) => {
    const { phone, startDate, days } = values;

    const start = startDate?.startOf("day").format("YYYY-MM-DD HH:mm:ss");

    const end = startDate
      ?.startOf("day")
      .add(days, "day")
      .format("YYYY-MM-DD HH:mm:ss");

    setConfirmData({
      type: "single",
      phone,
      start,
      end,
      days,
    });

    setOpen(true);
  };

  /* 批量补偿 */
  const handleDateSearch = async (values) => {
    const { expireDate, days } = values;

    const start = expireDate.startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const end = expireDate
      .startOf("day")
      .add(days, "day")
      .format("YYYY-MM-DD HH:mm:ss");

    // ① 先获取人数
    const count = await getCount(start);

    // 失败就终止
    if (count === null) return;

    // ② 再打开弹窗
    setConfirmData({
      type: "batch",
      start,
      end,
      days,
      count,
    });

    setOpen(true);
  };

  /* 确认执行 */
  const handleConfirm = async () => {
    if (!confirmData) return;

    try {
      setLoading(true);

      let res;

      // 单个补偿
      if (confirmData.type === "single") {
        res = await memberCompensate({
          mobile: confirmData.phone,
          memberTime: confirmData.start,
          days: confirmData.days,
        });
      }

      // 批量补偿
      if (confirmData.type === "batch") {
        res = await memberCompensate({
          mobile: "",
          memberTime: confirmData.start,
          days: confirmData.days,
        });
      }

      if (res?.code === 200) {
        message.success("补偿成功");

        setOpen(false);
        setCompensateOpen(false);
        setConfirmData(null);

        phoneForm.resetFields();
        dateForm.resetFields();
      } else {
        message.error(res?.message || "补偿失败");
      }
    } catch (err) {
      console.error(err);
      message.error("接口请求异常");
    } finally {
      setLoading(false);
    }
  };

  const getCount = async (start) => {
    try {
      setLoading(true);

      const res = await memberCount({
        mobile: "",
        days: "",
        memberTime: start,
      });

      if (res?.code === 200) {
        return res.data || 0; // 返回人数
      } else {
        message.error(res?.message || "统计失败");
        return null;
      }
    } catch (error) {
      console.error(error);
      message.error("统计接口异常");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUser = async (value) => {
    if (!value) {
      message.warning("请输入手机号或ID");
      return;
    }

    try {
      setLoading(true);

      const res = await queryByModileOrUserId(value);

      if (res?.code === 200 && res.data) {
        message.success("查询成功");

        // 保存用户信息
        setCurrentUser(res.data);

        // 打开补偿弹窗
        setCompensateOpen(true);

        // 给表单自动赋值手机号
        phoneForm.setFieldsValue({
          phone: res.data.mobile || value,
        });
      } else {
        message.error(res?.message || "未找到该用户");
      }
    } catch (error) {
      console.error(error);
      message.error("查询异常");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageCard title="会员管理">
      <Row gutter={16} className="mt-2">
        {/* 单个补偿 */}
        <Col span={12}>
          <Card title="会员补偿" variant="outlined">
            <Form
              form={searchForm}
              layout="inline"
              onFinish={(values) => getUser(values.keyword)}
            >
              <Form.Item
                name="keyword"
                rules={[{ required: true, message: "请输入手机号或ID" }]}
              >
                <Input placeholder="手机号 / 用户ID" style={{ width: 200 }} />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading}>
                搜索
              </Button>
            </Form>
          </Card>
        </Col>

        {/* 批量补偿 */}
        <Col span={12}>
          <Card title="批量补偿" variant="outlined">
            <Form form={dateForm} layout="inline" onFinish={handleDateSearch}>
              <Form.Item
                name="expireDate"
                rules={[{ required: true, message: "请输入起始时间" }]}
              >
                <DatePicker placeholder="起始时间" />
              </Form.Item>

              <Form.Item
                name="days"
                rules={[{ required: true, message: "请输入补偿天数" }]}
              >
                <InputNumber min={1} placeholder="天数" />
              </Form.Item>

              <Button type="primary" htmlType="submit">
                补偿
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* 确认弹窗 */}
      <Modal
        title="补偿确认"
        open={open}
        onOk={handleConfirm}
        onCancel={() => setOpen(false)}
        okText="确认"
        cancelText="取消"
        confirmLoading={loading}
      >
        {confirmData && (
          <>
            {confirmData?.type === "batch" && (
              <p>
                影响会员人数：<b>{confirmData.count}</b> 人
              </p>
            )}

            {confirmData.type === "single" && (
              <p>手机号：{confirmData.phone}</p>
            )}

            <p>
              确认补偿 <b>{confirmData.days}</b> 天会员吗？
            </p>
          </>
        )}
      </Modal>

      {/* 单个补偿填写弹窗 */}
      <Modal
        title="会员补偿"
        open={compensateOpen}
        onCancel={() => {
          setCompensateOpen(false);
          phoneForm.resetFields();
        }}
        footer={null}
      >
        <Form form={phoneForm} layout="vertical" onFinish={handlePhoneSearch}>
          <Form.Item name="phone" label="手机号">
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="起始时间"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="days" label="补偿天数" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认补偿
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageCard>
  );
}
