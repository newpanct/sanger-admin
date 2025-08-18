import axios from 'axios';
import {baseRequst,formRequst} from "./Network";

// 查询所有稿件
export const findAllManuscript = async (obj) => {
    try {
        const formData = new FormData();
        formData.append("pageSize",obj.pageSize);
        formData.append("pageNumber",obj.pageNumber);
        const response = await formRequst('/findAllManuscript','post', formData );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
// 模糊查询稿件 title
export const findManuTitle = async (title) => {
    try {
        const formData = new FormData();
        formData.append("title",title);
        const response = await formRequst('/findManuscriptSubmitByManuscriptTitle','post', formData );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// 证书
export const findAllCertification = async (obj) => {
    try {
        const formData = new FormData();
        formData.append("pageSize",obj.pageSize);
        formData.append("pageNumber",obj.pageNumber);
        const response = await formRequst('/findAllCertification','post', formData );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
// 模糊查询证书 title
export const findCertTitle = async (title) => {
    try {
        const formData = new FormData();
        formData.append("title",title);
        const response = await formRequst('/findCertificationByTitle','post', formData );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// 下载稿件
export const downloadFileById = async (id) => {
    try {
        const response = await baseRequst('/downloadFileById','get', null,{
            params: { id }, // 将id作为查询参数传递
            responseType: 'blob', // 关键：设置响应类型为blob
        } );
        // 处理文件下载
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        // 从响应头获取文件名（若无则用默认名）
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'file.docx';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"/);
            if (match) filename = match[1];
        }
        link.download = filename;
        link.href = url;

        // 触发下载并清理资源
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return response.data;
    } catch (error) {
        console.error('下载失败:', error);
        throw error; // 保留完整错误信息
    }
};

// 下载证书
export const downloadCert = async (id) => {
    try {
        const response = await baseRequst('/downloadCertificationById','get', null,{
            params: { id }, // 将id作为查询参数传递
            responseType: 'blob', // 关键：设置响应类型为blob
        } );
        // 处理文件下载
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        // 从响应头获取文件名（若无则用默认名）
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'certification.pdf';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"/);
            if (match) filename = match[1];
        }
        link.download = filename;
        link.href = url;

        // 触发下载并清理资源
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return response.data;
    } catch (error) {
        console.error('下载失败:', error);
        throw error; // 保留完整错误信息
    }
};

// 根据id 查询该数据的回滚选择 (只显示比当前状态小的状态)
export const findStatusById = async (id) => {
    try {
        const response = await baseRequst('/findStatusById','get', null,{
            params: { id }, // 将id作为查询参数传递
        } );
        // 处理文件下载
        return response.data;
    } catch (error) {
        console.error('下载失败:', error);
        throw error; // 保留完整错误信息
    }
};
 
// 根据id 查询该数据的回滚选择 (只显示比当前状态小的状态) 未使用
export const operateManuscriptById = async (obj) => {
    try {
        const formData = new FormData();
        formData.append("id",obj.id);
        formData.append("statusNum",obj.statusNum);
        formData.append("type",obj.type);
        const response = await formRequst('/operateManuscriptById','post', formData );
        // 处理文件下载
        return response.data;
    } catch (error) {
        console.error(' operateManuscriptById:', error);
        throw error; // 保留完整错误信息
    }
};

// 查询所有期刊首页展示
export const findTotalJournal = async (obj) => {
    try {
        const formData = new FormData();
        formData.append("pageNumber",obj.pageNumber);
        formData.append("pageSize",obj.pageSize);
        const response = await formRequst('/findTotalJournal','post', formData );
        return response.data;
    } catch (error) {
        console.error('findTotalJournal:', error);
        throw error; // 保留完整错误信息
    }
};
// 期刊上下线
export const isOnlineJournal = async (obj) => {
    try {
        const formData = new FormData();
        formData.append("id",obj.id);
        formData.append("isOnline",obj.isOnline);
        const response = await formRequst('/isOnlineJournal','post', formData );
        return response.data;
    } catch (error) {
        console.error('isOnlineJournal:', error);
        throw error; // 保留完整错误信息
    }
};

// 登录
export const pwdAdminLogin = async (obj) => {
    try {
        const formData = new FormData();
        formData.append("email",obj.email);
        formData.append("password",obj.password);
        const response = await formRequst('/pwdAdminLogin','post', formData );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
//  所以用户信息
export const findAdminUser = async (obj) => {
    try {
        const formData = new FormData();
        const response = await formRequst('/findAdminUser','post' );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
