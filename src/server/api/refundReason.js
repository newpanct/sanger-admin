import { getBase, postJson } from "./_helpers";

export const refundReasonPageList = (obj) =>
  postJson("/admin/refundReason/pageList", obj);

export const refundReasonSave = (obj) =>
  postJson("/admin/refundReason/save", obj);

export const refundReasonDelete = (id) =>
  getBase(`/admin/refundReason/delete/${id}`);

export const refundReasonListAll = () => getBase("/admin/refundReason/listAll");
