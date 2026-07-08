import { getBase, postJson } from "./_helpers";

// 会员补偿
export const memberCompensate = (obj) =>
  postJson("/admin/pub/member/compensate", obj);

// 统计会员补偿人数
export const memberCount = (obj) => postJson("/admin/pub/member/count", obj);

// 查询用户
export const queryByModileOrUserId = (mobileOrUserId) =>
  getBase(
    `/admin/pub/member/queryByModileOrUserId?mobileOrUserId=${mobileOrUserId}`
  );

// 优惠码分页
export const couponPageList = (obj) => postJson("/admin/coupon/pageList", obj);
