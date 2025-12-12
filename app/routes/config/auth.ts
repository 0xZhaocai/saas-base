// app/routes/config/auth.ts
// 认证相关路由配置 - 底座核心，请勿修改

import { route } from "@react-router/dev/routes";

/**
 * 认证页面路由
 */
export const authPageRoutes = [
    route("login", "routes/auth.login.tsx"),
    route("register", "routes/auth.register.tsx"),
    route("forgot-password", "routes/auth.forgot-password.tsx"),
    route("reset-password", "routes/auth.reset-password.tsx"),
    route("verify-email", "routes/verify-email.tsx"),
];

/**
 * 认证 API 路由
 */
export const authApiRoutes = [
    // Better-Auth API 路由 (处理所有 /api/auth/* 请求)
    route("api/auth/*", "routes/api.auth.$.tsx"),
];

/**
 * 用户 API 路由
 */
export const userApiRoutes = [
    route("api/user/profile", "routes/api.user.profile.tsx"),
    route("api/user/password", "routes/api.user.password.tsx"),
    route("api/user/set-password", "routes/api.user.set-password.tsx"),
    route("api/user/delete", "routes/api.user.delete.tsx"),
    route("api/user/resend-verification", "routes/api.user.resend-verification.tsx"),
    route("api/user/avatar-upload", "routes/api.user.avatar-upload.tsx"),
    route("api/user/avatar/*", "routes/api.user.avatar.$.tsx"),
    route("api/user/exists", "routes/api.user.exists.tsx"),
    route("api/user/unlink-google", "routes/api.user.unlink-google.tsx"),
];
