import React, { useEffect, useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import PageCard from "../../../components/PageCard";
import dayjs from "dayjs";
import { Button, Skeleton, Table, DatePicker,  message } from "antd";
import {
  statisticsIthenticate,
  statisticsImagetwin,
} from "../../../server/api";
export default function StatisticsList({ title, props }) {
  const [errMsg, setErrMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [list, setList] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const apiMap = {
    imagetwin: statisticsImagetwin,
    ithenticate: statisticsIthenticate,
  };
  const handleStatisticsList = async (page = pageNum, size = pageSize) => {
    setLoading(true);
    setErrMsg(null);
    try {
      const params = {
        pageNum: page,
        pageSize: size,
        date: date,
      };
      const api = apiMap[props];
      if (!api) throw new Error("未匹配到接口");
      const res = await api(params);
      if (res?.code === 200) {
        const { records = [], total = 0 } = res.data || {};
        setList(records);
        setTotal(total);
      }else{
        message.error("请联系管理员！");
      }
    } catch (e) {
      console.error(e);
      setErrMsg("数据加载失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "日期", dataIndex: "date", align: "center" },
    { title: "订单数量", dataIndex: "orderCount", align: "center" },
    { title: "销售金额", dataIndex: "amount", align: "center" },
  ];

  useEffect(() => {
    handleStatisticsList(pageNum, pageSize);
  }, [date, pageNum, pageSize]);

  return (
    <PageCard
      title={title}
      extraActions={
        <DatePicker
          picker="month"
          allowClear
          placeholder="选择年月"
          value={date ? dayjs(date, "YYYY-MM") : null}
          onChange={(value) => {
            const newDate = value ? value.format("YYYY-MM") : "";
            setDate(newDate);
            setPageNum(1);
          }}
        />
      }
      rightActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => handleStatisticsList()}
        >
          刷新数据
        </Button>
      }
    >
      {errMsg ? (
        <div className="text-center">
          <p>{errMsg}</p>
          <Button onClick={handleStatisticsList}>重新加载</Button>
        </div>
      ) : (
        <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
          <Table
            rowKey="date"
            columns={columns}
            dataSource={list}
            pagination={{
              current: pageNum,
              pageSize,
              total,
              showSizeChanger: true,
              onChange: (page, size) => {
                setPageNum(page);
                setPageSize(size);
                handleStatisticsList(page, size);
              },
            }}
          />
        </Skeleton>
      )}
    </PageCard>
  );
}
