// app/routes/api.user.avatar.$.tsx
// 从 R2 读取头像并返回给前端，key 通过通配路由捕获

import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request, params, context }: LoaderFunctionArgs) {
    const env = context.cloudflare.env as Env;
    const key = params["*"];

    if (!key) {
        return new Response("Not found", { status: 404 });
    }

    try {
        const object = await env.AVATAR_BUCKET.get(key);
        if (!object) {
            return new Response("Not found", { status: 404 });
        }

        const headers = new Headers();
        if (object.httpMetadata?.contentType) {
            headers.set("Content-Type", object.httpMetadata.contentType);
        }
        // 允许缓存一小时
        headers.set("Cache-Control", "public, max-age=3600");

        return new Response(object.body, { headers });
    } catch (error) {
        console.error("Failed to read avatar:", error);
        return new Response("Internal error", { status: 500 });
    }
}

