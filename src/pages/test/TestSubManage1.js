import React from "react";
import { Card } from "antd";
import { Pie } from "@ant-design/plots";

const DemoPie = () => {
  const config = {
    data: [
      { type: "分类一", value: 27 },
      { type: "分类二", value: 25 },
      { type: "分类三", value: 18 },
      { type: "分类四", value: 15 },
      { type: "分类五", value: 10 },
      { type: "其他", value: 5 },
    ],
    angleField: "value",
    colorField: "type",
    label: {
      text: "value",
      style: { fontWeight: "bold" },
    },
    legend: {
      color: { title: false, position: "right", rowPadding: 5 },
    },
  };
  return <Pie {...config} />;
};

const TestSubManage1 = () => {
  return (
    <div>
      <h3>测试子管理1</h3>
      <Card title="子管理功能1">
        <DemoPie />
      </Card>
    </div>
  );
};

export default TestSubManage1;
