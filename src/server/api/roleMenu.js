import { getBase, postJson } from "./_helpers";
import store, { updateMenus } from "../../store";
import { normalizeMenus } from "../../utils/menu";

export const getRoleMenuIds = (role) =>
  getBase("/user/admin/roleMenu/getMenuIds", { role });

export const assignRoleMenus = (role, menuIds = []) =>
  postJson("/user/admin/roleMenu/assign", menuIds, { params: { role } });

export const getRoleMenuTree = (role) =>
  getBase("/user/admin/roleMenu/menuTree", { role });

export const refreshAuthMenus = async (role) => {
  const roleId = role ?? store.getState().auth.roleId;
  if (roleId === undefined || roleId === null || roleId === "") return;
  const res = await getRoleMenuTree(roleId);
  if (res?.code === 200) {
    store.dispatch(updateMenus(normalizeMenus(res.data)));
  }
  return res;
};
