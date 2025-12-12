// app/types/env.d.ts
// 环境变量类型扩展

declare global {
    interface Env {
        // Cloudflare D1 数据库
        DB: D1Database;

        // Better-Auth 环境变量
        BETTER_AUTH_SECRET: string;
        BETTER_AUTH_URL: string;

        // Resend 邮件服务
        RESEND_API_KEY: string;
        RESEND_FROM_EMAIL: string;

        // Cloudflare R2 bucket for avatars
        AVATAR_BUCKET: R2Bucket;

        // OAuth 提供商 (可选)
        GITHUB_CLIENT_ID?: string;
        GITHUB_CLIENT_SECRET?: string;
        GOOGLE_CLIENT_ID?: string;
        GOOGLE_CLIENT_SECRET?: string;

        // 其他 Cloudflare 变量
        VALUE_FROM_CLOUDFLARE?: string;
    }
}

export { };
