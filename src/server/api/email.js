import { getBase, postJson } from "./_helpers";

// 邮件模板分页列表
export const mailTemplatePageList = (obj) =>
  postJson("/admin/mailTemplate/pageList", obj);

// 保存邮件模板
export const mailTemplateUpsert = (obj) =>
  postJson("/admin/mailTemplate/upsert", obj);

// 删除邮件模板
export const mailTemplateDelete = (code) =>
  getBase("/admin/mailTemplate/delete", { code });

// 获取所有邮件类型
export const getMailTemplateEnumList = () =>
  getBase("/admin/mailTemplate/getMailTemplateEnumList");
