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

// 登录
export const pwdAdminLogin = async (obj) => {
  const response = await postJson("/user/admin/login", obj);
  if (response.code === 200) {
  const token = response.data.token;
  const role = "admin";
  const username = response.data.nickname;
    store.dispatch(setAuth({ token: token, role: role, username: username }));
  }
  return response;
};

// 退出登录 （清空状态）
export const adminLogout = () => {
  store.dispatch(clearAuth());
};

// 期刊
export const findTotalJournal = (obj) => postForm("/findTotalJournal", obj);
export const isOnlineJournal = (obj) => postForm("/isOnlineJournal", obj);
export const findJournalByTitle = (obj) => postForm("/findJournalByTitle", obj);
// TODO 待优化 只支持Excel文件
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
  getBase("http://fs.sangerbox.com/getDownWosNum", {}, { headers: { Authorization: "" } });
