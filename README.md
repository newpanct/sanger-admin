# 桑格管理系统（admin.sangerbox.com）

Sangerbox 平台的后台管理系统，用于管理商户、支付、查重订单、邮件模板、微信公众号、模型计费、用户/企业/链接等业务。

基于 **React 18 + Create React App** 构建的单页应用，采用前后端分离架构，后端接口通过 `https://api.sangerbox.com/api` 通信。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 核心框架 | React 18 |
| 构建工具 | Create React App / react-scripts 5 |
| 路由 | React Router v7 |
| 状态管理 | Redux Toolkit + redux-persist |
| UI 组件库 | Ant Design 5 |
| 样式方案 | Tailwind CSS 3 + antd-style |
| HTTP 请求 | axios（统一封装在 `src/server/Network.js`） |
| 图表 | @ant-design/charts / @antv/g2 / @antv/g2plot |
| 代码编辑器 | @monaco-editor/react |
| 富文本编辑器 | react-quill |
| 国际化 | i18next |

## 环境要求

- Node.js 18+
- npm 9+

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 3000）
npm run start

# 生产构建
npm run build

# 运行测试
npm test
```

## 可用脚本

| 脚本 | 说明 |
| --- | --- |
| `npm run start` | 启动本地开发服务器 |
| `npm run build` | 打包生产环境产物到 `build/` |
| `npm run test` | 运行单元测试 |
| `npm run deploy` | 将 `build/` 部署到服务器 `Z:/users/panchengtian/online-project/admin2.sangerbox.com/live` |
| `npm run rollback` | 回滚到上一版本 |

## 项目结构

```text
admin.sangerbox.com/
├── public/              # 静态资源与 index.html
├── src/
│   ├── components/      # 公共组件（如 PageCard）
│   ├── data/            # 菜单等静态配置
│   │   ├── menu.json             # 管理员菜单
│   │   └── merchantMenu.json     # 商户菜单
│   ├── hooks/           # 自定义 Hooks（useIdleLogout 空闲登出）
│   ├── layouts/         # AdminLayout 后台主布局
│   ├── pages/           # 业务页面
│   │   ├── merchant-manage/      # 商户管理
│   │   ├── pay/                  # 支付金额统计
│   │   ├── scan/                 # 查重系统
│   │   ├── check/                # 预审系统
│   │   ├── recommend/            # 推荐系统
│   │   ├── overview/             # 综述系统
│   │   ├── merchant/             # 商户端页面
│   │   ├── wechat/               # 微信公众号
│   │   ├── web/                  # 网页管理
│   │   ├── user/                 # 用户/会员管理
│   │   ├── DashboardPage.js      # 仪表盘
│   │   ├── EmailPage.js          # 邮件模板
│   │   ├── ModelBillingPage.js   # 模型计费
│   │   ├── LinkPage.js           # 链接管理
│   │   ├── EnterprisePage.js     # 企业管理
│   │   ├── LoginPage.js          # 登录页
│   │   ├── ForbiddenPage.js      # 403 页面
│   │   └── NotFoundPage.js       # 404 页面
│   ├── routers/         # 路由与权限控制
│   │   ├── routes.js             # 路由配置 + 懒加载
│   │   └── PrivateRoute.js       # 角色权限守卫
│   ├── server/          # 接口服务
│   │   ├── Network.js            # axios 实例与拦截器
│   │   └── api.js                # 业务接口封装
│   ├── store/           # Redux 状态管理
│   │   ├── index.js              # store + 持久化配置
│   │   ├── themeSlice.js         # 主题 token
│   │   └── menuBadgeSlice.js     # 菜单红点/数字
│   ├── style/           # 局部样式
│   ├── utils/           # 工具函数
│   ├── config.js        # 全局配置（API 地址、超时、存储 key）
│   ├── App.js           # 根组件
│   └── index.js         # 入口文件
├── deploy.js            # 部署脚本（部署到 Z 盘）
├── rollback.js          # 回滚脚本
├── tailwind.config.js   # Tailwind 配置
├── postcss.config.js    # PostCSS 配置
└── package.json
```

## 核心功能

1. **权限系统**：基于角色的访问控制（RBAC），支持 `admin` / `superAdmin` / `merchant` 三种角色
2. **商户管理**：商户列表、余额管理、权限与卡密控制
3. **支付系统**：统计 CrossCheck / Imagetwin / SangerboxScope 的订单金额
4. **查重系统**：管理 CrossCheck、Imagetwin、Turnitin(v2)、SangerboxScope 的订单与异常订单
5. **预审系统**：期刊、稿件、证书管理
6. **推荐系统**：期刊推荐
7. **综述系统**：综述相关内容
8. **邮件模板**：邮件内容管理与预览（含默认 HTML 模板）
9. **微信公众号**：关键词回复配置
10. **模型计费**：模型计费管理
11. **用户管理**：会员管理
12. **链接 / 企业 / 网页管理**：平台其他内容维护

## 路由与权限

路由与权限守卫定义在 `src/routes/`：

- **登录页**：`/login`
- **管理员路由**：`/`，由 `PrivateRoute` 拦截，要求角色 `admin` / `superAdmin`
- **商户路由**：`/merchant`，要求角色 `merchant`
- **404 兜底**：未匹配路径展示 `NotFoundPage`

菜单通过 JSON 数据驱动：

- 管理员菜单：`src/data/menu.json`
- 商户菜单：`src/data/merchantMenu.json`

页面组件通过 `React.lazy` 懒加载，路由由 `routes.js` 中的 `generateRoutes` 函数根据菜单自动生成。

### 权限守卫流程

`PrivateRoute` 逻辑（见 `src/routes/PrivateRoute.js`）：

1. 若 Redux 中无 `token`，重定向到 `/login`
2. 若当前角色不在 `allow` 列表中，渲染 `ForbiddenPage`（403）
3. 否则渲染 `<Outlet />` 放行

## 状态管理

Redux Store 定义在 `src/store/index.js`，包含三个 slice：

| Slice | 说明 |
| --- | --- |
| `auth` | 登录态：token、role、username、wechatName、merchantId、merchantBalance |
| `theme` | Antd 主题 token（如 `colorPrimary`） |
| `menuBadge` | 菜单红点/数字提示（异常订单数量） |

使用 `redux-persist` 持久化 `auth` / `theme` / `menuBadge` 到 `localStorage`，key 为 `root`。

## 网络请求

`src/server/Network.js` 创建 axios 实例：

- **基础地址**：`config.baseUrl`（`https://api.sangerbox.com/api`）
- **超时**：10s
- **请求拦截**：自动注入 `Authorization` 头（取自 Redux `auth.token`）
- **响应拦截**：`code === 401` 或 HTTP 401 时清空本地存储并跳转登录页
- **错误处理**：统一处理 401 / 413 / 500 / Network Error

