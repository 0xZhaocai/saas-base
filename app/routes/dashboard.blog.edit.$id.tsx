// app/routes/dashboard.blog.edit.$id.tsx
// Dashboard 编辑文章页面

import { useState } from "react";
import { useLoaderData, useNavigate, Link } from "react-router";
import { data, type LoaderFunctionArgs } from "react-router";
import { getDb } from "@/db";
import { post } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useTranslation } from "@/lib/app-context";
import { APP_CONFIG } from "@config";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createAuth } from "@/lib/auth.server";
import type { Route } from "./+types/dashboard.blog.edit.$id";
import type { Post } from "@/db/schema";

export const meta: Route.MetaFunction = () => [
    { title: `Edit Post${APP_CONFIG.seo.titleSuffix}` },
];

export async function loader({ params, request, context }: LoaderFunctionArgs) {
    const env = context.cloudflare.env as Env;
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
        throw new Response(null, { status: 302, headers: { Location: "/login" } });
    }

    const db = getDb(env);
    const id = params.id;

    const [result] = await db.select().from(post).where(eq(post.id, id!));

    if (!result) {
        throw new Response("Not Found", { status: 404 });
    }

    // Check ownership
    if (result.authorId !== session.user.id) {
        throw new Response("Forbidden", { status: 403 });
    }

    return data({ post: result });
}

type ApiResponse = {
    success: boolean;
    data?: Post;
    error?: string;
};

export default function DashboardBlogEditPage() {
    const { post: p } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;

        const response = await fetch("/api/blog", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: p.id, title, content }),
        });

        const result: ApiResponse = await response.json();

        if (result.success) {
            navigate(`/blog/${p.id}`);
        } else {
            setError(result.error || "Failed to update post");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{t.blog.editPost}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="title">{t.blog.titleLabel}</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder={t.blog.titlePlaceholder}
                                defaultValue={p.title}
                                required
                                maxLength={100}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">{t.blog.contentLabel}</Label>
                            <Textarea
                                id="content"
                                name="content"
                                placeholder={t.blog.contentPlaceholder}
                                defaultValue={p.content}
                                required
                                rows={12}
                                className="resize-y"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                            {loading ? "..." : t.blog.save}
                        </Button>
                        <Button variant="outline" type="button" asChild>
                            <Link to="/dashboard/blog">{t.blog.cancel}</Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
