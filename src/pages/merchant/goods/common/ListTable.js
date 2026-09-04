import { useEffect, useState, useCallback } from "react";
import PageCard from "../../../../components/PageCard";
import { Table, Typography, Tag, message, Button, Select } from "antd";
import { cardkeyPageList, soldPageList } from "../../../../server/api";
import { useSelector } from "react-redux";
import { ReloadOutlined } from "@ant-design/icons";
import SearchInput from "../../../../components/SearchInput";
import HighlightText from "../../../../components/HighlightText";
import { debounce } from "lodash";

const { Text } = Typography;

const TypeOptions = [
  { value: "crosscheck", label: "CrossCheck" },
  { value: "imagetwin", label: "imagetwin" },
];

export default function ListTable({title,props,status}) {
  const merchantId = useSelector((state) => state.auth.merchantId);
  const [list, setList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [cardKey, setCardKey] = useState("");
  const [debouncedCardKey, setDebouncedCardKey] = useState("");
  const [type, setType] = useState("crosscheck");
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const apiMap = {
    sold:soldPageList,
    invalidated:cardkeyPageList,
  };
  
  const columns = [
    {
      title: "商品卡密",
      dataIndex: "cardKey",
      ellipsis: true,
      align: "center",
      render: (text) => (
        <Text copyable={{ text }}>
          <HighlightText text={text} keyword={debouncedCardKey} />
        </Text>
      ),
    },
    {
      title: "商品状态",
      align: "center",
      width: 200,
      render: (_, record) => {
        const statusMap = {
          0: { text: "正常", color: "success" },
          1: { text: "已消费", color: "processing" },
          2: { text: "作废", color: "error" },
        };
    
        const { text, color } = statusMap[record.status] || {
          text: "-",
          color: "default",
        };

        if(record.status === 1){
          return <Tag color="success">已消费</Tag>;
        }

        if (record.isSold === 1) {
          return <Tag color="processing">已出售</Tag>;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },    
    {
      title: "创建时间",
      dataIndex: "createTime",
      ellipsis: true,
      align: "center",
    },
  ];

  const handleList = async (pageNum, pageSize) => {
    try {
      setTableLoading(true);
      const obj = {
        pageNum,
        pageSize,
        merchantId,
        cardKey: debouncedCardKey,
        type,
        ...(props === "invalidated" ? { status: 2 } : {})
      };
      const api = apiMap[props];
      const res = await api(obj);
      if (res?.code === 200) {
        setTotal(res.data.total);
        setList(res.data.records);
      } else {
        message.error(res.message || "请联系管理员！");
      }
    } finally {
      setTableLoading(false);
    }
  };

  // 防抖处理搜索
  const debounceSearch = useCallback(
    debounce((val) => {
      setDebouncedCardKey(val);
      setPageNum(1); // 搜索重置页码
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    setCardKey(e.target.value);
    debounceSearch(e.target.value);
  };

  const handleTypeChange = (value) => {
    setType(value);
    setPageNum(1); // 筛选类型也重置页码
  };

  // 监听分页、搜索关键词、类型变化
  useEffect(() => {
    handleList(pageNum, pageSize);
  }, [pageNum, pageSize, debouncedCardKey, type]);

  return (
    <PageCard
      title={title}
      extraActions={
        <>
          <Select
            defaultValue="crosscheck"
            onChange={handleTypeChange}
            options={TypeOptions}
          />
          <SearchInput
            placeholder="搜索卡密"
            value={cardKey}
            onChange={handleSearchChange}
          />
        </>
      }
      rightActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => handleList(pageNum, pageSize)}
        >
          刷新数据
        </Button>
      }
    >
      <Table
        size="middle"
        rowKey={"id"}
        columns={columns}
        loading={tableLoading}
        dataSource={list}
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
    </PageCard>
  );
}
