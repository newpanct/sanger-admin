import { useEffect, useRef, useState } from "react";
import { Alert, Typography } from "antd";
import Marquee from "react-fast-marquee";

const { Text } = Typography;

export const TYPE_STYLE_MAP = {
  info: { background: "#1677ff", color: "#fff" },
  warning: { background: "#FF6B00", color: "#fff" },
  error: { background: "#ff4d4f", color: "#fff" },
};

export const PREVIEW_SERVICE_NAME = "dedup";

export const NOTICE_LINK_STYLE = `
  .notice-banner-content a {
    color: inherit;
    text-decoration: underline;
    font-weight: 600;
    cursor: pointer;
  }
  .notice-banner-content a:hover {
    opacity: 0.85;
  }
  .notice-detail-content a {
    color: #1677ff;
    text-decoration: underline;
    font-weight: 500;
  }
  .notice-detail-content a:hover {
    color: #4096ff;
  }
`;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSafeHref(href) {
  if (!href) return false;
  const value = href.trim();
  if (value.startsWith("/") || value.startsWith("#")) return true;
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function sanitizeNoticeHtml(content) {
  if (!content) return "";

  const serializeChildren = (el, serialize) =>
    Array.from(el.childNodes).map((node) => serialize(node)).join("");

  const serialize = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();
    if (tag === "a") {
      const href = (node.getAttribute("href") || "").trim();
      if (!isSafeHref(href)) {
        return serializeChildren(node, serialize);
      }
      const inner = serializeChildren(node, serialize);
      return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
    }
    return serializeChildren(node, serialize);
  };

  return content
    .split("\n")
    .map((line) => {
      const div = document.createElement("div");
      div.innerHTML = line;
      return serializeChildren(div, serialize);
    })
    .join("<br />");
}

export function resolveNoticeStyle(data) {
  const hasCustom = !!(data?.backgroundColor && data?.textColor);
  if (hasCustom) {
    return {
      mode: "custom",
      background: data.backgroundColor,
      color: data.textColor,
    };
  }
  const type = TYPE_STYLE_MAP[data?.type] ? data.type : "info";
  return {
    mode: "type",
    type,
    background: TYPE_STYLE_MAP[type].background,
    color: TYPE_STYLE_MAP[type].color,
  };
}

export default function NoticeBannerPreview({ data }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setShouldScroll(contentWidth > containerWidth);
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [data]);

  if (!data || !data.content) return <Text type="secondary">暂无公告内容</Text>;

  const { background, color } = resolveNoticeStyle(data);
  const htmlContent = sanitizeNoticeHtml(data.content);

  const contentNode = (
    <div
      ref={contentRef}
      className="notice-banner-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{ color, display: "inline-block" }}
    />
  );

  return (
    <>
      <style>{NOTICE_LINK_STYLE}</style>
      <Alert
        style={{
          background,
          color,
          border: "none",
          borderRadius: 8,
          overflow: "hidden",
        }}
        message={
          <div ref={containerRef} style={{ width: "100%", textAlign: "center" }}>
            {shouldScroll ? (
              <Marquee
                gradient={false}
                speed={50}
                pauseOnHover
                pauseOnClick
                style={{ color }}
              >
                {contentNode}
              </Marquee>
            ) : (
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color,
                }}
              >
                {contentNode}
              </div>
            )}
          </div>
        }
      />
    </>
  );
}
