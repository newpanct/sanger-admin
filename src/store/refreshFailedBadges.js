import { getFailed } from "../server/api";
import { setMenuBadges } from "./menuBadgeSlice";
import { FAILED_ORDER_PAGES, findMenuPath } from "../utils/menu";
import adminMenu from "../data/menu.json";

export const refreshFailedBadges = () => async (dispatch, getState) => {
  try {
    const res = await getFailed();
    if (res?.code === 200) {
      const data = res?.data || {};
      const menus = getState().auth.menus;
      const menuSource = menus?.length ? menus : adminMenu;
      dispatch(
        setMenuBadges(
          FAILED_ORDER_PAGES.map(({ component, field }) => ({
            path: findMenuPath(menuSource, component),
            value: data?.[field],
          })).filter((item) => item.path)
        )
      );
    }
  } catch (error) {
    console.error(error);
  }
};
