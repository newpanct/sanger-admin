import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Skeleton,
  Input,
  message,
} from "antd";
import {
  findAllCertification,
  findCertTitle,
  downloadCert,
} from "../../server/api";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import PageCard from "../../components/PageCard";
import Highlighter from "react-highlight-words";
const { Search } = Input;
const CertificationPage = () => {
  const [spinning, setSpinning] = useState(false);
  const [certificationArr, setCertificationArr] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [total, setTotal] = useState(0);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if ((currentPage || pageSize) && !title) {
      fetchData();
    }
  }, [currentPage, pageSize, title]);

  // 空数据格式化（保留）
  const formatEmptyData = (data) => {
    if (data === null || data === undefined || data === "") {
      return "not data";
    }
    return data;
  };
  const columns = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "证书标题",
      key: "title",
      dataIndex: "title",
      align: "center",
      render: (text) => {
        const processedText = formatEmptyData(text);
        if (processedText === "not data") return processedText;
        if (searchText.trim()) {
          return (
            <Highlighter
              highlightStyle={{
                backgroundColor: "#ffc069",
                padding: 2,
                borderRadius: 2,
              }}
              searchWords={[searchText.trim()]}
              autoEscape
              textToHighlight={processedText.toString()}
            />
          );
        }
        return processedText;
      },
    },
    {
      title: "证书标识",
      dataIndex: "manuscriptId",
      key: "manuscriptId",
      align: "center",
    },
    {
      title: "邮箱",
      key: "email",
      dataIndex: "email",
      align: "center",
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      key: "updateTime",
      align: "center",
      sorter: (a, b) => new Date(a.updateTime) - new Date(b.updateTime),
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
        </Space>
      ),
    },
  ];
  const fetchData = async () => {
    setErrorMsg("");
    try {
      setSpinning(true);
      const obj = {
        pageSize: pageSize,
        pageNumber: currentPage,
      };
      const response = await findAllCertification(obj);
      if (response.code === 200) {
        const list = response.data.data.sort((a, b) => b.id - a.id);
        setCertificationArr(list);
        setTotal(response.data.totalCount);
      }
    } catch (error) {
      const errMsg = error?.message || "获取用户数据失败，请重试";
      setErrorMsg(errMsg);
      message.error(errMsg);
    } finally {
      setSpinning(false);
    }
  };

  const handleDownload = async (record) => {
    try {
      setSpinning(true);
      const response = await downloadCert(record.id);
      if (response) {
        message.warning("请查看");
      }
    } catch (error) {
      console.error(error);
      message.error("下载错误");
    } finally {
      setSpinning(false);
    }
  };

  const handleShowAll = async (value) => {
    setTitle("");
    setTotal(0);
    message.info("已显示全部期刊数据");
  };
  const onSearch = async (value) => {
    if (value.trim() === "") {
      message.warning("请输入期刊标题");
      return;
    }
    setTitle(value);
    try {
      setSpinning(true);
      const response = await findCertTitle(value);
      if (response.code === 200) {
        if (response.data.length > 0) {
          message.success(`共有${response.data.length}条数据`);
        } else {
          message.warning(`没有标题为${value}的数据`);
        }
        setCertificationArr(response.data);
        setTotal(response.data.length);
      }
    } catch (error) {
      console.error(error);
      message.error("期刊获取错误");
    } finally {
      setSpinning(false);
    }
  };

  return (
    <PageCard
      title="证书管理"
      extraActions={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          loading={spinning}
          onClick={handleShowAll}
        >
          刷新数据
        </Button>
      }
      rightActions={
        <Space>
          <Search
            placeholder="请输入证书标题"
            onSearch={onSearch}
            style={{ width: 220 }}
          />
        </Space>
      }
    >
      {errorMsg ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>{errorMsg}</p>
          <Button onClick={fetchData} icon={<ReloadOutlined />}>
            重新加载
          </Button>
        </div>
      ) : (
        <Skeleton loading={spinning} active paragraph={{ rows: 6 }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={certificationArr}
            bordered
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showTotal: (total) => `共 ${total} 条证书`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "15"],
            }}
          />
        </Skeleton>
      )}
    </PageCard>
  );
};

export default CertificationPage;
