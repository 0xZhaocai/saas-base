// app/routes/api.user.unlink-google.tsx
// 解绑 Google 账号 API 端点

import type { ActionFunctionArgs } from "react-router";
import { createAuth } from "@/lib/auth.server";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function action({ request, context }: ActionFunctionArgs) {
    const env = context.cloudflare.env as Env;
    const auth = createAuth(env);
    const db = drizzle(env.DB, { schema });

    try {
        // 1. Get current user session
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return new Response(JSON.stringify({ error: "未登录" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Check if user has at least one other login method
        const userAccounts = await db.select().from(schema.account).where(
            eq(schema.account.userId, session.user.id)
        );

        // Check if user has password (credential provider)
        const hasPassword = userAccounts.some(a => a.providerId === 'credential');

        // If no password and only 1 account (Google), prevent unlinking
        if (!hasPassword && userAccounts.length <= 1) {
            return new Response(JSON.stringify({
                error: "请先设置密码后再解绑 Google 账号"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 3. Delete Google account record
        await db.delete(schema.account).where(
            and(
                eq(schema.account.userId, session.user.id),
                eq(schema.account.providerId, 'google')
            )
        );

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error('Unlink Google error:', error);
        return new Response(JSON.stringify({
            error: "解绑失败，请稍后重试"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
