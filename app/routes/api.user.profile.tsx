// app/routes/api.user.profile.tsx
// 用户资料 API - 获取/更新用户信息

import { createAuth } from "@/lib/auth.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/user/profile
 * 获取用户详细信息（含关联账户）
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
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

    // 从数据库获取最新用户信息（不使用 session 缓存）
    const users = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, session.user.id))
        .limit(1);

    const latestUser = users[0];

    if (!latestUser) {
        return Response.json({ error: "User not found" }, { status: 404 });
    }

    // 获取用户关联的账户
    const accounts = await db
        .select({
            id: schema.account.id,
            providerId: schema.account.providerId,
            createdAt: schema.account.createdAt,
        })
        .from(schema.account)
        .where(eq(schema.account.userId, session.user.id));

    // 判断用户类型
    const hasPassword = accounts.some((a) => a.providerId === "credential");
    const hasGoogle = accounts.some((a) => a.providerId === "google");
    const hasGithub = accounts.some((a) => a.providerId === "github");

    return Response.json({
        user: {
            id: latestUser.id,
            name: latestUser.name,
            email: latestUser.email,
            image: latestUser.image,
            emailVerified: latestUser.emailVerified,
            createdAt: latestUser.createdAt,
        },
        accounts: {
            hasPassword,
            google: hasGoogle,
            github: hasGithub,
        },
    });
}

/**
 * PUT /api/user/profile
 * 更新用户基本信息（昵称、头像）
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
        const { name, image } = body as { name?: string; image?: string };

        // 验证输入
        if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
            return Response.json({ error: "Invalid name" }, { status: 400 });
        }

        // 准备更新数据
        const updateData: { name?: string; image?: string; updatedAt: Date } = {
            updatedAt: new Date(),
        };

        if (name !== undefined) {
            updateData.name = name.trim();
        }

        if (image !== undefined) {
            updateData.image = image;
        }

        // 更新用户信息
        await db
            .update(schema.user)
            .set(updateData)
            .where(eq(schema.user.id, session.user.id));

        return Response.json({ success: true });
    } catch (error) {
        console.error("Failed to update profile:", error);
        return Response.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
