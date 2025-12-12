// app/routes/config/business.ts
// 业务扩展路由 - 在此添加您的业务模块路由
// 新增业务模块时，在此文件添加路由配置即可

import { route, layout } from "@react-router/dev/routes";

/**
 * ========================================
 * 业务路由示例 - 可根据需求修改或删除
 * ========================================
 */

/**
 * 示例: 分析模块路由
 */
// export const analyticsRoutes = [
//     route("analytics", "routes/analytics.index.tsx"),
//     route("analytics/reports", "routes/analytics.reports.tsx"),
// ];

/**
 * 示例: 设置模块路由
 */
// export const settingsRoutes = [
//     layout("routes/settings.layout.tsx", [
//         route("settings", "routes/settings.index.tsx"),
//         route("settings/billing", "routes/settings.billing.tsx"),
//         route("settings/team", "routes/settings.team.tsx"),
//     ]),
// ];

/**
 * ========================================
 * Blog 模块路由
 * ========================================
 */
export const blogRoutes = [
    route("api/blog", "routes/api.blog.tsx"),
    route("blog", "routes/blog.index.tsx"),
    route("blog/:id", "routes/blog.$id.tsx"),
];

/**
 * ========================================
 * 在下方添加更多业务路由
 * ========================================
 */

// 导出所有业务路由
export const businessRoutes = [
    ...blogRoutes,
];
