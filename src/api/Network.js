import axios from 'axios';
const axiosInstance = axios.create();

// 响应拦截器
axiosInstance.interceptors.response.use(
    response => {
        if (response.data.code === 401) {
            console.warn('登录超时，请重新登录');
        }
        return response;
    },
    error => {
        handleError(error);
        return Promise.reject(error);
    }
);

// 错误处理函数
const handleError = (error) => {
    if (error.response) {
        switch (error.response.status) {
            case 401:
                console.warn('登录超时，请重新登录');
                break;
            case 500:
                console.error('服务器内部错误，请联系管理员');
                break;
            default:
                console.error('请求失败：', error.status);
                break;
        }
    } else {
        console.error('请求失败：', error.message);
    }
};

// 获取基础URL
export const getBaseURL =  () => {
    // return "http://192.168.31.250:9126";
    return "http://api.sangerbox.com/mysci";
};

// 基础请求函数
export const baseRequst = async (url, method = 'GET', data = {}, config = {}) => {
    const baseURL = await getBaseURL();
    try {
        return await axiosInstance({
            method,
            url: baseURL + url,
            data, // 仅用于POST/PUT等需要请求体的场景
            params: config.params, // 用于GET请求的查询参数
            headers: {
                'Content-Type': method === 'GET' ? undefined : 'application/json', // 避免GET请求携带Content-Type
                ...config.headers,
            },
            responseType: config.responseType || 'json', // 默认json，下载时为blob
            ...config,
        });
    } catch (error) {
        throw error;
    }
};

export const formRequst  = async (url, method = 'POST', data = {}, config = {}) => {
    const baseURL = await getBaseURL();
    try {
        return await axiosInstance({
            method,
            url: baseURL + url,
            data,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': "",
                ...config.headers,
            },
            ...config,
        });
    } catch (error) {
        // 错误处理
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.warn('登录超时，请重新登录');
                    break;
                case 413:
                    console.error('上传的文件过大，请选择较小的文件进行上传。');
                    break;
                case 500:
                    console.error('服务器内部错误，请联系管理员');
                    break;
                default:
                    console.error('请求失败：', error.response.status, error.response.data);
                    break;
            }
        } else {
            console.log(error);
        }
        if (error.message === 'Network Error') {
            error.message = '当前您的状态可能打开的VPN/代理，可能无法正常获取通讯数据，若未打开，请刷新页面或者重新打开浏览器';
        }
        throw error;
    }
};