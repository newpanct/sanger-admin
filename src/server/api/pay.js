import { postJson } from "./_helpers";

export const personalAccount = (obj) => postJson("/admin/order/account", obj);
