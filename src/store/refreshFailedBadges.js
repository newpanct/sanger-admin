import { getFailed } from "../server/api";
import { setMenuBadges } from "./menuBadgeSlice";

export const refreshFailedBadges = () => async (dispatch) => {
  try {
    const res = await getFailed();
    if (res?.code === 200) {
      const data = res?.data || {};
      dispatch(
        setMenuBadges([
          {
            path: "/scan/crosscheck/abnormal-orders",
            value: data?.paperCount,
          },
          {
            path: "/scan/imagetwin/abnormal-orders",
            value: data?.imageCount,
          },
          {
            path: "/scan/history/abnormal-orders",
            value: data?.turnitinCount,
          },
          {
            path: "/scan/duplisee/abnormal-orders",
            value: data?.dupliseeCount,
          },
        ])
      );
    }
  } catch (error) {
    console.error(error);
  }
};
