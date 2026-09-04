const hasChildren = (item) => Array.isArray(item?.children) && item.children.length > 0;

export const flattenMenus = (nodes = [], acc = []) => {
    const seen = new Set(acc.map((item) => item.id));
    const walk = (list = []) => {
        list.forEach((item) => {
            if (!item) return;
            const { children, _level, ...rest } = item;
            if (rest.id != null && !seen.has(rest.id)) {
                seen.add(rest.id);
                acc.push(rest);
            }
            if (children?.length) walk(children);
        });
    };
    walk(nodes);
    return acc;
};

export const buildMenuTree = (flat = [], parentId = 0, level = 0) =>
    flat
        .filter((item) => String(item.parentId ?? 0) === String(parentId))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((item) => {
            const children = buildMenuTree(flat, item.id, level + 1);
            return {
                ...item,
                _level: level,
                children: children.length ? children : undefined,
            };
        });

export const normalizeMenuTree = (nodes = []) => buildMenuTree(flattenMenus(nodes));

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

export const getMenuBreadcrumb = (menus = [], selectedKey = "") => {
  if (!selectedKey) return [];
  const paths = selectedKey.replace(/^\//, "").split("/").filter(Boolean);
  const result = [];
  let currentMenus = menus;

  for (const path of paths) {
    const match = currentMenus.find((m) => m.path === path);
    if (!match) break;
    result.push({
      key: path,
      title: match.label,
    });
    currentMenus = match.children || [];
  }

  return result;
};
