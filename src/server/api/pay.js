import { postJson, getBase } from "./_helpers";

export const personalAccount = (obj) => postJson("/admin/order/account", obj);
export const invoiceAdd = (obj) => postJson("/admin/invoice/add", obj);
export const invoiceMark = (obj) => postJson("/admin/invoice/mark", obj);
export const invoicePage = (obj) => postJson("/admin/invoice/page", obj);
export const refundImageTwin = (month) =>
  getBase("/dedup/admin/order/refund/imagetwin", { month });
export const refundIthenticate = (month) =>
  getBase("/dedup/admin/order/refund/ithenticate", { month });
export const refundDuplisee = (month) =>
  getBase("/dedup/admin/order/refund/duplisee", { month });
