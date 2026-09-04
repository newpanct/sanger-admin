import { useEffect, useState } from "react";
import { getDedupTaskStatusList } from "../server/api";

const getStatusColor = (description = "") => {
  const text = String(description);
  if (/成功/.test(text)) return "success";
  if (/失败/.test(text)) return "error";
  if (/退款/.test(text)) return "warning";
  if (/异常/.test(text)) return "orange";
  if (/忽略|人工/.test(text)) return "error";
  return "default";
};

const toStatusMap = (list = []) =>
  list.reduce((acc, item) => {
    if (item == null) return acc;
    const code = item.code;
    const text = item.description ?? item.name ?? String(code ?? "");
    if (code === undefined || code === null) return acc;
    acc[code] = { text, color: getStatusColor(text) };
    return acc;
  }, {});

let cachedPromise = null;
let cachedMap = {};

const loadStatusList = () => {
  if (!cachedPromise) {
    cachedPromise = getDedupTaskStatusList()
      .then((res) => {
        if (res?.code === 200) {
          cachedMap = toStatusMap(res.data || []);
        }
        return cachedMap;
      })
      .catch(() => {
        cachedPromise = null;
        return cachedMap;
      });
  }
  return cachedPromise;
};

export default function useDedupTaskStatus() {
  const [statusMap, setStatusMap] = useState(cachedMap);

  useEffect(() => {
    let mounted = true;
    loadStatusList().then((map) => {
      if (mounted) setStatusMap(map);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return statusMap;
}
