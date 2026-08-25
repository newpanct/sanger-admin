# 桑格管理系统（admin.sangerbox.com）

Sangerbox 平台的后台管理系统，用于管理商户、支付、查重订单、邮件模板、微信公众号、模型计费、用户/企业/链接等业务。

基于 **React 18 + Vite 6** 构建的单页应用，采用前后端分离架构，后端接口通过 `https://api.sangerbox.com/api` 通信。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 核心框架 | React 18 |
| 构建工具 | Vite 6 + `@vitejs/plugin-react` |
| 路由 | React Router v7 |
| 状态管理 | Redux Toolkit + redux-persist |
| UI 组件库 | Ant Design 5 |
| 样式方案 | Tailwind CSS 3 + antd-style |
| HTTP 请求 | axios（统一封装在 `src/server/Network.js`） |
| 图表 | @ant-design/charts / @antv/g2 / @antv/g2plot |
| 代码编辑器 | @monaco-editor/react |
| 富文本编辑器 | react-quill |
| 数字动画 | react-countup |
| 国际化 | i18next |

## 环境要求

- Node.js 18+
- npm 9+

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 8002，可局域网访问）
npm start
# 或
npm run dev

# 生产构建（产物目录 build/）
npm run build

# 本地预览生产包
npm run preview
```

开发服务配置在 [`vite.config.js`](../vite.config.js)：

- `server.port` / `preview.port`：默认 `8002`
- `host: true`：监听 `0.0.0.0`，同事可用本机局域网 IP 访问
- `build.outDir: "build"`：与 `deploy.js` 一致

源码为 `.js` 中的 JSX，Vite 会将 `src/**/*.js` 按 JSX 编译。入口 HTML 在项目根目录 `index.html`，静态资源仍放 `public/`。

## 可用脚本

| 脚本 | 说明 |
| --- | --- |
| `npm start` / `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 打包生产环境产物到 `build/` |
| `npm run preview` | 本地预览生产包 |
| `npm run deploy` | 先构建，再将 `build/` 部署到 `Z:/users/panchengtian/online-project/admin2.sangerbox.com/live` |
| `npm run rollback` | 回滚到上一版本 |

Vite 产物目录仍是 `build/`，**部署 / 回滚脚本无需改动**。

## 项目结构

```text
admin2.sangerbox.com/
├── public/              # 静态资源（favicon、js/wxLogin.js 等）
├── index.html           # Vite 入口 HTML
├── vite.config.js       # Vite：端口、host、outDir、JSX
├── src/
│   ├── components/      # 公共组件
│   │   ├── PageCard.js
│   │   ├── StatRibbonCard.js         # 统计卡 + CountUp
│   │   ├── DoubleDeleteConfirm.js    # 两次删除确认
│   │   ├── CopyableEllipsisText.js   # 省略 + 复制
│   │   └── NoticeBannerPreview.js    # 公告横幅预览
│   ├── data/            # 菜单等静态配置
│   │   ├── menu.json             # 管理员菜单兜底
│   │   └── merchantMenu.json     # 商户菜单
│   ├── hooks/           # 自定义 Hooks（useIdleLogout 空闲登出）
│   ├── layouts/         # AdminLayout 后台主布局
│   ├── pages/           # 业务页面
│   │   ├── merchant-manage/      # 商户管理
│   │   ├── menu-manage/          # 菜单 / 角色 / 角色菜单
│   │   ├── pay/                  # 支付金额统计、企业充值
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
│   │   ├── RefundReasonPage.js   # 退款理由
│   │   ├── LoginPage.js          # 登录页
│   │   ├── ForbiddenPage.js      # 403 页面
│   │   └── NotFoundPage.js       # 404 页面
│   ├── routes/          # 路由与权限控制
│   │   ├── routes.js             # 路由配置 + 懒加载
│   │   └── PrivateRoute.js       # token 守卫
│   ├── server/          # 接口服务
│   │   ├── Network.js            # axios 实例与拦截器
│   │   └── api/                  # 按模块拆分的业务接口
│   ├── store/           # Redux 状态管理
│   │   ├── index.js              # store + 持久化配置
│   │   ├── themeSlice.js         # 主题 token
│   │   └── menuBadgeSlice.js     # 菜单红点/数字
│   ├── style/           # 局部样式
│   ├── utils/           # 工具函数
│   ├── config.js        # 全局配置（API 地址、超时、预设主题色）
│   ├── App.js           # 根组件
│   └── index.js         # 入口文件
├── deploy.js            # 部署脚本（部署到 Z 盘）
├── rollback.js          # 回滚脚本
├── tailwind.config.js   # Tailwind 配置
├── postcss.config.js    # PostCSS 配置
└── package.json
```

## 核心功能

1. **权限系统**：登录后菜单由后端下发，路由按 `auth.menus` 动态生成；本地 `menu.json` 仅作兜底
2. **商户管理**：商户列表、余额管理、权限与卡密控制
3. **支付系统**：统计 CrossCheck / Imagetwin / SangerboxScope 金额；企业充值、个人账户明细
4. **查重系统**：管理 CrossCheck、Imagetwin、Turnitin(v2)、SangerboxScope 的订单与异常订单（提交 / 忽略 / 退款）
5. **预审系统**：期刊、稿件、证书管理
6. **推荐系统**：期刊推荐
7. **综述系统**：综述相关内容
8. **邮件模板**：邮件内容管理与预览（含默认 HTML 模板）
9. **微信公众号**：关键词回复配置
10. **模型计费**：Token / 费用总览与月度明细
11. **用户管理**：会员管理、用户列表
12. **链接 / 企业 / 网页管理**：公告横幅、服务开关、企业客户
13. **系统管理**：菜单、角色、角色菜单；删除菜单/角色为两次确认
14. **退款理由**：维护异常订单退款弹窗中的快捷原因

