// app/routes/api.user.delete.tsx
// 删除账户 API

import { createAuth } from "@/lib/auth.server";
import type { ActionFunctionArgs } from "react-router";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * DELETE /api/user/delete
 * 永久删除用户账户及所有关联数据
 */
export async function action({ request, context }: ActionFunctionArgs) {
    if (request.method !== "DELETE") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    const auth = createAuth(env);
    const db = drizzle(env.DB, { schema });

    // 验证用户身份
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // 删除顺序很重要，需要先删除关联数据
        await db.delete(schema.session).where(eq(schema.session.userId, userId));
        await db.delete(schema.account).where(eq(schema.account.userId, userId));
        await db.delete(schema.user).where(eq(schema.user.id, userId));

        // 清理会话 cookie（强制当前登录失效）
        await auth.api.signOut({ headers: request.headers });

        return Response.json({ success: true });
    } catch (error) {
        console.error("Failed to delete account:", error);
        return Response.json({ error: "Failed to delete account" }, { status: 500 });
    }
}
