import { getBase, postJson } from "./_helpers";

/* ---------------- 商户控制 / 卡密 ---------------- */
export const merchantDashboard = (id) =>
  postJson("/merchant/statistics/dashboard", id);

export const merchantOrderPageList = (obj) =>
  postJson("/merchant/order/pagelist", obj);

export const usedAvailable = (obj) =>
  postJson("/merchant/statistics/available", obj);

export const cardkeyPageList = (obj) =>
  postJson("/merchant/cardkey/pageList", obj);

export const cardkeyExtract = (obj) => postJson("/merchant/cardkey/extract", obj);

export const soldPageList = (obj) =>
  postJson("/merchant/cardkey/pageList/sold", obj);

export const markAsSoldBatch = (obj) =>
  postJson("/merchant/cardkey/markAsSold/batch", obj);

export const cardkeyAdd = (obj) => postJson("/merchant/cardkey/add", obj);

export const cardkeyInvalid = (id) =>
  getBase("/merchant/cardkey/invalid", { id });

export const refreshMerchantBalance = (merchantId) =>
  getBase(`/merchant/cardkey/balance/${merchantId}`);

/* ---------------- 商户列表 ---------------- */
export const merchantRegister = (obj) =>
  postJson("/user/merchant/register", obj);

export const merchantPageList = (obj) =>
  postJson("/user/merchant/pagelist", obj);

export const updateMerchantPassword = (obj) =>
  postJson("/user/merchant/updatePassword", obj);

export const merchantPermission = (obj) =>
  postJson("/user/merchant/permission", obj);

export const getPermissionEnums = () =>
  getBase("/user/merchant/getPermissionEnums");

/* ---------------- 商户余额 ---------------- */
export const getPermissionList = (obj) =>
  postJson("/user/merchant/balanceList", obj);

export const merchantAccountDeduct = (obj) =>
  postJson("/admin/merchant/pay/deduct", obj);

export const merchantAccountAdd = (obj) =>
  postJson("/admin/merchant/pay/recharge", obj);
