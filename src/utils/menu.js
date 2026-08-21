const hasChildren = (item) => Array.isArray(item?.children) && item.children.length > 0;

export const normalizeMenus = (menus = []) =>
  [...(menus || [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((item) => ({
      id: item.id,
      path: item.path,
      label: item.label || item.name,
      icon: item.icon,
      component: item.component || undefined,
      hidden: item.hidden === true || item.visible === 0,
      children: hasChildren(item) ? normalizeMenus(item.children) : undefined,
    }));

export const getFirstLeafPath = (menus = [], parentPath = "") => {
  for (const item of menus) {
    if (item.hidden || !item.path) continue;
    const fullPath = parentPath
      ? `${parentPath}/${item.path}`.replace(/\/+/g, "/")
      : `/${item.path}`;
    if (hasChildren(item)) {
      const childPath = getFirstLeafPath(item.children, fullPath);
      if (childPath) return childPath;
      continue;
    }
    if (item.component) return fullPath;
  }
  return "";
};

export const getHomePath = (menus = []) => {
  const firstPath = getFirstLeafPath(menus);
  const hasDashboard = (items) =>
    items.some((item) => {
      if (item.hidden) return false;
      if (item.path === "dashboard" && item.component) return true;
      return hasChildren(item) ? hasDashboard(item.children) : false;
    });
  return hasDashboard(menus) ? "/dashboard" : firstPath || "/dashboard";
};
