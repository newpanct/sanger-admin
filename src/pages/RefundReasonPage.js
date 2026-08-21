import PageCard from "../components/PageCard";
import { ReloadOutlined,PlusOutlined } from "@ant-design/icons";
import { Button,Tooltip,Divider,Empty } from "antd";
export default function RefundReasonPage() {
    return (
        <PageCard
            title="退款理由管理"
            rightActions={
                <>
                <Tooltip title="添加退款理由">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                >
                    添加理由
                </Button>
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip title="刷新数据">
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                >
                    刷新数据
                </Button>
                </Tooltip>
                </>
            }>
                <Empty description="功能开发中" />
        </PageCard>
    );
}