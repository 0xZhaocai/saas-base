// app/routes.ts
// 路由总配置 - 模块化结构
// 
// 结构说明:
// - routes/config/auth.ts      - 认证路由 (底座核心)
// - routes/config/dashboard.ts - 仪表盘路由 (底座核心)
// - routes/config/business.ts  - 业务路由 (可扩展)

import { type RouteConfig, index } from "@react-router/dev/routes";
import {
    authPageRoutes,
    authApiRoutes,
    userApiRoutes,
    dashboardRoutes,
    businessRoutes,
} from "./routes/config";

export default [
    // 首页
    index("routes/home.tsx"),

    // ==================== 底座核心路由 (请勿修改) ====================

    // 认证 API
    ...authApiRoutes,

    // 用户 API
    ...userApiRoutes,

    // 认证页面
    ...authPageRoutes,

    // 仪表盘
    ...dashboardRoutes,

    // ==================== 业务扩展路由 (可自由添加) ====================

    // 业务模块路由 (在 routes/config/business.ts 中配置)
    ...businessRoutes,
] satisfies RouteConfig;
