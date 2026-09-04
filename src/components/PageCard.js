import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, Divider, Flex, Modal, Table, Typography } from "antd";
import adminMenu from "../data/menu.json";
import { getMenuBreadcrumb } from "../utils/menu";

const getTypeName = (type) => {
  if (typeof type === "string") return type;
  return type?.displayName || type?.name || "";
};

const isAntdTable = (child) =>
  React.isValidElement(child) &&
  (child.type === Table || getTypeName(child.type) === "Table");

const isAntdModal = (child) =>
  React.isValidElement(child) &&
  (child.type === Modal || getTypeName(child.type) === "Modal");

const PageCard = ({
  title,
  description,
  extraActions,
  rightActions,
  bodyPadding,
  children,
}) => {
  const location = useLocation();
  const authMenus = useSelector((state) => state.auth.menus);
  const menuSource = authMenus?.length ? authMenus : adminMenu;
  const crumbs = getMenuBreadcrumb(menuSource, location.pathname);
  const displayTitle = crumbs[crumbs.length - 1]?.title || title;

  const contentChildren = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && !isAntdModal(child)
  );
  const onlyTable =
    contentChildren.length > 0 && contentChildren.every(isAntdTable);
  const padding = bodyPadding ?? (onlyTable ? 0 : undefined);
  const bodyStyle =
    padding !== undefined
      ? { padding }
      : { padding: "10px", paddingTop: "0px" };

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            gap: 16,
          }}
        >
          {/* 左边：标题 + 额外操作 */}
          <Flex align={description ? "flex-start" : "center"} gap={12}>
            <div>
              <div style={{ fontWeight: 500 }}>{displayTitle}</div>
              {description ? (
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, fontWeight: 400, display: "block" }}
                >
                  {description}
                </Typography.Text>
              ) : null}
            </div>
            {extraActions && (
              <>
                <Divider type="vertical" />
                {extraActions}
              </>
            )}
          </Flex>

          {/* 右边：按钮组 */}
          <div>{rightActions}</div>
        </div>
      }
      styles={{
        body: bodyStyle,
      }}
    >
      {children}
    </Card>
  );
};

export default PageCard;