## 路由与权限

路由与权限守卫定义在 `src/routes/`：

- **登录页**：`/login`
- **后台路由**：`/`，由 `PrivateRoute` 拦截，无 `token` 则跳转登录
- **404 兜底**：未匹配路径展示 `NotFoundPage`

登录成功后按 `getHomePath(auth.menus)` 进入有权限的首页（一般为仪表盘）。直接访问 `/` 会重定向到 `/dashboard`。

菜单来源：

- 登录接口返回的 `menus`（主路径）
- 兜底：`src/data/menu.json`（管理员）、`src/data/merchantMenu.json`（商户端）

页面组件通过 `React.lazy` 懒加载，路由由 `routes.js` 中的 `generateRoutes` 根据菜单自动生成。

### 权限守卫流程

`PrivateRoute`（见 `src/routes/PrivateRoute.js`）：

1. 若 Redux 中无 `token`，重定向到 `/login`
2. 否则渲染 `<Outlet />` 放行

侧栏只渲染当前账号 `auth.menus` 中的项，无权限入口不会出现。

## 状态管理

Redux Store 定义在 `src/store/index.js`，包含三个 slice：

| Slice | 说明 |
| --- | --- |
| `auth` | 登录态：token、role、username、menus、merchantId、merchantBalance 等 |
| `theme` | Antd 主题 token（如 `colorPrimary`） |
| `menuBadge` | 菜单红点/数字提示（异常订单数量） |

使用 `redux-persist` 持久化 `auth` / `theme` / `menuBadge` 到 **localStorage**，key 为 `root`。

## 网络请求

`src/server/Network.js` 创建 axios 实例：

- **基础地址**：`config.baseUrl`（`https://api.sangerbox.com/api`）
- **超时**：10s
- **请求拦截**：自动注入 `Authorization` 头（取自 Redux `auth.token`）
- **响应拦截**：`code === 401` 或 HTTP 401 时清空本地存储并跳转登录页
- **错误处理**：统一处理 401 / 403 / 404 / 413 / 500 / Network Error

业务接口按模块拆在 `src/server/api/`，由 `src/server/api/index.js` 汇总导出。通用方法在 `_helpers.js`：`postJson` / `postForm` / `getBase` / `downloadFile`。

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
  EMAIL_HTML_TEMPLATE: "...",  // 默认邮件 HTML 模板
  presetColors: ["#1890ff", "#00b42a", "#ff7d00", "#f53f3f", "#722ed1", "#0fc6c2"]
}
```

`presetColors` 用于顶栏主题色块，以及仪表盘 / 模型计费 / 金额统计等统计卡绶带配色。

## 布局特性

`src/layouts/AdminLayout.js` 提供典型的后台布局：

- 左侧可折叠菜单（根据登录菜单动态渲染，支持徽标 badge）
- 顶部 Header：折叠按钮、全屏切换、明暗主题切换、主题色设置、用户头像、商户余额刷新
- 面包屑导航（粘性置顶）
- 内置空闲 30 分钟自动登出（`useIdleLogout`）
- 支持浅色/深色主题、6 种预设主题色 + 自定义颜色选择器
- 主题色会作用到柱状图、链接、复制图标等

## 部署

部署脚本 `deploy.js` 会执行 `npm run build`，再将 `build/` 通过 `robocopy` 同步到服务器 Z 盘的 `live` 目录，并保留历史版本以支持回滚。

```bash
# 部署最新构建
npm run deploy

# 回滚到上一版本
npm run rollback
```

> 部署目标：`Z:/users/panchengtian/online-project/admin2.sangerbox.com`

## 开发规范

- 新增页面：在 `src/pages/` 下按模块创建组件，并在 `src/routes/routes.js` 的 `componentMap` 中注册
- 新增菜单：后端菜单优先；本地兜底可编辑 `src/data/menu.json` 或 `src/data/merchantMenu.json`，填写 `path` / `label` / `icon` / `component`
- 新增接口：在 `src/server/api/` 对应模块文件中添加，并确保 `index.js` 有导出
- 公共组件统一放在 `src/components/`
- 状态管理：新增 slice 放到 `src/store/`，并在 `store/index.js` 中注册

## 相关文档

- 使用说明：[USER_GUIDE.md](./USER_GUIDE.md)
- 根目录 [README.md](../README.md)、[USER_GUIDE.md](../USER_GUIDE.md) 与本文同步（链接以各自目录为准）

## 版本记录

- 构建工具由 Create React App 迁移至 Vite 6，开发/预览端口为 `8002`
- 仪表盘与统计卡增加 CountUp、主题色联动；金额统计「待退款金额 / 净收入」取接口总览字段
- 异常订单退款可跳转「退款理由管理」；菜单/角色删除改为两次确认
