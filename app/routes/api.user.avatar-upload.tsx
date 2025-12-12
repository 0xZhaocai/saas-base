// app/routes/api.user.avatar-upload.tsx
// 头像上传：校验登录，直接写入 R2，返回可访问的代理 URL

import type { ActionFunctionArgs } from "react-router";
import { createAuth } from "@/lib/auth.server";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function action({ request, context }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const env = context.cloudflare.env as Env;
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
        return Response.json({ error: "File is required" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
        return Response.json({ error: "File too large" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return Response.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const ext = file.type.split("/")[1] || "jpg";
    const key = `${session.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    try {
        await env.AVATAR_BUCKET.put(key, file.stream(), {
            httpMetadata: { contentType: file.type },
        });

        // 通过代理路由访问，避免直接暴露存储域名
        const publicUrl = `/api/user/avatar/${encodeURIComponent(key)}`;

        return Response.json({ key, url: publicUrl });
    } catch (error) {
        console.error("Failed to upload avatar:", error);
        return Response.json({ error: "Upload failed" }, { status: 500 });
    }
}

