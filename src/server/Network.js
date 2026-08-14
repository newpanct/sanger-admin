import axios from "axios";
import { message } from "antd";
import store from "../store";
import config from "../config";
const baseURL = config.baseUrl;
// ================== 基础配置 ================== //
const axiosInstance = axios.create({
  baseURL: baseURL, // 统一设置基础地址
  timeout: config.timeout,
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
  window.location.href = "/login";
  message.info("登录超时，请重新登录");
  console.warn("登录超时，请重新登录");
  localStorage.clear();
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.msg ||
  error.message;

const handleError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const msg = getErrorMessage(error);
    switch (status) {
      case 401:
        handleAuthExpired();
        break;
      case 403:
        message.error(msg || "没有权限访问该资源");
        break;
      case 404:
        message.error(msg || "请求的资源不存在");
        break;
      case 413:
        message.error("上传文件过大，请选择较小的文件");
        break;
      case 500:
        message.error(msg || "服务器内部错误，请联系管理员");
        break;
      default:
        message.error(msg || `请求失败（${status}）`);
        break;
    }
  } else {
    const isNetwork = error.message === "Network Error";
    const msg = isNetwork
      ? "网络异常，请检查网络或关闭 VPN 后重试"
      : error.message || "请求失败";
    if (isNetwork) {
      error.message = msg;
    }
    message.error(msg);
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
    baseURL: config.baseURL || baseURL,
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

// From 请求
export const formRequst = (url, method = "POST", data = {}, config = {}) =>
  request(url, method, data, {
    ...config,
    headers: { "Content-Type": "multipart/form-data" },
  });
