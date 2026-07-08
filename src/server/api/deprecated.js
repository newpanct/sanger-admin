import { getBase, getBaseRaw, postForm, downloadFile } from "./_helpers";

/* 以下接口已作废，保留仅为兼容性 */

// 期刊
export const findTotalJournal = (obj) => postForm("/findTotalJournal", obj);
export const isOnlineJournal = (obj) => postForm("/isOnlineJournal", obj);
export const findJournalByTitle = (obj) =>
  postForm("/findJournalByTitle", obj);
export const addJournalByFile = (file) =>
  postForm("/addJournalByFile", { file });

// 稿件
export const findAllManuscript = (obj) => postForm("/findAllManuscript", obj);
export const findManuTitle = (title) =>
  postForm("/findManuscriptSubmitByManuscriptTitle", { title });

export const downloadFileById = async (id) => {
  const response = await getBaseRaw("/downloadFileById", { id }, {
    responseType: "blob",
  });
  downloadFile(response, "file.docx");
  return response.data;
};

// 查询回滚状态(稿件)
export const findStatusById = (id) => getBase("/findStatusById", { id });

// 证书
export const findAllCertification = (obj) =>
  postForm("/findAllCertification", obj);
export const findCertTitle = (title) =>
  postForm("/findCertificationByTitle", { title });

export const downloadCert = async (id) => {
  const response = await getBaseRaw("/downloadCertificationById", { id }, {
    responseType: "blob",
  });
  downloadFile(response, "certification.pdf");
  return response.data;
};

// 操作稿件
export const operateManuscriptById = (obj) =>
  postForm("/operateManuscriptById", obj);

// 用户管理
export const findAdminUser = () => postForm("/findAdminUser");
export const addAdminUser = (obj) => postForm("/addAdminUser", obj);
export const updateAdminUser = (obj) => postForm("/updateAdminUser", obj);
export const deleteAdminUser = (email) =>
  postForm("/deleteAdminUser", { email });

// 商户管理
export const findAllMerchant = () => postForm("/findAllMerchant");
export const createMerchant = (obj) => postForm("/createMerchant", obj);

// 支付
export const findAllCheckRecords = () => postForm("/findAllCheckRecords");
export const findCheckByOrderNo = (orderNo) =>
  postForm("/findCheckByOrderNo", { orderNo });
export const showIwAndIthCountMonth = () =>
  postForm("/showIwAndIthCountMonth");
export const showIwAndIthCountDay = () => postForm("/showIwAndIthCountDay");
