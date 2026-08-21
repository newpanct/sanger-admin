import React, { useEffect, useState, useCallback } from "react";
import PageCard from "../../components/PageCard";
import CopyableEllipsisText from "../../components/CopyableEllipsisText";
import { Table, Select, Input, message, Tag, Space, Button } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { couponPageList } from "../../server/api";
import Highlighter from "react-highlight-words";
import { debounce } from "lodash"; // 建议安装 lodash: npm install lodash

export default function PromoCodePage() {
    const [loading, setLoading] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    
    // 搜索条件状态
    const [isUsed, setIsUsed] = useState(undefined);
    const [codeStatus, setCodeStatus] = useState(undefined);
    const [searchValue, setSearchValue] = useState(""); // 实际传给后端的防抖值
    const [inputValue, setInputValue] = useState(""); // 输入框实时显示的值
    const [discountType, setDiscountType] = useState(undefined);
    
    const [list, setList] = useState([]);

    const statusOptions = [
        { label: "全部", value: null },
        { label: "禁用", value: 0 },
        { label: "启用", value: 1 },
    ];

    const discountTypeOptions = [
        { label: "全部", value: null },
        { label: "比例折扣", value: 1 },
        { label: "固定金额减免", value: 2 },
        { label: "免费", value: 3 },
    ];

    const usedOptions = [
        { label: "全部", value: null },
        { label: "未使用", value: 0 },
        { label: "已使用", value: 1 },
    ];

    // 创建防抖函数：500ms 内没有新输入则更新实际搜索 state
    const debouncedSearch = useCallback(
        debounce((nextValue) => {
            setSearchValue(nextValue);
            setPageNum(1);
        }, 500),
        []
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value); // 立即更新输入框回显
        debouncedSearch(value); // 延迟更新搜索触发值
    };

    const codeColumn = [
        {
            title: "优惠码",
            width: 300,
            dataIndex: "couponCode",
            align: "center",
            fixed: "left",
            render: (text) => (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchValue]} 
                autoEscape
                textToHighlight={text ? text.toString() : ""}
            />
        ),
        },
        {
            title: "使用状态",
            dataIndex: "isUsed",
            width: 100,
            align: "center",
            render: (val) => val === 1 ? <Tag color="red">已使用</Tag> : <Tag color="green">未使用</Tag>
        },
        {
            title: "状态",
            dataIndex: "status",
            width: 100,
            align: "center",
            render: (val) => val === 1 ? <Tag color="blue">启用</Tag> : <Tag color="default">禁用</Tag>
        },
        {
            title: "使用邮箱",
            dataIndex: "usedByEmail",
            width: 220,
            align: "center",
            render: (text) =>
                text ? (
                    <CopyableEllipsisText text={text} />
                ) : (
                    <span style={{ color: '#ccc', fontStyle: 'italic' }}>暂无使用</span>
                )
        },
        {
            title: "使用订单",
            dataIndex: "usedOrderNo",
            width: 240,
            align: "center",
            render: (text) =>
                text ? (
                    <CopyableEllipsisText text={text} />
                ) : (
                    <span style={{ color: '#ccc' }}>--</span>
                )
        },
        {
            title: "折扣类型",
            dataIndex: "discountType",
            width: 120,
            align: "center",
            render: (val) => {
                const target = discountTypeOptions.find(item => item.value === val);
                return target ? target.label : "-";
            }
        },
        {
            title: "折扣值",
            dataIndex: "discountValue",
            width: 100,
            align: "center",
        },
        {
            title: "有效期",
            width: 320,
            align: "center",
            render: (_, record) => (
                <span style={{ fontSize: '12px' }}>
                    {record.validFrom} 至 {record.validTo}
                </span>
            )
        },
        {
            title: "备注",
            dataIndex: "remark",
            width: 150,
            align: "center",
            ellipsis: true,
        },
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {
                pageNum: pageNum,
                pageSize: pageSize,
                couponCode: searchValue || null,
                discountType,
                status: codeStatus,
                isUsed: isUsed
            };
            const res = await couponPageList(params);
            if (res?.code === 200) {
                setList(res?.data?.records || []);
                setTotal(res?.data?.total || 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 核心逻辑：任何搜索参数改变，自动触发
    useEffect(() => {
        fetchData();
    }, [pageNum, pageSize, isUsed, codeStatus, discountType, searchValue]);

    return (
        <PageCard
            title="优惠码管理"
            extraActions={
                <Space wrap>
                    <Input
                        allowClear
                        style={{ width: 200 }}
                        prefix={<SearchOutlined />}
                        placeholder="输入优惠码自动搜索"
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <Select
                        allowClear
                        style={{ width: 130 }}
                        placeholder="状态"
                        options={statusOptions}
                        value={codeStatus}
                        onChange={(val) => { setPageNum(1); setCodeStatus(val); }}
                    />
                    <Select
                        allowClear
                        style={{ width: 130 }}
                        placeholder="折扣类型"
                        options={discountTypeOptions}
                        value={discountType}
                        onChange={(val) => { setPageNum(1); setDiscountType(val); }}
                    />
                    <Select
                        allowClear
                        style={{ width: 130 }}
                        placeholder="使用状态"
                        options={usedOptions}
                        value={isUsed}
                        onChange={(val) => { setPageNum(1); setIsUsed(val); }}
                    />
                </Space>
            }
            rightActions={
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => {
                        fetchData()
                    }}
                >
                    刷新数据
                </Button>
            }
        >
            <Table
                rowKey="id"
                columns={codeColumn}
                dataSource={list}
                loading={loading}
                scroll={{ x: 1500 }}
                pagination={{
                    current: pageNum,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (t) => `共 ${t} 条记录`,
                    onChange: (page, size) => {
                        setPageNum(page);
                        setPageSize(size);
                    },
                }}
            />
        </PageCard>
    );
}