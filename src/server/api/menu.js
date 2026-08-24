import { getBase, postJson } from "./_helpers";

export const menuPage = () => getBase("/user/admin/menu/list");

export const menuAdd = (obj) => postJson("/user/admin/menu/add", obj);

export const menuUpdate = (obj) => postJson("/user/admin/menu/update", obj);

export const menuDelete = (menuId) => getBase(`/user/admin/menu/delete/${menuId}`);

export const batchSort = (obj) => postJson("/user/admin/menu/batchSort", obj);