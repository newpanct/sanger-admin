import { baseRequst, formRequst } from "./Network";
import { setAuth, clearAuth } from "../store";
import store from "../store";
// 工具函数：把对象转成 FormData
const toFormData = (obj = {}) => {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};
// 通用请求封装（JSON POST）
const postJson = async (url, data = {}, extraConfig = {}) => {
  try {
    const response = await baseRequst(url, "post", data, {
      headers: { "Content-Type": "application/json" },
      ...extraConfig,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
// 通用请求封装（formRequst）
const postForm = async (url, data = {}) => {
  try {
    const response = await formRequst(url, "post", toFormData(data));
    // console.log(`${url}`,response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 文件上传
const postFormWithQuery = async (url, params = {}, data = {}) => {
  try {
    const response = await formRequst(
      url,
      "post",
      toFormData(data),
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


// 通用请求封装（baseRequst）
const getBase = async (url, params = {}, extraConfig = {}) => {
  try {
    const response = await baseRequst(url, "get", null, {
      params,
      ...extraConfig,
    });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 下载文件通用函数
const downloadFile = (response, defaultName) => {
  const blob = new Blob([response.data], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  // 解析文件名
  const contentDisposition = response.headers["content-disposition"];
  let filename = defaultName;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"/);
    if (match) filename = match[1];
  }

  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
/* ---------------- 具体 API ---------------- */

/* ---------------- 权限 ---------------- */
// 登录
export const pwdAdminLogin = async (obj) => {
  const response = await postJson("/user/admin/login", obj);
  if (response.code === 200) {
    const token = response.data.token;
    const isSuper = response.data.isSuper;
    let role;
    role = isSuper === 1 ? "superAdmin" : "admin";
    if (!token.startsWith("Bearer")) {
      role = "merchant";
    }
    const username = response.data.nickname;
    const merchantId = response?.data.merchantId;
    const wechatName = response?.data.wechatName;
    const merchantBalance = response?.data.balance;
    store.dispatch(
      setAuth({
        token,
        role,
        username,
        merchantBalance,
        wechatName,
        merchantId,
      })
    );
    return {
      ...response,
      data: {
        ...response.data,
        role,
      },
    };
  }
  return response;
};

// 查重订单失败统计
export const getFailed = async () => {
  const response = await getBase("/dedup/statistics/failed");
  return response.data;
};

// --扫码登录
// 获取微信state状态
export const getWeChatState = async () => {
  const response = await getBase("/user/wechat/web/getState");
  return response.data;
};

// 微信登录状态查询
export const weChatLoginStatus = async (state) => {
  const response = await getBase("/user/wechat/web/login/status", { state });
  const res = response?.data;
  if (res.code === 200 && res.data.status !== "not_admin" && res.data.user) {
    const token = res.data.user.token;
    const isSuper = res.data.user.isSuper;
    let role;
    role = isSuper === 1 ? "superAdmin" : "admin";
    if (!token.startsWith("Bearer")) {
      role = "merchant";
    }
    // 目前前端强制设置为超级管理员 可以在routers/PrivateRoute下切换或修改
    const username = res.data.user.nickname;
    const merchantId = res?.data.user.merchantId;
    const wechatName = res?.data.user.wechatName;
    const merchantBalance = res?.data.user.balance;
    store.dispatch(
      setAuth({
        token,
        role,
        username,
        merchantBalance,
        wechatName,
        merchantId,
      })
    );
    return {
      ...res,
      data: {
        ...res.data,
        role,
      },
    };
  }
  return res;
};

/* ---------------- 商户 ---------------- */
// 生成微信绑定state
export const generateState = async (merchantId) => {
  const response = await getBase("/user/merchant/wechat/bind/state", {
    merchantId,
  });
  return response.data;
};
// 微信绑定状态
export const wxchatBindState = async (state) => {
  const response = await getBase("/user/merchant/wechat/bind/status", {
    state,
  });
  return response.data;
};
// 商户订单统计
export const merchantDashboard = (id) =>
  postJson("/merchant/statistics/dashboard", id);

// 分页查询
export const merchantOrderPageList = (obj) =>
  postJson("/merchant/order/pagelist", obj);

// 商户订单可用库存
export const usedAvailable = (obj) =>
  postJson("/merchant/statistics/available", obj);

// 卡密分页
export const cardkeyPageList = (obj) =>
  postJson("/merchant/cardkey/pageList", obj);

// 商户卡密提取
export const cardkeyExtract = async (obj) => {
  const response = await postJson("/merchant/cardkey/extract", obj);
  return response;
};

// 商户卡密售出消费分页
export const soldPageList = async (obj) => {
  const response = await postJson("/merchant/cardkey/pageList/sold", obj);
  return response;
};

// 商户卡密批量标记为已出售
export const markAsSoldBatch = async (obj) => {
  const response = await postJson("/merchant/cardkey/markAsSold/batch", obj);
  return response;
};

// 新增卡密
export const cardkeyAdd = (obj) => postJson("/merchant/cardkey/add", obj);

// 作废卡密
export const cardkeyInvalid = async (id) => {
  const response = await getBase("/merchant/cardkey/invalid", { id });
  return response.data;
};

// 刷新余额
export const refreshMerchantBalance = async (merchantId) => {
  const response = await getBase(`/merchant/cardkey/balance/${merchantId}`);
  return response.data;
};

// 退出登录 （清空状态）
export const adminLogout = async () => {
  store.dispatch(clearAuth());
  const response = await getBase("/user/logout");
  return response.data;
};

// 订单统计
export const statDashboard = async () => {
  const response = await getBase("/dedup/statistics/current");
  return response.data;
};

// 订单月份统计
export const statMoon = async () => {
  const response = await getBase("/dedup/statistics/single");
  return response.data;
};

/* ---------------- 查重系统 ---------------- */
//获取imagetwin任务分页列表
export const imagetwinPageList = async (obj) => {
  const response = await postJson("/dedup/admin/imagetwin/pageList", obj);
  return response;
};

//获取imagetwin任务失败的分页列表
export const imagetwinFailedPageList = async (obj) => {
  const response = await postJson(
    "/dedup/admin/imagetwin/failed/pageList",
    obj
  );
  return response;
};

//获取ithenticate任务分页列表
export const ithenticatePageList = async (obj) => {
  const response = await postJson("/dedup/admin/ithenticate/pageList", obj);
  return response;
};

//获取ithenticate任务失败的分页列表
export const ithenticateFailedPageList = async (obj) => {
  const response = await postJson(
    "/dedup/admin/ithenticate/failed/pageList",
    obj
  );
  return response;
};

// imagetwin 订单统计
export const statisticsImagetwin = async (obj) => {
  const response = await postJson("/dedup/statistics/imagetwin", obj);
  return response;
};
// ithenticate 订单统计
export const statisticsIthenticate = async (obj) => {
  const response = await postJson("/dedup/statistics/ithenticate", obj);
  return response;
};

// turnicheck 历史查重分页列表
export const turnicheckPageList = async (obj) => {
  const response = await postJson("/dedup/admin/turnicheck/pageList", obj);
  return response;
};

// turnicheck 历史失败查重列表
export const turnicheckFailedPageList = async (obj) => {
  const response = await postJson(
    "/dedup/admin/turnicheck/failed/pageList",
    obj
  );
  return response;
};

// 手动提交删除turnicheck任务
export const delTurFaiOrder = async (orderId, userPhone) => {
  const response = await getBase("/dedup/admin/turnicheck/commit", {
    orderId,
    userPhone,
  });
  return response.data;
};

// 获取结果链接
export const getResLink = async (id) => {
  const response = await getBase("/dedup/task/getNewUrl", { id });
  return response.data;
};

// 删除Imagetwin订单
export const deleteImagetwinById = async (id) => {
  const response = await getBase("/dedup/task/imagetwin/delete", { id });
  return response.data;
};

// 删除Ithenticate订单
export const deleteIthenticateById = async (id) => {
  const response = await getBase("/dedup/task/ithenticate/delete", { id });
  return response.data;
};

// 手动提交imagetwin任务
export const commitImagetwin = async (taskId) => {
  const response = await getBase("/dedup/admin/imagetwin/commit", { taskId });
  return response.data;
};

// 手动提交ithenticate任务
export const commitIthenticate = async (taskId) => {
  const response = await getBase("/dedup/admin/ithenticate/commit", { taskId });
  return response.data;
};

// --商户
/* ---------------- 商户列表 ---------------- */
// 商户注册
export const merchantRegister = async (obj) => {
  const response = await postJson("/user/merchant/register", obj);
  return response;
};

// 商户管理分页列表
export const merchantPageList = async (obj) => {
  const response = await postJson("/user/merchant/pagelist", obj);
  return response;
};

// 修改商户密码
export const updateMerchantPassword = async (obj) => {
  const response = await postJson("/user/merchant/updatePassword", obj);
  return response;
};

// 商户权限操作
export const merchantPermission = async (obj) => {
  const response = await postJson("/user/merchant/permission", obj);
  return response;
};

// 获取所有商户权限枚举值
export const getPermissionEnums = async () => {
  const response = await getBase("/user/merchant/getPermissionEnums");
  return response.data;
};

/* ---------------- 商户余额 ---------------- */
// 获取商户权限列表
export const getPermissionList = async (obj) => {
  const response = await postJson("/user/merchant/balanceList", obj);
  return response;
};

// 扣减商户余额
export const merchantAccountDeduct = async (obj) => {
  const response = await postJson("/admin/merchant/pay/deduct", obj);
  return response;
};

// 增加商户余额
export const merchantAccountAdd = async (obj) => {
  const response = await postJson("/admin/merchant/pay/recharge", obj);
  return response;
};

/* ---------------- 邮件模板管理 ---------------- */
// 邮件模板分页列表
export const mailTemplatePageList = async (obj) => {
  const response = await postJson("/admin/mailTemplate/pageList", obj);
  return response;
};

// 保存邮件模板
export const mailTemplateUpsert = async (obj) => {
  const response = await postJson("/admin/mailTemplate/upsert", obj);
  return response;
};

// 删除邮件模板
export const mailTemplateDelete = async (code) => {
  const response = await getBase("/admin/mailTemplate/delete", { code });
  return response.data;
};

// 获取所有邮件类型
export const getMailTemplateEnumList = async () => {
  const response = await getBase("/admin/mailTemplate/getMailTemplateEnumList");
  return response.data;
};

/* ---------------- 微信公众号 ---------------- */
// 添加关键词
export const addKeyword = async (obj) => {
  const response = await postJson("/admin/wxKeyword/add", obj);
  return response;
};

// 关键词回复分页列表
export const replyPageList = async (obj) => {
  const response = await postJson("/admin/wxKeyword/pageList", obj);
  return response;
};

// 修改关键词回复
export const updateKeyword = async (obj) => {
  const response = await postJson("/admin/wxKeyword/update", obj);
  return response;
};

// 删除关键词回复
export const deleteKeyword = async (id) => {
  const response = await getBase("/admin/wxKeyword/delete", { id });
  return response.data;
};

/* ---------------- 资源管理 ---------------- */
// 上传静态文件
export const uploadStaticUpload = async (obj) => {
  return postFormWithQuery(
    "/admin/staticUpload/upload",
    {
      customName: obj.customName,
      category: obj.category,
    },
    {
      file: obj.file,
    }
  );
};

// 静态文件分页列表
export const staticUploadPageList = async (obj) => {
  const response = await postJson("/admin/staticUpload/pageList", obj);
  return response;
};
// 删除静态文件
export const deleteStaticUpload = async (id) => {
  const response = await getBase("/admin/staticUpload/delete", { id });
  return response.data;
};

/* ---------------- 模型计费 ---------------- */
// 获取费用使用总览
export const usageOverview = async () => {
  const response = await getBase("/admin/usage/overview", );
  return response.data;
};
// 查询费用统计分页记录
export const usageSummaryPage = async (obj) => {
  const response = await postJson("/admin/usage/summaryPage", obj);
  return response;
};
// 按月份查询费用统计记录
export const summaryByMonth = async () => {
  const response = await getBase("/admin/usage/summaryByMonth", );
  return response.data;
};
// 实时统计费用记录
export const realTimeSummary = async () => {
  const response = await getBase("/admin/usage/realTimeSummary", );
  return response.data;
};


/* ---------------- 下列接口已作废 ---------------- */

// 期刊
export const findTotalJournal = (obj) => postForm("/findTotalJournal", obj);
export const isOnlineJournal = (obj) => postForm("/isOnlineJournal", obj);
export const findJournalByTitle = (obj) => postForm("/findJournalByTitle", obj);
// 待优化 只支持Excel文件
export const addJournalByFile = (file) =>
  postForm("/addJournalByFile", { file });

// 稿件
export const findAllManuscript = (obj) => postForm("/findAllManuscript", obj);

export const findManuTitle = (title) =>
  postForm("/findManuscriptSubmitByManuscriptTitle", { title });

export const downloadFileById = async (id) => {
  const response = await getBase(
    "/downloadFileById",
    { id },
    { responseType: "blob" }
  );
  downloadFile(response, "file.docx");
  return response.data;
};

// 查询回滚状态(稿件)
export const findStatusById = (id) =>
  getBase("/findStatusById", { id }).then((res) => res.data);

// 证书
export const findAllCertification = (obj) =>
  postForm("/findAllCertification", obj);

export const findCertTitle = (title) =>
  postForm("/findCertificationByTitle", { title });

// 下载证书
export const downloadCert = async (id) => {
  const response = await getBase(
    "/downloadCertificationById",
    { id },
    { responseType: "blob" }
  );
  downloadFile(response, "certification.pdf");
  return response.data;
};

// 操作稿件
export const operateManuscriptById = (obj) =>
  postForm("/operateManuscriptById", obj);

// 用户管理
export const findAdminUser = () => postForm("/findAdminUser");

export const addAdminUser = (obj) => postForm("/addAdminUser", obj);

export const updateAdminUser = (obj) => postForm("/updateAdminUser", obj);

export const deleteAdminUser = (email) =>
  postForm("/deleteAdminUser", { email });

// 商户管理
export const findAllMerchant = () => postForm("/findAllMerchant");

export const createMerchant = (obj) => postForm("/createMerchant", obj);

// 支付
export const findAllCheckRecords = () => postForm("/findAllCheckRecords");

export const findCheckByOrderNo = (orderNo) =>
  postForm("/findCheckByOrderNo", { orderNo });

export const showIwAndIthCountMonth = () => postForm("/showIwAndIthCountMonth");

export const showIwAndIthCountDay = () => postForm("/showIwAndIthCountDay");

// 仪表盘
export const getDownWosNum = () =>
  getBase(
    "http://fs.sangerbox.com/getDownWosNum",
    {},
    { headers: { Authorization: "" } }
  );
