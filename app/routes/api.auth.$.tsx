// app/routes/api.auth.$.tsx
// Better-Auth API 路由处理器
// 处理所有 /api/auth/* 路由

import type { Route } from "./+types/api.auth.$";
import { createAuth } from "@/lib/auth.server";

/**
 * Loader: 处理 GET 请求
 * 如 /api/auth/session, /api/auth/csrf 等
 */
export async function loader({ request, context }: Route.LoaderArgs) {
    const auth = createAuth(context.cloudflare.env);
    return auth.handler(request);
}

/**
 * Action: 处理 POST 请求
 * 如 /api/auth/sign-in, /api/auth/sign-up, /api/auth/sign-out 等
 */
export async function action({ request, context }: Route.ActionArgs) {
    const auth = createAuth(context.cloudflare.env);
    return auth.handler(request);
}
