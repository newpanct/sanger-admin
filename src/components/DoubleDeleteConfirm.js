import { useEffect, useState } from "react";
import { Input, Modal, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

export default function DoubleDeleteConfirm({
  firstOpen,
  secondOpen,
  name = "",
  entityLabel = "项目",
  extra,
  loading = false,
  onNext,
  onConfirm,
  onCancel,
}) {
  const [confirmText, setConfirmText] = useState("");
  const displayName = String(name || "").trim();
  const confirmed = confirmText.trim() === displayName && displayName.length > 0;

  useEffect(() => {
    if (firstOpen || secondOpen) {
      setConfirmText("");
    }
  }, [firstOpen, secondOpen]);

  const handleCancel = () => {
    if (loading) return;
    setConfirmText("");
    onCancel?.();
  };

  return (
    <>
      <Modal
        title={`删除${entityLabel}`}
        open={firstOpen}
        onCancel={handleCancel}
        onOk={onNext}
        destroyOnHidden
        okText="下一步"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <div className="py-2">
          <div className="mb-5 flex items-start gap-3">
            <ExclamationCircleOutlined className="mt-0.5 shrink-0 text-[28px] text-red-500" />
            <div>
              <div className="mb-1.5 text-base font-medium">
                确定要删除这个{entityLabel}吗？
              </div>
              <Text type="secondary">请确认你正在操作正确的{entityLabel}。</Text>
            </div>
          </div>

          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="mb-1 text-xs text-gray-400">{entityLabel}名称</div>
            <div className="break-all text-[15px] font-semibold">
              {displayName || "-"}
            </div>
          </div>

          {extra ? <div className="mb-4">{extra}</div> : null}

          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] leading-6 text-red-700">
            删除后相关数据可能无法恢复，请谨慎操作。
          </div>
        </div>
      </Modal>

      <Modal
        title="最后确认删除"
        open={secondOpen}
        onCancel={handleCancel}
        onOk={onConfirm}
        destroyOnHidden
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{
          danger: true,
          loading,
          disabled: !confirmed,
        }}
        maskClosable={!loading}
        closable={!loading}
      >
        <div className="py-2">
          <div className="mb-5 flex items-start gap-3">
            <ExclamationCircleOutlined className="mt-0.5 shrink-0 text-[32px] text-red-500" />
            <div>
              <div className="mb-1.5 text-[17px] font-semibold">
                请再次确认删除操作
              </div>
              <Text type="secondary">此操作不可撤销，请谨慎操作。</Text>
            </div>
          </div>

          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5">
            <div className="mb-1.5 text-xs text-gray-500">即将删除</div>
            <Paragraph
              copyable={
                displayName
                  ? {
                      text: displayName,
                      tooltips: [`复制${entityLabel}名称`, "已复制"],
                    }
                  : false
              }
              className="!mb-0 !text-base !font-semibold !text-red-700"
            >
              {displayName || "-"}
            </Paragraph>
          </div>

          <div className="mb-2 text-sm">
            请输入{entityLabel}名称以确认删除：
          </div>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`请输入：${displayName}`}
            autoComplete="off"
          />
          {confirmText && !confirmed ? (
            <div className="mt-1.5 text-xs text-red-500">
              输入的{entityLabel}名称不正确
            </div>
          ) : null}
          {confirmed ? (
            <div className="mt-1.5 text-xs text-green-500">
              {entityLabel}名称验证通过，可以确认删除
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
