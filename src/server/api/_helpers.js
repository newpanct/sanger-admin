import { baseRequst, formRequst } from "../Network";

const toFormData = (obj = {}) => {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

const toErrorResult = (error) => {
  const data = error.response?.data;
  if (data && typeof data === "object") {
    return {
      code: data.code ?? error.response?.status,
      message: data.message || data.msg || error.message || "请求失败",
      data: data.data,
    };
  }
  return {
    code: error.response?.status || 500,
    message: error.message || "请求失败",
  };
};

export const postJson = async (url, data = {}, extraConfig = {}) => {
  try {
    const response = await baseRequst(url, "post", data, {
      headers: { "Content-Type": "application/json" },
      ...extraConfig,
    });
    return response.data;
  } catch (error) {
    return toErrorResult(error);
  }
};

export const postForm = async (url, data = {}) => {
  try {
    const response = await formRequst(url, "post", toFormData(data));
    return response.data;
  } catch (error) {
    return toErrorResult(error);
  }
};

export const postFormWithQuery = async (url, params = {}, data = {}) => {
  try {
    const response = await formRequst(url, "post", toFormData(data), {
      params,
    });
    return response.data;
  } catch (error) {
    return toErrorResult(error);
  }
};

export const getBase = async (url, params = {}, extraConfig = {}) => {
  try {
    const response = await baseRequst(url, "get", null, {
      params,
      ...extraConfig,
    });
    return response.data;
  } catch (error) {
    return toErrorResult(error);
  }
};

export const getBaseRaw = async (url, params = {}, extraConfig = {}) => {
  try {
    const response = await baseRequst(url, "get", null, {
      params,
      ...extraConfig,
    });
    return response;
  } catch (error) {
    return toErrorResult(error);
  }
};

// 下载文件通用函数
export const downloadFile = (response, defaultName) => {
  if (!response?.data || !response?.headers) {
    return;
  }
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
