import React from "react";
import { Card, Divider, Flex } from "antd";
const PageCard = ({ title, extraActions, rightActions, children }) => {
  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            gap: 16,
          }}
        >
          {/* 左边：标题 + 额外操作 */}
          <Flex align="center" gap={12}>
            <div style={{ fontWeight: 500 }}>{title}</div>
            {extraActions && (
              <>
                <Divider type="vertical" />
                {extraActions}
              </>
            )}
          </Flex>

          {/* 右边：按钮组 */}
          <div>{rightActions}</div>
        </div>
      }
      styles={{
        body: { padding: "10px", paddingTop: "1px" },
      }}
    >
      {children}
    </Card>
  );
};

export default PageCard;
