import { getBase, postJson } from "./_helpers";

export const enterpriseAdd = (obj) => postJson("/user/enterprise/add", obj);

export const enterprisePage = (obj) => postJson("/user/enterprise/page", obj);

export const enterpriseList = (id) =>
  getBase("/user/enterprise/list", { id });

export const enterpriseDelete = (id) =>
  getBase("/user/enterprise/delete", { id });

/* ---------------- 企业充值订单 ---------------- */
export const enterpriseOrders = (obj) => postJson("/user/b2b/recharge/page/orders", obj);

export const enterpriseStatistics = () =>
  getBase("/user/b2b/recharge/statistics");
