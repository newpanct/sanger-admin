import { getBase, postJson } from "./_helpers";

/* ---------------- 公告 ---------------- */
// 公告列表
/**
 * 公告列表
 * @param {Object} obj 查询参数
 * @returns {Promise<Object>} 公告列表
 */
export const noticePageList = (obj) =>
    postJson("/admin/announcement/pageList", obj);

// 添加公告/更新
export const noticeAdd = (obj) =>
    postJson("/admin/announcement/save", obj);

// 删除公告
export const noticeDelete = (id) =>
    getBase(`/admin/announcement/delete/${id}`);

/**
 * 获取最新激活的公告
 * @param {string} serviceName 服务名称
 * @returns {Promise<Object>} 最新激活的公告
 */
export const noticeGetLatestActive = (serviceName) =>
    getBase("/admin/announcement/getLatestActive", { serviceName });