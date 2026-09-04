import Highlighter from "react-highlight-words";

export default function HighlightText({ text, keyword }) {
  const value = text == null ? "" : String(text);
  const words = (Array.isArray(keyword) ? keyword : [keyword])
    .map((item) => (item == null ? "" : String(item).trim()))
    .filter(Boolean);

  if (!value || !words.length) return value || "";

  return (
    <Highlighter
      autoEscape
      highlightClassName="app-search-highlight"
      searchWords={words}
      textToHighlight={value}
    />
  );
}
