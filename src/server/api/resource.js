import { getBase, postJson, postFormWithQuery } from "./_helpers";

// 上传静态文件
export const uploadStaticUpload = (obj) =>
  postFormWithQuery(
    "/admin/staticUpload/upload",
    { customName: obj.customName, category: obj.category },
    { file: obj.file }
  );

// 静态文件分页列表
export const staticUploadPageList = (obj) =>
  postJson("/admin/staticUpload/pageList", obj);

// 删除静态文件
export const deleteStaticUpload = (id) =>
  getBase("/admin/staticUpload/delete", { id });
