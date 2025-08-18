import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

const AntdFileUploader = () => {
    const [imgs, setImfs] = useState([]);

    // 文件选择处理（关键修改点）
    const handleChange = (info) => {
        console.log('inof',info);
        const { fileList: newFileList } = info;
        const mergedList = [...imgs, ...newFileList.filter(newFile => 
            !imgs.some(existFile => 
                existFile.name === newFile.name && existFile.size === newFile.size
            )
        )];
        console.log('mergedList',mergedList);
        setImfs(mergedList.map(f => ({ 
            ...f, 
            status: 'done'  // 强制显示为完成状态（非上传中）
        })));
    };

    // 删除文件处理
    const handleRemove = (file) => {
        setImfs(prev => prev.filter(f => f.uid !== file.uid));
        message.success(`已删除：${file.name}`);
    };

    // 自定义上传按钮内容（关键修改点）
    const uploadButton = (
        <div style={{
          width:"368px",
          boxSizing:"border-box",
          height:"30px",
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
        }}
        >
            <span>{imgs.length === 0 ? '选择文件' : '继续选择列表中没有的文件'}</span>
            <UploadOutlined className="text-lg" />
        </div>
    );

    return (
        <div>
            {/* 文件列表展示区域 */}
            <div>
                {imgs.map(file => (
                    <div 
                        key={file.uid}
                    >
                        <div style={{
                          width:"400px",
                          height:"30px",
                          display:"flex",
                          justifyContent:"space-between",
                          alignItems:"center",
                          border:"1px solid #d9d9d9",
                          marginBottom:"10px",
                          borderRadius:"4px",
                          paddingLeft:"15px",
                          transition: "all 0.3s ease"
                        }}
                        >
                            <span 
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: "280px"
                                }}
                            >
                                {file.name}
                            </span>
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemove(file)}
                            style={{
                              marginRight:"5px",
                              color: "#ff4d4f",
                              transition: "color 0.3s ease"
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#ff7875"}
                            onMouseLeave={(e) => e.target.style.color = "#ff4d4f"}
                        />
                        </div>
                    </div>
                ))}
            </div>

            {/* Ant Design Upload 组件 */}
            <Upload
                multiple  // 支持多选
                fileList={imgs}  // 受控文件列表
                onChange={handleChange}
                beforeUpload={() => false}  // 禁用自动上传（仅本地展示）
                accept="*"  // 允许所有文件类型
                showUploadList={false}  // 禁用默认文件列表
                style={{
                  width:"400px"
                }}
            >
                <Button
                    type="dashed"
                    
                >
                    {uploadButton}
                </Button>
            </Upload>
        </div>
    );
};

export default AntdFileUploader;
    