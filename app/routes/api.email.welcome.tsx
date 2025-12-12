// app/routes/api.email.welcome.tsx
// 发送欢迎邮件 API

import { createEmailServiceFromEnv } from "@/lib/email";

interface ActionArgs {
    request: Request;
    context: { cloudflare: { env: Env } };
}

export async function action({ request, context }: ActionArgs) {
    try {
        const body = await request.json() as { email?: string; name?: string };
        const { email, name } = body;

        if (!email || !name) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 创建邮件服务
        const emailService = createEmailServiceFromEnv(context.cloudflare.env);

        // 发送欢迎邮件
        const lang = request.headers.get("accept-language") ?? undefined;
        await emailService.sendWelcomeEmail(email, name, lang);

        return Response.json({ success: true });
    } catch (error) {
        console.error("发送欢迎邮件失败:", error);
        return Response.json(
            { error: "Failed to send welcome email" },
            { status: 500 }
        );
    }
}
