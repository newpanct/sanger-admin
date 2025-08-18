import React, { useEffect, useState } from 'react';
import { Spin,Table,Space,Button,Tag,Modal,Image,Flex,Descriptions , message } from 'antd';
import { findTotalJournal,isOnlineJournal } from '../api/admin';
import { 
  CheckCircleOutlined,   // 成功/在线状态<ContainerOutlined />
  CloseCircleOutlined,   // 关闭/离线状态
} from '@ant-design/icons';
const JournalManage = () => {
    const [spinning, setSpinning] = useState(false);
    const [JournalArr,setJournalArr] = useState([]);
    const [pageNumber,setPageNumber] = useState("1");
    const [pageSize,setPageSize] = useState("5");
    const [totalCount,setTotalCount] = useState("0");
    const [visible, setVisible] = useState(false);
    const [selectedTitles, setSelectedTitles] = useState([]);
    const [showDetail, setShowDetail] = useState(false);
    const [detailObj,setDetailObj] = useState({});

    
    const getTagColor = (tag) => {
      const lowerTag = tag.toLowerCase();
      if (lowerTag.includes('cancer')) return 'red';  // 黄色（癌症相关）
      if (tag.length > 5) return 'blue';  // 深绿色（长文本）
      return 'green';  // 浅绿色（默认）
  };
    // 处理标题点击事件
    const handleTitleClick = (titles) => {
      // console.log('value',titles);
      setSelectedTitles(titles);
      setVisible(true);
    };
    // 查看
    const handleFind = (record) => {
        setDetailObj(record);
        setShowDetail(true);
        console.log('record',record);
    }
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
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        align:"center"
      },
      {
        title: 'id',
        dataIndex: 'id',
        key: 'id',
        align:"center"
      },
      {
        title: 'ISSN',
        key: 'issn',
        dataIndex: 'issn',
        align:"center"
      },
      {
        title: '最新影响因子',
        dataIndex: 'latestIF',
        key: 'latestIF',
        align:"center"
      },
      {
        title: '类别',
        dataIndex: 'journalTypeZh',
        key: 'journalTypeZh',
        align: "center",
        ellipsis: true,
        render: (value) => {
            if (!value || typeof value !== 'string') {
                return <Tag color="gray">无类别信息</Tag>;
            }
            const tags = value.split(',').filter(tag => tag.trim() !== '');
            if (tags.length === 0) {
                return <Tag color="gray">无有效类别</Tag>;
            }
    
            // 颜色判断逻辑（独立函数提高可维护性）
    
            return (
                <>
                    {tags.map((tag, index) => (
                        <Tag color={getTagColor(tag.trim())} 
                        style={{ margin: "2px", cursor: "pointer" }}
                        onClick={() => handleTitleClick(tags)} 
                        key={`journal-tag-${index}-${tag.trim()}`}>
                            {tag.trim()}
                        </Tag>
                    ))}
                </>
            );
        }
      },
      {
        title: '中科院分区',
        dataIndex: 'zkyPartition',
        key: 'zkyPartition',
        align:"center"
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        align:"center"
      },
      {
        title: '操作',
        key: 'isDel',
        align: "center",
        render: (_, record) => (
          <Space size="middle">
            {_.isDel === 0 ? 
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={()=>{handleIsOnline(_)}}
            >
              上线
            </Button>:
            <Button 
              color="danger" variant="solid"
              size="small" 
              icon={<CloseCircleOutlined />}
              onClick={()=>{handleIsOnline(_)}}
            >
              下线
            </Button>}
          </Space>
        ),
      },
    ];
    useEffect(()=>{
        fetchData();
    },[pageNumber,pageSize])
    const fetchData = async () => {
        try {
            setSpinning(true);
            const obj = {
                pageNumber:pageNumber,
                pageSize:pageSize,
            };
            const response = await findTotalJournal(obj);
            if(response.code === 200){
                setJournalArr(response.data.data);
                setTotalCount(response.data.totalCount);
            }else{
                message.error("!==200");
            }
        } catch (error) {
            console.error(error);
            message.error("期刊获取出错");
        } finally{
            setSpinning(false);
        }
    }
    // 上下线
    const handleIsOnline = async (_) => {
        const status = _.isDel === 1? 0 : 1;
        try {
            setSpinning(true);
            const obj = {
                id:_.id,
                isOnline:status,
            };
            const response = await isOnlineJournal(obj);
            if(response.code === 200){
                if(status === 1){
                    message.success(response.msg);
                } else if(status === 0){
                    message.warning(response.msg);
                }
                fetchData();
                setPageNumber(1);
            }else{
                message.error("!==200");
            }
        } catch (error) {
            console.error(error);
            message.error("上下线出错");
        } finally{
            setSpinning(false);
        }
    }

    
  const items = [
    {
      key: 'id',
      label: 'Id',
      children: detailObj.id,
    },
    {
      key: 'issn',
      label: 'ISSN',
      children: detailObj.issn,
    },
    {
      key: 'jcr',
      label: 'JCR分区',
      children: detailObj.jcr,
    },
    {
      key: 'latestIF',
      label: '最新影响因子',
      children: detailObj.latestIF,
    },
    {
      key: 'journalTypeZh',
      label: '类别',
      children: (() => {
        const journalType = detailObj?.journalTypeZh;  // 用可选链避免detailObj为undefined
        if (!journalType) return null;  // 无数据时不渲染
        
        // 处理字符串/数组格式
        const typeList = Array.isArray(journalType) 
          ? journalType 
          : typeof journalType === 'string' ? journalType.split(',') : [journalType];
        
        return typeList.map((type, index) => (
          <Tag key={index} color={getTagColor(type)} style={{marginBottom:"8px"}}>
            {typeof type === 'string' ? type.trim() : type} 
          </Tag>
        ));
      })(),
    },
    {
      key: 'zkyPartition',
      label: '中科院分区',
      children: detailObj.zkyPartition,
    },
    {
      key: 'updateTime',
      label: '更新时间',
      children: detailObj.updateTime,
    },
    {
      key: 'frontPath',
      label: '图片',
      children: (
        <Image 
        src={`http://192.168.31.250:9126/${detailObj.frontPath}`} alt="img"
        width={200}
        />
      ),
    },
  ];

  return (
    <div>
        <Spin spinning={spinning} fullscreen />
        <h2>首页期刊管理</h2>
        <div>
        <Table 
          rowKey="id"
          columns={columns} 
          dataSource={JournalArr}
          bordered
          pagination={{
            current: pageNumber,
            pageSize: pageSize,
            total: totalCount,
            onChange: (page, size) => {
                setPageNumber(page);
                setPageSize(size);
            },
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '15'],
          }}
        />
        </div>

      <Modal
        title="标题详情"
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        width={500}
      >
        <div style={{ lineHeight: "1.8" }}>
          全部标题：
          <br />
          {selectedTitles.map((title, index) => (
            <Tag key={index} style={{ margin: "2px", cursor: "pointer" }}>
              {title}
            </Tag>
          ))}
        </div>
      </Modal>


      <Modal
        // title={`${detailObj.title}详情`}
        visible={showDetail}
        onOk={() => setShowDetail(false)}
        onCancel={() => setShowDetail(false)}
        width={1000}
      >
        <Descriptions title={detailObj.title} bordered items={items}/>
        {/* <Image src={`http://192.168.31.250:9126/${detailObj.frontPath}`} alt='img'/> */}
      </Modal>
    </div>
  );
};

export default JournalManage;