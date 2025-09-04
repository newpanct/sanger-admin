import React, { useEffect, useRef, useState } from "react";
import {
  Spin,
  Table,
  Space,
  Button,
  Tag,
  Modal,
  Image,
  Descriptions,
  Input,
  Divider,
  Popover,
  Popconfirm,
  Skeleton,
  message,
} from "antd";
import {
  findTotalJournal,
  isOnlineJournal,
  findJournalByTitle,
} from "../../server/api";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import PageCard from "../../components/PageCard";
import baseURL from "../../server/Network";

const JournalPage = () => {
  const [spinning, setSpinning] = useState(false);
  const [JournalArr, setJournalArr] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [detailObj, setDetailObj] = useState({});
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchInput = useRef(null);

  // --- 原有工具函数保留 ---
  const getTagColor = (tag) => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes("cancer")) return "red"; // 红色（癌症相关）
    if (tag.length > 5) return "blue"; // 蓝色（长文本）
    return "green"; // 绿色（默认）
  };

  // 查看详情
  const handleFind = (record) => {
    setDetailObj(record);
    setShowDetail(true);
  };

  // 上下线确认按钮组件（保留）
  const ConfirmButton = ({ isOnline, title, onConfirm }) => {
    const action = isOnline ? "下线" : "上线";
    const icon = isOnline ? <ArrowDownOutlined /> : <ArrowUpOutlined />;

    return (
      <Popconfirm
        title={`${action}${title}`}
        onConfirm={onConfirm}
        onCancel={() => message.error(`取消${action}${title}`)}
        okText="确定"
        cancelText="取消"
      >
        <Button
          type="link"
          size="small"
          icon={icon}
          danger={isOnline} // 下线操作使用danger样式
        >
          {action}
        </Button>
      </Popconfirm>
    );
  };

  // 空数据格式化（保留）
  const formatEmptyData = (data) => {
    if (data === null || data === undefined || data === "") {
      return "not data";
    }
    return data;
  };

  // --- 原有业务逻辑保留 ---
  const handleSearch = () => {
    const searchValue = searchText.trim();
    if (searchValue) {
      setIsSearching(true);
      setPageNumber(1); // 搜索时重置到第一页
      fetchSearchData();
    } else {
      // 无搜索关键词时，加载全部数据
      setIsSearching(false);
      fetchData();
    }
  };

  const handleResetSearch = () => {
    setSearchText(""); // 清空输入框
    setIsSearching(false); // 重置搜索状态
    setPageNumber(1); // 重置到第一页
    fetchData(); // 加载全部数据
  };

  // 获取全部期刊数据
  const fetchData = async () => {
    try {
      setSpinning(true);
      const obj = { pageNumber: pageNumber, pageSize: pageSize };
      const response = await findTotalJournal(obj);
      if (response.code === 200) {
        const sortArr = response.data.data.sort((a, b) => b.id - a.id);
        setJournalArr(sortArr);
        setTotalCount(response.data.totalCount);
      } else {
        message.error("获取期刊数据失败");
      }
    } catch (error) {
      console.error(error);
      message.error("期刊获取出错");
    } finally {
      setSpinning(false);
    }
  };

  // 根据标题搜索期刊
  const fetchSearchData = async () => {
    try {
      setSpinning(true);
      const obj = {
        title: searchText,
        pageNumber: pageNumber,
        pageSize: pageSize,
      };
      const response = await findJournalByTitle(obj);
      if (response.code === 200) {
        setJournalArr(response.data.data);
        setTotalCount(response.data.totalCount);
      } else {
        message.error("搜索期刊失败");
      }
    } catch (error) {
      console.error(error);
      message.error("搜索出错");
    } finally {
      setSpinning(false);
    }
  };

  // 上下线操作
  const handleIsOnline = async (record) => {
    const status = record.isOnline === 1 ? 0 : 1;
    try {
      setSpinning(true);
      const obj = { id: record.id, isOnline: status };
      const response = await isOnlineJournal(obj);
      if (response.code === 200) {
        status === 1
          ? message.success(response.msg)
          : message.warning(response.msg);
        // 根据当前状态决定刷新哪种数据
        setJournalArr((prev) =>
          prev.map((item) =>
            item.id === record.id ? { ...item, isOnline: status } : item
          )
        );
      } else {
        message.error("操作失败");
      }
    } catch (error) {
      console.error(error);
      message.error("上下线出错");
    } finally {
      setSpinning(false);
    }
  };

  // --- 详情弹窗配置保留 ---
  const items = [
    { key: "id", label: "id", children: detailObj.id },
    { key: "issn", label: "ISSN", children: detailObj.issn },
    { key: "jcr", label: "JCR分区", children: detailObj.jcr },
    { key: "latestIF", label: "最新影响因子", children: detailObj.latestIF },
    {
      key: "journalTypeZh",
      label: "类别",
      children: (() => {
        const journalType = detailObj?.journalTypeZh;
        if (!journalType) return null;
        const typeList = Array.isArray(journalType)
          ? journalType
          : typeof journalType === "string"
          ? journalType.split(",")
          : [journalType];
        return typeList.map((type, index) => (
          <Tag
            key={index}
            color={getTagColor(type)}
            style={{ marginBottom: "8px" }}
          >
            {typeof type === "string" ? type.trim() : type}
          </Tag>
        ));
      })(),
    },
    {
      key: "zkyPartition",
      label: "中科院分区",
      children: detailObj.zkyPartition,
    },
    { key: "updateTime", label: "更新时间", children: detailObj.updateTime },
    {
      key: "frontPath",
      label: "图片",
      children: (
        <Image
          src={`${baseURL}${detailObj?.frontPath}`}
          alt="期刊封面"
          width={200}
        />
      ),
    },
  ];

  // --- 生命周期钩子保留 ---
  useEffect(() => {
    isSearching && searchText ? fetchSearchData() : fetchData();
  }, [pageNumber, pageSize]);

  // --- 核心变更：表格从columns数组改为<Column>子组件 ---
  return (
    <PageCard
      title="首页期刊推荐"
      extraActions={
        <>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={spinning}
            onClick={() => {
              setPageNumber(1);
              isSearching && searchText ? fetchSearchData() : fetchData();
            }}
          >
            刷新数据
          </Button>
        </>
      }
      rightActions={
        <Space>
          <Input
            placeholder="请搜索标题..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 220 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            onClear={handleResetSearch}
          />
          <Divider type="vertical" />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info("待开发")}
          >
            创建期刊(Excel)
          </Button>
        </Space>
      }
    >
      <Skeleton loading={spinning} active paragraph={{ rows: 6 }}>
        {/* 表格结构改为UserPage的<Column>子组件形式 */}
        <Table
          rowKey="id" // 保持原有rowKey
          dataSource={JournalArr} // 保持原有数据源
          bordered // 保持边框样式
          pagination={{
            current: pageNumber,
            pageSize: pageSize,
            total: totalCount,
            onChange: (page, size) => {
              setPageNumber(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条期刊`,
            pageSizeOptions: ["5", "10", "15"],
          }}
        >
          <Table.Column title="id" dataIndex="id" key="id" align="center" />

          <Table.Column
            title="期刊标题"
            dataIndex="title"
            key="title"
            align="center"
            ellipsis // 超出省略
            render={(text) => {
              const processedText = formatEmptyData(text);
              if (processedText === "not data") return processedText;
              // 搜索高亮逻辑
              if (searchText.trim()) {
                return (
                  <Highlighter
                    highlightStyle={{
                      backgroundColor: "#ffc069",
                      padding: 2,
                      borderRadius: 2,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={processedText.toString()}
                  />
                );
              }
              return processedText;
            }}
          />

          {/* 3. ISSN列（保留空数据处理） */}
          <Table.Column
            title="ISSN"
            dataIndex="issn"
            key="issn"
            align="center"
            render={(text) => formatEmptyData(text)}
          />

          {/* 4. 最新影响因子列 */}
          <Table.Column
            title="最新影响因子"
            dataIndex="latestIF"
            key="latestIF"
            align="center"
            ellipsis
            sorter={(a, b) => {
              return a.latestIF - b.latestIF;
            }}
          />

          {/* 5. 类别列（保留Tag+Popover逻辑） */}
          <Table.Column
            title="类别"
            dataIndex="journalTypeZh"
            key="journalTypeZh"
            align="center"
            ellipsis
            render={(value) => {
              if (!value || typeof value !== "string") {
                return <Tag color="gray">无类别信息</Tag>;
              }
              const tags = value.split(",").filter((tag) => tag.trim() !== "");
              if (tags.length === 0) {
                return <Tag color="gray">无有效类别</Tag>;
              }
              const renderTag = (tag, index) => (
                <Tag
                  color={getTagColor(tag)}
                  style={{ margin: "0 4px 0 0", cursor: "pointer" }}
                  key={`journal-tag-${index}-${tag}`}
                >
                  {tag}
                </Tag>
              );
              // Popover显示全部类别
              return (
                <Popover
                  title="全部类别"
                  content={
                    <div style={{ textAlign: "center" }}>
                      {tags.map((tag, index) => (
                        <div
                          key={index}
                          style={{ marginBottom: 6, width: "100%" }}
                        >
                          {renderTag(tag, index)}
                        </div>
                      ))}
                    </div>
                  }
                >
                  {tags.map((tag, index) => (
                    <Tag
                      color={getTagColor(tag.trim())}
                      style={{ margin: "2px", cursor: "pointer" }}
                      key={`journal-tag-${index}-${tag.trim()}`}
                    >
                      {tag.trim()}
                    </Tag>
                  ))}
                </Popover>
              );
            }}
          />

          {/* 6. 中科院分区列 */}
          <Table.Column
            title="中科院分区"
            dataIndex="zkyPartition"
            key="zkyPartition"
            align="center"
          />

          {/* 7. 更新时间列 */}
          <Table.Column
            title="更新时间"
            dataIndex="updateTime"
            key="updateTime"
            align="center"
            sorter={(a, b) => {
              if (!a.update_time) return 1;
              if (!b.update_time) return -1;
              return new Date(a.update_time) - new Date(b.update_time);
            }}
            render={(time) => <span>{time ? time : "-"}</span>}
          />

          {/* 8. 操作列（保留查看+上下线按钮） */}
          <Table.Column
            title="操作"
            key="action" // 改为UserPage风格的key="action"
            align="center"
            render={(
              _,
              record // _ 是dataIndex对应值（无），record是当前行数据
            ) => (
              <Space size="middle">
                {/* 查看按钮 */}
                <Button
                  type="link"
                  size="small"
                  icon={<ProfileOutlined />}
                  onClick={() => handleFind(record)}
                >
                  查看
                </Button>
                {/* 上下线确认按钮 */}
                <ConfirmButton
                  isOnline={record.isOnline !== 0}
                  title={record.title}
                  onConfirm={() => handleIsOnline(record)}
                />
              </Space>
            )}
          />
        </Table>
      </Skeleton>

      {/* 详情弹窗（保留原有逻辑） */}
      <Modal
        open={showDetail}
        onOk={() => setShowDetail(false)}
        onCancel={() => setShowDetail(false)}
        width={1000}
      >
        <Descriptions title={detailObj.title} bordered items={items} />
      </Modal>
    </PageCard>
  );
};

export default JournalPage;
