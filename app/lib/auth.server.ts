// app/lib/auth.server.ts
// Better-Auth 服务端配置
// 注意: Cloudflare Workers 环境需要在运行时创建 auth 实例

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { APP_CONFIG } from "./config";

/**
 * 创建 Better-Auth 实例的工厂函数
 * 在 Cloudflare Workers 环境中，数据库绑定只在请求时可用
 * 因此需要在每个请求中动态创建 auth 实例
 */
export function createAuth(env: Env) {
    const db = drizzle(env.DB, { schema });

    return betterAuth({
        // 数据库配置 - 使用 Drizzle 适配器
        database: drizzleAdapter(db, {
            provider: "sqlite",
            // 如果需要加速查询可以启用实验性 joins
            // usePlural: false,
        }),

        // 基础 URL - 从环境变量获取或使用默认值
        baseURL: env.BETTER_AUTH_URL || "http://localhost:5173",

        // 密钥 - 用于加密会话等敏感数据
        secret: env.BETTER_AUTH_SECRET,

        // 邮箱验证配置
        emailVerification: {
            // 登录/注册时自动发送验证邮件
            sendOnSignUp: true,
            sendOnSignIn: true,
            // 验证成功后自动登录并发放会话
            autoSignInAfterVerification: true,
            // 自定义邮件发送逻辑
            sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }, request?: Request) => {
                try {
                    const { createEmailServiceFromEnv } = await import("@/lib/email");

                    if (!env.RESEND_API_KEY) {
                        console.error("[Auth] RESEND_API_KEY is missing");
                        throw new Error("Email service not configured");
                    }

                    const emailService = createEmailServiceFromEnv(env);
                    const lang = getRequestLanguage(request);

                    // 构造前端验证链接
                    const linkUrl = new URL(url);
                    const token = linkUrl.searchParams.get("token") || "";
                    const callbackURL = linkUrl.searchParams.get("callbackURL") || "/dashboard";
                    const base = env.BETTER_AUTH_URL || "http://localhost:5173";
                    const verificationUrl = `${base}/verify-email?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL)}`;

                    await emailService.sendVerificationEmail(
                        user.email,
                        user.name,
                        verificationUrl,
                        lang
                    );
                } catch (error) {
                    console.error("[Auth] Failed to send verification email:", error);
                    throw error;
                }
            },
        },

        // 启用邮箱密码认证
        emailAndPassword: {
            enabled: true,
            // 是否要求邮箱验证 - 从统一配置获取
            requireEmailVerification: APP_CONFIG.features.emailVerification,

            // 发送密码重置邮件
            sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }, request?: Request) => {
                const { createEmailServiceFromEnv } = await import("@/lib/email");
                const emailService = createEmailServiceFromEnv(env);
                const langHeader = getRequestLanguage(request);
                await emailService.sendPasswordResetEmail(
                    user.email,
                    user.name,
                    url,
                    langHeader
                );
            },
        },

        // Google OAuth 社交登录
        socialProviders: {
            google: {
                clientId: env.GOOGLE_CLIENT_ID || "",
                clientSecret: env.GOOGLE_CLIENT_SECRET || "",
            },
        },

        // 账号关联配置
        accountLinking: {
            // 允许关联不同邮箱的社交账号
            enabled: true,
            trustedProviders: ["google"],
        },

        // 会话配置
        session: {
            // 会话过期时间 (7天)
            expiresIn: 60 * 60 * 24 * 7,
            // 刷新会话的时间阈值 (1天)
            updateAge: 60 * 60 * 24,
            // Cookie 配置
            cookieCache: {
                enabled: true,
                maxAge: 60 * 5, // 5 分钟缓存
            },
        },

        // 用户配置
        user: {
            // 额外的用户字段映射 (如果需要)
            additionalFields: {},
        },

        // 信任主机 - 动态配置 (localhost + 生产环境 URL)
        trustedOrigins: buildTrustedOrigins(env),
    });
}

// 构建信任的来源列表
function buildTrustedOrigins(env: Env): string[] {
    const origins = [
        "http://localhost:5173",
        "http://localhost:8788",
    ];

    // 添加生产环境 URL
    if (env.BETTER_AUTH_URL && !env.BETTER_AUTH_URL.includes("localhost")) {
        origins.push(env.BETTER_AUTH_URL);
    }

    return origins;
}

// 导出类型
export type Auth = ReturnType<typeof createAuth>;
// 解析语言（优先 Accept-Language，其次 app-language cookie）
function getRequestLanguage(request?: Request | null): string | undefined {
    if (!request) return undefined;
    const cookie = request.headers.get("cookie");
    if (cookie) {
        const match = cookie.match(/app-language=([^;]+)/);
        if (match) return decodeURIComponent(match[1]);
    }
    const fromHeader = request.headers.get("accept-language");
    if (fromHeader) return fromHeader;
    return undefined;
}
