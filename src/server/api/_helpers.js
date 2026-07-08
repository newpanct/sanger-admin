import { baseRequst, formRequst } from "../Network";

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

// JSON POST
export const postJson = async (url, data = {}, extraConfig = {}) => {
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

// Form POST
export const postForm = async (url, data = {}) => {
  try {
    const response = await formRequst(url, "post", toFormData(data));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Form POST + query params（文件上传等）
export const postFormWithQuery = async (url, params = {}, data = {}) => {
  try {
    const response = await formRequst(url, "post", toFormData(data), {
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// GET：统一返回 response.data，与 postJson/postForm 保持一致
export const getBase = async (url, params = {}, extraConfig = {}) => {
  try {
    const response = await baseRequst(url, "get", null, {
      params,
      ...extraConfig,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// GET（原始 response）：仅用于下载文件等需要 headers 的场景
export const getBaseRaw = async (url, params = {}, extraConfig = {}) => {
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
export const downloadFile = (response, defaultName) => {
  const blob = new Blob([response.data], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

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
