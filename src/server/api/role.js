import { getBase, postJson } from "./_helpers";

export const roleAdd = (obj) => postJson("/user/admin/role/add", obj);

export const roleUpdate = (obj) => postJson("/user/admin/role/update", obj);

export const rolePageList = (obj) => postJson("/user/admin/role/pageList", obj);

export const roleListAll = () => getBase("/user/admin/role/listAll");

export const roleDelete = (id) => getBase(`/user/admin/role/delete/${id}`);
