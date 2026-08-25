import React from "react";
import { Typography, theme } from "antd";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";

const wrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  minWidth: 0,
  maxWidth: "100%",
  width: "100%",
};

const textStyle = {
  flex: 1,
  minWidth: 0,
  textAlign: "left",
};

const copyStyle = {
  flexShrink: 0,
};

/**
 * Table-cell text that ellipsizes, with a copy icon that never gets clipped.
 */
export default function CopyableEllipsisText({ text, children }) {
  const { token } = theme.useToken();

  if (text == null || text === "") {
    return "-";
  }

  const display = String(text);
  const iconStyle = { color: token.colorPrimary };

  return (
    <div style={wrapperStyle}>
      <Typography.Text ellipsis={{ tooltip: display }} style={textStyle}>
        {children ?? display}
      </Typography.Text>
      <Typography.Text
        copyable={{
          text: display,
          icon: [
            <CopyOutlined key="copy" style={iconStyle} />,
            <CheckOutlined key="copied" style={iconStyle} />,
          ],
        }}
        style={copyStyle}
      />
    </div>
  );
}
