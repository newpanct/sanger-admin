import axios from "axios";
import { message } from "antd";
import store from "../store";
const baseURL = "http://api.sangerbox.com/mysci";
// ================== 基础配置 ================== //
const axiosInstance = axios.create({
  baseURL: baseURL, // 统一设置基础地址
  timeout: 15000,
});

// ================== 请求拦截 ================== //
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================== 响应拦截 ================== //
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data?.code === 401) {
      handleAuthExpired();
    }
    return response;
  },
  (error) => {
    handleError(error);
    return Promise.reject(error);
  }
);

const handleAuthExpired = () => {
  message.info("登录超时，请重新登录");
  console.warn("登录超时，请重新登录");
  localStorage.clear();
  window.location.href = "/login"; // 跳转登录页
};

// ================== 错误处理 ================== //
const handleError = (error) => {
  console.log("err", error);
  if (error.response) {
    const status = error.response.status;
    console.log("status", status);
    switch (status) {
      case 401:
        handleAuthExpired();
        break;
      case 413:
        console.error("上传的文件过大，请选择较小的文件进行上传。");
        break;
      case 500:
        console.error("服务器内部错误，请联系管理员");
        break;
      default:
        console.error(
          `请求失败 (${status}):`,
          error.response.data || error.message
        );
        break;
    }
  } else {
    if (error.message === "Network Error") {
      error.message =
        "您的网络似乎有问题，可能开启了 VPN/代理，或者请尝试刷新页面。";
    }
    console.error("请求失败：", error.message);
  }
};

// ================== 通用请求方法 ================== //
/**
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法 (GET/POST/PUT/DELETE)
 * @param {object|FormData} data - 请求体数据
 * @param {object} config - 额外配置
 */
const request = async (url, method = "GET", data = {}, config = {}) => {
  const isFormData = data instanceof FormData;
  return axiosInstance({
    url,
    method,
    data: method !== "GET" ? data : undefined,
    params: method === "GET" ? data : undefined,
    headers: {
      ...(isFormData
        ? { "Content-Type": "multipart/form-data" }
        : method !== "GET"
        ? { "Content-Type": "application/json" }
        : {}),
      ...config.headers,
    },
    responseType: config.responseType || "json",
    ...config,
  });
};

// ================== 导出方法 ================== //
// 全局地址 (图片使用)
export default baseURL;

// JSON 请求
export const baseRequst = (url, method = "GET", data = {}, config = {}) =>
  request(url, method, data, config);

// FormData 请求
export const formRequst = (url, method = "POST", data = {}, config = {}) =>
  request(url, method, data, {
    ...config,
    headers: { "Content-Type": "multipart/form-data" },
  });
