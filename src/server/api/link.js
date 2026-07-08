import { getBase, postJson } from "./_helpers";

export const serviceUrlList = (obj) =>
  postJson("/admin/service-url/pageList", obj);

export const serviceUrlAdd = (obj) => postJson("/admin/service-url/add", obj);

export const serviceUrlUpdate = (obj) =>
  postJson("/admin/service-url/update", obj);

export const serviceUrlDelete = (id) =>
  getBase(`/admin/service-url/delete/${id}`);

export const serviceUrlToggleStatus = (id) =>
  getBase(`/admin/service-url/toggleStatus/${id}`);
