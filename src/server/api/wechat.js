import { getBase, postJson } from "./_helpers";

// 添加关键词
export const addKeyword = (obj) => postJson("/admin/wxKeyword/add", obj);

// 关键词回复分页列表
export const replyPageList = (obj) =>
  postJson("/admin/wxKeyword/pageList", obj);

// 修改关键词回复
export const updateKeyword = (obj) =>
  postJson("/admin/wxKeyword/update", obj);

// 删除关键词回复
export const deleteKeyword = (id) =>
  getBase("/admin/wxKeyword/delete", { id });
