import { getBase, postJson } from "./_helpers";
import { setAuth, clearAuth } from "../../store";
import store from "../../store";

// 统一处理登录响应：解析角色并 dispatch auth（消除 pwdAdminLogin / weChatLoginStatus 的重复逻辑）
const handleLoginAuth = (userData) => {
  const { token, isSuper } = userData;
  let role = isSuper === 1 ? "superAdmin" : "admin";
  if (!token.startsWith("Bearer")) {
    role = "merchant";
  }
  store.dispatch(
    setAuth({
      token,
      role,
      username: userData.nickname,
      merchantBalance: userData.balance,
      wechatName: userData.wechatName,
      merchantId: userData.merchantId,
    })
  );
  return role;
};

// 登录
export const pwdAdminLogin = async (obj) => {
  const response = await postJson("/user/admin/login", obj);
  if (response.code === 200) {
    const role = handleLoginAuth(response.data);
    return { ...response, data: { ...response.data, role } };
  }
  return response;
};

// 获取微信 state
export const getWeChatState = () => getBase("/user/wechat/web/getState");

// 微信登录状态查询
export const weChatLoginStatus = async (state) => {
  const res = await getBase("/user/wechat/web/login/status", { state });
  if (res.code === 200 && res.data.status !== "not_admin" && res.data.user) {
    const role = handleLoginAuth(res.data.user);
    return { ...res, data: { ...res.data, role } };
  }
  return res;
};

// 生成微信绑定 state
export const generateState = (merchantId) =>
  getBase("/user/merchant/wechat/bind/state", { merchantId });

// 微信绑定状态
export const wxchatBindState = (state) =>
  getBase("/user/merchant/wechat/bind/status", { state });

// 退出登录
export const adminLogout = async () => {
  store.dispatch(clearAuth());
  return getBase("/user/logout");
};
