import { getBase } from "./_helpers";

// 查重订单失败统计
export const getFailed = () => getBase("/dedup/statistics/failed");

// 订单统计
export const statDashboard = () => getBase("/dedup/statistics/current");

// 订单月份统计
export const statMoon = () => getBase("/dedup/statistics/single");
