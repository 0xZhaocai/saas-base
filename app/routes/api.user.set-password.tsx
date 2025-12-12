// app/routes/api.user.set-password.tsx
// Google 用户设置初始密码 API

import type { ActionFunctionArgs } from "react-router";
import { createAuth } from "@/lib/auth.server";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function action({ request, context }: ActionFunctionArgs) {
    const env = context.cloudflare.env as Env;
    const auth = createAuth(env);
    const db = drizzle(env.DB, { schema });

    try {
        // 1. 验证用户身份
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return new Response(JSON.stringify({ error: "未登录" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. 获取请求数据
        const body = await request.json() as { password: string; confirmPassword: string };
        const { password, confirmPassword } = body;

        // 3. 验证密码
        if (!password || !confirmPassword) {
            return new Response(JSON.stringify({ error: "请输入密码" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (password !== confirmPassword) {
            return new Response(JSON.stringify({ error: "两次密码不一致" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 4. 验证密码强度（与注册页面一致）
        if (password.length < 8 || password.length > 20) {
            return new Response(JSON.stringify({ error: "密码长度必须为8-20个字符" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!/[A-Z]/.test(password)) {
            return new Response(JSON.stringify({ error: "密码必须包含大写字母" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!/[a-z]/.test(password)) {
            return new Response(JSON.stringify({ error: "密码必须包含小写字母" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!/[0-9]/.test(password)) {
            return new Response(JSON.stringify({ error: "密码必须包含数字" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 5. 检查用户是否已有密码
        const accounts = await db.select().from(schema.account).where(
            eq(schema.account.userId, session.user.id)
        );

        const hasPassword = accounts.some(a => a.providerId === 'credential');

        if (hasPassword) {
            return new Response(JSON.stringify({ error: "您已设置过密码，请使用修改密码功能" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 6. 使用 Better-Auth 的 API 设置密码
        // Better-Auth 会自动哈希密码
        await auth.api.setPassword({
            body: {
                newPassword: password,
            },
            headers: request.headers,
        });

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error('Set password error:', error);
        return new Response(JSON.stringify({
            error: "设置密码失败，请稍后重试"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
