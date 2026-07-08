import { getBase, postJson } from "./_helpers";

// 获取费用使用总览
export const usageOverview = () => getBase("/admin/usage/overview");

// 查询费用统计分页记录
export const usageSummaryPage = (obj) =>
  postJson("/admin/usage/summaryPage", obj);

// 按月份查询费用统计记录
export const summaryByMonth = () => getBase("/admin/usage/summaryByMonth");

// 实时统计费用记录
export const realTimeSummary = () => getBase("/admin/usage/realTimeSummary");
