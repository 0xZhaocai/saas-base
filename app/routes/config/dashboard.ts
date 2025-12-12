// app/routes/config/dashboard.ts
// 仪表盘路由配置 - 底座核心，请勿修改

import { route, layout } from "@react-router/dev/routes";

/**
 * 仪表盘路由 (需登录)
 * 使用布局路由实现统一侧边栏
 */
export const dashboardRoutes = [
    layout("routes/dashboard.layout.tsx", [
        route("dashboard", "routes/dashboard.index.tsx"),
        route("profile", "routes/dashboard.profile.tsx"),
        // Blog 管理 (在 Dashboard 内)
        route("dashboard/blog", "routes/dashboard.blog.tsx"),
        route("dashboard/blog/new", "routes/dashboard.blog.new.tsx"),
        route("dashboard/blog/:id/edit", "routes/dashboard.blog.edit.$id.tsx"),
    ]),
];
