// app/routes/api.user.resend-verification.tsx
// 重新发送邮箱验证邮件 API

import { createAuth } from "@/lib/auth.server";
import type { ActionFunctionArgs } from "react-router";

/**
 * POST /api/user/resend-verification
 * 重新发送邮箱验证邮件
 */
export async function action({ request, context }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    const auth = createAuth(env);

    // 验证用户身份
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 检查邮箱是否已验证
    if (session.user.emailVerified) {
        return Response.json({ error: "Email already verified" }, { status: 400 });
    }

    try {
        // 使用 Better-Auth 发送验证邮件
        // 这会触发 sendVerificationEmail 回调
        await auth.api.sendVerificationEmail({
            body: {
                email: session.user.email,
            },
            headers: request.headers,
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error("Failed to send verification email:", error);
        return Response.json({ error: "Failed to send verification email" }, { status: 500 });
    }
}
