// app/routes/api.user.password.tsx
// 密码修改 API

import { createAuth } from "@/lib/auth.server";
import type { ActionFunctionArgs } from "react-router";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * PUT /api/user/password
 * 修改用户密码（仅邮箱注册用户可用）
 */
export async function action({ request, context }: ActionFunctionArgs) {
    if (request.method !== "PUT") {
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
        const body = await request.json();
        const { currentPassword, newPassword } = body as {
            currentPassword: string;
            newPassword: string;
        };

        // 验证输入
        if (!currentPassword || !newPassword) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (newPassword.length < 8 || newPassword.length > 20) {
            return Response.json({ error: "Password must be 8-20 characters" }, { status: 400 });
        }

        // 检查用户是否有密码账户（邮箱注册）
        const credentialAccount = await db
            .select()
            .from(schema.account)
            .where(
                and(
                    eq(schema.account.userId, session.user.id),
                    eq(schema.account.providerId, "credential")
                )
            )
            .limit(1);

        if (credentialAccount.length === 0) {
            return Response.json(
                { error: "Password change not available for OAuth users" },
                { status: 400 }
            );
        }

        // 使用 Better-Auth 的密码更改功能
        // Better-Auth 会自动验证当前密码并更新
        const result = await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
            },
            headers: request.headers,
        });

        if (!result) {
            return Response.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("Failed to change password:", error);

        // 检查是否是密码错误
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage.includes("password") || errorMessage.includes("incorrect")) {
            return Response.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        return Response.json({ error: "Failed to change password" }, { status: 500 });
    }
}
