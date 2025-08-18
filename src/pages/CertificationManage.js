import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Spin, Tag,Popconfirm,Input, message } from 'antd';
import { findAllCertification,findCertTitle,downloadCert } from '../api/admin';
import { DownloadOutlined } from '@ant-design/icons';
const { Search } = Input;
const CertificationManage = () => {
  const [spinning, setSpinning] = useState(false);
  const [certificationArr, setCertificationArr] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if((currentPage || pageSize) && !title){
      fetchData();
    }
  }, [currentPage,pageSize,title]);
  
  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      align:"center"
    },
    {
      title: '证书标题',
      key: 'title',
      dataIndex: 'title',
      align:"center"
    },
    {
      title: '证书标识',
      dataIndex: 'manuscriptId',
      key: 'manuscriptId',
      align:"center"
    },
    {
      title: '邮箱',
      key: 'email',
      dataIndex: 'email',
      align:"center"
    },
    // {
    //   title: '手机号',
    //   key: 'mobile',
    //   dataIndex: 'mobile',
    //   align:"center"
    // },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      align:"center"
    },
    {
      title: '操作',
      key: 'action',
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
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
    try {
      setSpinning(true);
      const obj = {
        pageSize: pageSize,
        pageNumber: currentPage,
      };
      const response = await findAllCertification(obj);
      if (response.code === 200) {
        setCertificationArr(response.data.data);
        setTotal(response.data.totalCount);
      }
    } catch (error) {
      console.error(error);
      message.error('期刊获取错误');
    } finally {
      setSpinning(false);
    }
  };

  const handleDownload = async(record)=> {
    try {
      setSpinning(true);
      const response = await downloadCert(record.id);
      if(response){
        message.warning('请查看');
      }
    } catch (error) {
      console.error(error);
      message.error('下载错误');
    } finally {
      setSpinning(false);
    }
  }

  const handleShowAll = async (value) =>{
    setTitle('');
    message.info('已显示全部期刊数据');
  }
  const onSearch = async (value) =>{
    if(value.trim() === "") {
      message.warning('请输入期刊标题');
      return
    }
    setTitle(value);
    try {
      setSpinning(true)
      const response = await findCertTitle(value);
      if (response.code === 200) {
        if(response.data.length > 0){
          message.success(`共有${response.data.length}条数据`);
        }else{
          message.warning(`没有标题为${value}的数据`);
        }
        setCertificationArr(response.data);
        setTotal(response.data.length);
      }
    } catch (error) {
      console.error(error);
      message.error('期刊获取错误');
    } finally {
      setSpinning(false);
    }
  }
  
  return (
    <>
    <Spin spinning={spinning} fullscreen />
    <div>
      <h2>
        <span>证书管理</span>
        <Button type='link' onClick={handleShowAll}>全部证书</Button>
        <Search 
          placeholder="请输入证书标题"
          onSearch={onSearch} style={{ width: 200 }}/>
      </h2>
        <Table 
        rowKey="id"
        columns={columns} 
        dataSource={certificationArr}
        bordered
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '15'],
        }}
        />
    </div>
    </>
  );
};

export default CertificationManage;