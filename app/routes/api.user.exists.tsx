// app/routes/api.user.exists.tsx
// 检查用户邮箱是否存在，供前端判断错误提示

import type { LoaderFunctionArgs } from "react-router";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
        return Response.json({ error: "Missing email" }, { status: 400 });
    }

    const env = context.cloudflare.env as Env;
    const db = drizzle(env.DB, { schema });

    const users = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.email, email.trim().toLowerCase()))
        .limit(1);

    return Response.json({ exists: users.length > 0 });
}
