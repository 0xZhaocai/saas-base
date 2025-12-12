// app/lib/auth.client.ts
// Better-Auth 客户端配置

import { createAuthClient } from "better-auth/react";

/**
 * Better-Auth React 客户端
 * 提供 useSession, signIn, signUp, signOut 等 hooks
 */
export const authClient = createAuthClient({
    // 基础 URL (同域可省略，或使用环境变量)
    baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

// 导出常用方法，方便直接使用
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;