业务接口统一封装在 `src/server/api.js`，提供 `postJson` / `postForm` / `getBase` / `downloadFile` 等通用方法以及各模块的具体接口。

## 全局配置

`src/config.js` 中定义：

```js
{
  baseUrl: "https://api.sangerbox.com/api",
  wxcUrl: "http://api.sangerbox.com/wxc",
  timeout: 10000,
  storageKeys: { token: "auth_token", userInfo: "user_info" },
  pagination: { pageSize: 10, currentPage: 1 },
  roles: { admin: "admin", merchant: "merchant" },
  EMAIL_HTML_TEMPLATE: "..."  // 默认邮件 HTML 模板
}
```

## 布局特性

`src/layouts/AdminLayout.js` 提供典型的后台布局：

- 左侧可折叠菜单（根据角色动态渲染，支持徽标 badge）
- 顶部 Header：折叠按钮、全屏切换、明暗主题切换、主题色设置、用户头像、商户余额刷新
- 面包屑导航（粘性置顶）
- 内置空闲 30 分钟自动登出（`useIdleLogout`）
- 支持浅色/深色主题、6 种预设主题色 + 自定义颜色选择器

## 部署

部署脚本 `deploy.js` 会将 `build/` 目录通过 `robocopy` 同步到服务器 Z 盘的 `live` 目录，并保留历史版本以支持回滚。

```bash
# 部署最新构建
npm run deploy

# 回滚到上一版本
npm run rollback
```

> 部署目标：`Z:/users/panchengtian/online-project/admin2.sangerbox.com`

## 开发规范

- 新增页面：在 `src/pages/` 下按模块创建组件，并在 `src/routes/routes.js` 的 `componentMap` 中注册
- 新增菜单：编辑 `src/data/menu.json` 或 `src/data/merchantMenu.json`，填写 `path` / `label` / `icon` / `component`
- 新增接口：在 `src/server/api.js` 中按业务模块分组添加
- 公共组件统一放在 `src/components/`
- 状态管理：新增 slice 放到 `src/store/`，并在 `store/index.js` 中注册

## 版本记录

| 版本 | 发布时间 | 核心变更 |
| --- | --- | --- |
| v1.0 | 2026-02-05 | 初始版本，新增用户管理界面 |
| v1.2.10 | 2026-02-10 | 仪表盘界面更新，新增查重系统中的 SangerboxScope 订单 |
