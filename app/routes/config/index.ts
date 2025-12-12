// app/routes/config/index.ts
// 路由配置统一导出入口

// 认证路由 (底座核心 - 请勿修改)
export { authPageRoutes, authApiRoutes, userApiRoutes } from "./auth";

// 仪表盘路由 (底座核心 - 请勿修改)
export { dashboardRoutes } from "./dashboard";

// 业务路由 (可扩展 - 自由修改)
export { businessRoutes } from "./business";
