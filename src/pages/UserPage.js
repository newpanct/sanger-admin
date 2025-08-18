import React, { useEffect, useState } from 'react';
import { Card, Table, Spin, Button, message, Tag, Space ,Divider } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { findAdminUser } from '../api/admin';

const { Column } = Table;

const UserManage = () => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUser = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await findAdminUser();
      const userData = response?.data || [];
      setUserList(userData);
      if (userData.length === 0) {
        message.info('当前暂无用户数据');
      }
    } catch (error) {
      const errMsg = error?.message || '获取用户数据失败，请重试';
      setErrorMsg(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleEdit = (record) => {
    message.info(`待开发：编辑用户 ${record.username}`);
  };

  const handleDelete = (record) => {
    message.info(`待开发：删除用户 ${record.username}`);
  };


  return (
    <div className="user-manage-container">
      <div className="user-manage-header">
        <h2 className="user-manage-title">用户管理页面
    <Divider type="vertical" />
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchUser}
          loading={loading}
          className="user-manage-refresh-btn"
        >
          刷新数据
        </Button></h2>
      </div>

      <Card
        title="用户列表"
        className="user-manage-card"
        extra={
          <Button 
            type="primary" 
            className="user-manage-add-btn"
            onClick={() => message.info('待开发：新增用户')}
          >
            新增用户
          </Button>
        }
      >
        {loading ? (
          <div style={{textAlign:"center"}}>
            <Spin
              size="large"
            />
          </div>
        ) : errorMsg ? (
          <div className="user-manage-error">
            <p className="error-text">{errorMsg}</p>
            <Button onClick={fetchUser} icon={<ReloadOutlined />}>
              重新加载
            </Button>
          </div>
        ) : (
          <Table
            bordered
            dataSource={userList}
            rowKey="id" 
            className="user-manage-table"
            scroll={{ x: 768 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 位用户`
            }}
          >
            <Column
              title="用户名"
              dataIndex="username"
              key="username"
              width={120}
              render={(text) => <span className="table-cell-text">{text}</span>}
            />
            <Column
              title="邮箱"
              dataIndex="email"
              key="email"
              width={200}
              render={(text) => <span className="table-cell-text">{text || '-'}</span>}
            />
            <Column
              title="类别"
              dataIndex="user_type"
              key="user_type"
              width={120}
              render={(role) => {
                let tagColor = '';
                let txt = '';
                if (role === 1) {
                  tagColor = 'success';
                  txt = "超级管理员";
                } else if (role === -1) {
                  tagColor = 'processing';
                  txt = "普通管理员";
                }
            
                return tagColor ? <Tag color={tagColor}>{txt}</Tag> : null;
              }}
            />
            <Column
              title="创建时间"
              dataIndex="create_time"
              key="create_time"
              width={180}
              render={(time) => (
                <span className="table-cell-text">
                  {time ? new Date(time).toLocaleString() : '-'}
                </span>
              )}
            />
            <Column
              title="更新时间"
              dataIndex="update_time"
              key="update_time"
              width={180}
              render={(time) => (
                <span className="table-cell-text">
                  {time ? new Date(time).toLocaleString() : '-'}
                </span>
              )}
            />
            <Column
              title="操作"
              key="action"
              width={160}
              render={(_, record) => (
                <Space size="middle">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    className="table-operate-btn edit-btn"
                    onClick={() => handleEdit(record)}
                  >
                    编辑
                  </Button>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    className="table-operate-btn delete-btn"
                    onClick={() => handleDelete(record)}
                  >
                    删除
                  </Button>
                </Space>
              )}
            />
          </Table>
        )}
      </Card>
    </div>
  );
};

export default UserManage;