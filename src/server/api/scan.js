import { getBase, postJson } from "./_helpers";

/* ---------------- Imagetwin ---------------- */
export const imagetwinPageList = (obj) =>
  postJson("/dedup/admin/imagetwin/pageList", obj);

export const imagetwinFailedPageList = (obj) =>
  postJson("/dedup/admin/imagetwin/failed/pageList", obj);

export const deleteImagetwinById = (id) =>
  getBase("/dedup/task/imagetwin/delete", { id });

export const commitImagetwin = (taskId) =>
  getBase("/dedup/admin/imagetwin/commit", { taskId });

/* ---------------- Ithenticate / CrossCheck ---------------- */
export const ithenticatePageList = (obj) =>
  postJson("/dedup/admin/ithenticate/pageList", obj);

export const ithenticateFailedPageList = (obj) =>
  postJson("/dedup/admin/ithenticate/failed/pageList", obj);

export const deleteIthenticateById = (id) =>
  getBase("/dedup/task/ithenticate/delete", { id });

export const commitIthenticate = (taskId) =>
  getBase("/dedup/admin/ithenticate/commit", { taskId });

/* ---------------- Turnitin (history) ---------------- */
export const turnicheckPageList = (obj) =>
  postJson("/dedup/admin/turnicheck/pageList", obj);

export const turnicheckFailedPageList = (obj) =>
  postJson("/dedup/admin/turnicheck/failed/pageList", obj);

export const delTurFaiOrder = (orderId, userPhone) =>
  getBase("/dedup/admin/turnicheck/commit", { orderId, userPhone });

/* ---------------- DupliSee / SangerboxScope ---------------- */
export const dupliseePageList = (obj) =>
  postJson("/dedup/admin/duplisee/pagelist", obj);

export const dupliseeFailedPageList = (obj) =>
  postJson("/dedup/admin/duplisee/failed", obj);

export const commitDuplisee = (taskId) =>
  getBase("/dedup/admin/duplisee/commit", { taskId });

export const dupliSeeDeleteById = (id) =>
  getBase("/dedup/dupliSee/deleteById", { id });

/* ---------------- 通用 ---------------- */
export const getResLink = (id) => getBase("/dedup/task/getNewUrl", { id });

/* ---------------- 订单统计 ---------------- */
export const statisticsImagetwin = (obj) =>
  postJson("/dedup/statistics/imagetwin", obj);

export const statisticsIthenticate = (obj) =>
  postJson("/dedup/statistics/ithenticate", obj);

export const statisticsSangerboxScope = (obj) =>
  postJson("/dedup/statistics/sangerboxscope", obj);
