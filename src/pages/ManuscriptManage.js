import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Spin,Row,Col,Typography,Tag,Modal,Steps,Image,Input, Select,message } from 'antd';
import { findAllManuscript,
  downloadFileById,
  findStatusById,
  findManuTitle,
  operateManuscriptById, } from '../api/admin';
import { 
  DownloadOutlined,
  HourglassOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined } from '@ant-design/icons';
const {Text} = Typography;
const { Step } = Steps;
const { Option } = Select;
const { Search } = Input;
const ManuscriptManage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [show, setShow] = useState(false);
  const [manuscriptArr, setManuscriptArr] = useState([]);
  const [currentManuscript, setCurrentManuscript] = useState({}); 
  const [status, setStatus] = useState({}); 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [title, setTitle] = useState('');
  const [currentStep, setCurrentStep] = useState(0); // 当前步骤索引（0-7）
  const [stepsData] = useState([
    { title: '提交预审', description: '作者完成稿件提交，系统已接收' },
    { title: '稿件完整性评估', description: '期刊正在进行稿件完整性评估' },
    { title: '学术诚信评估', description: '期刊正在进行学术诚信评估' },
    { title: '内容质量评估', description: '期刊正在进行内容质量评估' },
    { title: '语言水平评估', description: '期刊正在进行语言水平评估' },
    { title: '最终质量判定', description: '最终质量判定' },
    { title: '生成证书和快速评审id', description: '期刊正在生成证书和快速评审id' },
    { title: '官网投稿、快速流程处理', description: '该期刊已生成证书，可在证书管理查看' },
  ]);
  const fetchData = async () => {
    try {
      setSpinning(true);
      const obj = {
        pageSize: pageSize,
        pageNumber: currentPage,
      };
      const response = await findAllManuscript(obj);
      if (response.code === 200) {
        // message.success("成功获取期刊");
        setManuscriptArr(response.data.data);
        setTotal(response.data.totalCount);
      }
    } catch (error) {
      console.error(error);
      message.error('期刊获取错误');
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    if((currentPage || pageSize) && !title){
      fetchData();
    }
  }, [currentPage,pageSize,title]);


  const columns = [
    {
      title: '查看',
      dataIndex: 'id',
      key: 'id',
      align:"center",
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            size="small" 
            onClick={() => handleFind(record)}
          >
            查看
          </Button>
        </Space>
      ),
    },
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      align:"center"
    },
    {
      title: '邮箱',
      key: 'email',
      dataIndex: 'email',
      align:"center"
    },
    {
      title: '稿件标识',
      dataIndex: 'manuscriptId',
      key: 'manuscriptId',
      align:"center"
    },
    {
      title: '稿件标题',
      dataIndex: 'manuscriptTitle',
      key: 'manuscriptTitle',
      align:"center",
      render: (text) => (
          <span style={{
            display: 'inline-block',
            maxWidth: '130px',  // 可根据需求调整宽度
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {text}
          </span>
        ),
    },
    {
      title: '状态',
      dataIndex: 'statusNum',
      key: 'statusNum',
      align:"center"
    },
    {
      title: '进度状态',
      key: 'statusName',
      dataIndex: 'statusName',
      align:"center",
      render: (text, record) => {
          return (
              <Tag color={getColor(record.statusNum)}>
                  {text}
              </Tag>
          );
      },
    },
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
            icon={<HourglassOutlined />}
            onClick={() => handleStatus(record)}
          >
            进度
          </Button>
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
  
  const handleDownload = async(record)=> {
    try {
      setSpinning(true);
      const response = await downloadFileById(record.id);
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

  // 查看
  const handleFind = (record) => {
    setCurrentManuscript(record); 
    setIsModalOpen(true);
  }

  // 步骤切换处理
  const handleStepChange = async (delta, status, type) => {
    let newStep;
    let newStatusNum;
    let obj;

    if (type === 'next') {
      newStep = currentStep + delta; // delta 为 1
      newStatusNum = newStep + 1;
      obj = {
        id: status.id,
        statusNum: newStatusNum,
        type: "next",
      };
    } else if (type === 'last') {
      newStep = currentStep + delta; // delta 为 -1
      newStatusNum = newStep + 1;
      obj = {
        id: status.id,
        statusNum: newStatusNum,
        type: "rollBack",
      };
    } else if (type === 'rollBack') {
      newStep = delta - 1; // value 是步骤号（1-8），转为索引需减 1
      newStatusNum = delta; // 步骤号即 statusNum
      obj = {
        id: status.id,
        statusNum: newStatusNum,
        type: "rollBack",
      };
    }
    try {
      setSpinning(true);
      const response = await operateManuscriptById(obj);
      if (response.code === 200) {
        // 更新状态中的 statusNum 和 currentStep
        setStatus(prev => ({ ...prev, statusNum: newStatusNum }));
        setCurrentStep(newStep);
        message.success(`成功切换到第${newStep + 1}步`);
        fetchData(); // 刷新列表数据
      }
    } catch (error) {
      console.error(error);
      message.error('步骤处理失败，请重试');
    } finally {
      setSpinning(false);
    }
  };


  // 步骤进度会话框
  const handleStatus =  (record) => {
    setCurrentStep(record.statusNum - 1); 
    setStatus(record); // 只要显示title
    setShow(true);
  }

  const onSearch = async (value) =>{
    if(value.trim() === "") {
      message.warning('请输入期刊标题');
      return
    }
    setTitle(value);
    try {
      setSpinning(true)
      const response = await findManuTitle(value);
      if (response.code === 200) {
        // console.log('数据',response.data.length);
        if(response.data.length > 0){
          message.success(`共有${response.data.length}条数据`);
        }else{
          message.warning(`没有标题为${value}的数据`);
        }
        setManuscriptArr(response.data);
        setTotal(response.data.length);
      }
    } catch (error) {
      console.error(error);
      message.error('期刊获取错误');
    } finally {
      setSpinning(false);
    }
  }

  // 全部数据处理函数
  const handleShowAll = async () => {
    setTitle('');
    setTotal(0);
    message.info('已显示全部期刊数据');
  };

  // 提取颜色判断逻辑为独立函数
  const getColor = (statusNum) => {
    // 按区间定义颜色映射（可配置化）
    const colorMap = [
      { start: 1, end: 3, color: 'red' },
      { start: 4, end: 6, color: 'blue' },
    ];
  
    // 查找匹配的颜色
    const match = colorMap.find(item => 
      statusNum >= item.start && statusNum <= item.end
    );
  
    // 默认颜色（未匹配时）
    return match?.color || 'green';
  };


  return (
    <>
      <Spin spinning={spinning} fullscreen />
      <div>
        <h2>
          <span>稿件管理</span>
          <Button type='link' onClick={handleShowAll}>全部稿件</Button>
          <Search 
            placeholder="请输入期刊标题"
            onSearch={onSearch} style={{ width: 200 }}/>
        </h2>
        <Table 
          rowKey="manuscriptId"
          columns={columns} 
          dataSource={manuscriptArr}
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

      {/* 详情 */}
      <Modal
        title='稿件详情'
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            关闭
          </Button>
        ]}
      >
        <div className="manuscript-detail">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>期刊标识：</Text>
              {currentManuscript.manuscriptId}
            </Col>
            <Col span={12}>
              <Text strong>稿件ID：</Text>
              {currentManuscript.id}
            </Col>
            <Col span={24}>
              <Text strong>期刊标题：</Text>
              <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                {currentManuscript.manuscriptTitle}
              </div>
            </Col>
            <Col span={12}>
              <Text strong>当前进度：</Text>
              <Tag color={getColor(currentManuscript.statusNum)}>
                {currentManuscript.statusName}
              </Tag>
            </Col>
            <Col span={12}>
              <Text strong>联系电话：</Text>
              {currentManuscript.mobile}
            </Col>
            <Col span={24}>
              <Text strong>更新时间：</Text>
              {currentManuscript.updateTime}
            </Col>
            <Col span={24}>
              <Text strong>图片：</Text>
              <div style={{ 
                overflowX: 'auto', 
                whiteSpace: 'nowrap', 
                marginTop: '8px' 
              }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'nowrap', 
                padding: '8px 0', 
                gap: '16px' // 替代原Row的gutter
              }}>
                {Array.isArray(currentManuscript.imgs) && currentManuscript.imgs.length > 0 ? (
                  currentManuscript.imgs.map((img, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        flex: '0 0 200px', // 固定宽度，不伸缩
                        minWidth: '200px', 
                        height: '200px' 
                      }}
                    >
                        <Image 
                          src={'http://192.168.31.250:9126' + img.frontPath} 
                          preview 
                          style={{
                            width: '200px',
                            height: '200px',
                            objectFit: 'cover', // 保持比例填充
                            borderRadius: '8px', // 圆角修饰
                            padding:"10px",
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // 阴影效果
                          }}
                        />
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#666', padding: '20px 0' }}>没有对应图片</div>
                )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>

      {/* 进度 */}
      <Modal
        title={`${status.manuscriptId} -- 进度`}
        open={show}
        width={700}
        onOk={() => setShow(false)}
        onCancel={() => setShow(false)}
        footer={
          <Space size="middle" wrap>
            {/* 左侧操作组 */}
            <Space size="small">
              <Button 
                onClick={() => handleStepChange(-1,status,"last")} 
                disabled={currentStep === 0 || currentStep === stepsData.length - 1}
                icon={<ArrowLeftOutlined />}
              >
                上一步
              </Button>
              <Button 
                type="primary" 
                onClick={() => handleStepChange(1,status,"next")} 
                disabled={currentStep === stepsData.length - 1}
                icon={<ArrowRightOutlined />}
              >
                下一步
              </Button>
            </Space>
  
            {/* 中间跳转选择 */}
            <Select
              style={{ minWidth: 160 }}
              value={currentStep + 1}
              placeholder="选择跳转步骤"
              onChange={(value)=> {handleStepChange(value,status,"rollBack")}}
              popupMatchSelectWidth={false}
              disabled={currentStep === stepsData.length - 1}
            >
              {/* 过滤出当前步骤及之前的选项 */}
              {stepsData.map((step, index) => {
                // 只显示索引小于等于当前步骤的选项（步骤号=索引+1）
                if (index <= currentStep) {
                  return (
                    <Option key={index} value={index + 1}>
                      第{index + 1}步：{step.title}
                    </Option>
                  );
                }
                return null;
              })}
            </Select>
  
            {/* 右侧关闭按钮 */}
            <Button 
              onClick={() => setShow(false)}
              icon={<CloseOutlined />}
            >
              关闭
            </Button>
          </Space>
        }
      >
        <div style={{ padding: '0 16px' }}>
          <Steps 
            current={currentStep} 
            direction="vertical"
            size="small"
            style={{ marginTop: 16 }}
          >
            {stepsData.map((step, index) => (
              <Step 
                key={index}
                title={step.title}
                description={step.description}
              />
            ))}
          </Steps>
          
          {/* 当前步骤详细信息 */}
          <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <h4 style={{ margin: 0, color: '#1890ff' }}>当前步骤详情</h4>
            <p style={{ margin: '8 0 0', lineHeight: 1.6 }}>
              步骤：{currentStep + 1}/{stepsData.length} - {stepsData[currentStep].title}<br/>
              说明：{stepsData[currentStep].description}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ManuscriptManage;