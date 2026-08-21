import React from "react";
import { Typography } from "antd";

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
  if (text == null || text === "") {
    return "-";
  }

  const display = String(text);

  return (
    <div style={wrapperStyle}>
      <Typography.Text ellipsis={{ tooltip: display }} style={textStyle}>
        {children ?? display}
      </Typography.Text>
      <Typography.Text copyable={{ text: display }} style={copyStyle} />
    </div>
  );
}
