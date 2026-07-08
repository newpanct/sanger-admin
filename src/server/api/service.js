import { getBase } from "./_helpers";

// 获取查重服务开关状态
export const dedupCheck = () => getBase("/dedup/check");

// 切换查重服务开关
export const dedupCheckToggle = (serviceKey) =>
  getBase("/dedup/check/toggle", { service: serviceKey });
