// app/routes/dashboard.blog.tsx
// Dashboard 文章管理页面 - 我的文章列表

import { useLoaderData, Link } from "react-router";
import { data, type LoaderFunctionArgs } from "react-router";
import { getDb } from "@/db";
import { post } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { useTranslation } from "@/lib/app-context";
import { APP_CONFIG } from "@config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createAuth } from "@/lib/auth.server";
import type { Route } from "./+types/dashboard.blog";

export const meta: Route.MetaFunction = () => [
    { title: `My Posts${APP_CONFIG.seo.titleSuffix}` },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
    const env = context.cloudflare.env as Env;
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
        throw new Response(null, { status: 302, headers: { Location: "/login" } });
    }

    const db = getDb(env);
    const posts = await db
        .select({
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        })
        .from(post)
        .where(eq(post.authorId, session.user.id))
        .orderBy(desc(post.createdAt));

    return data({ posts });
}

type PostItem = {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
};

export default function DashboardBlogPage() {
    const { posts } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    const handleDelete = async (id: string) => {
        if (!confirm(t.blog.deleteConfirm)) return;

        const response = await fetch("/api/blog", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{t.blog.myPosts}</h1>
                    <p className="text-muted-foreground">{t.blog.manageYourPosts}</p>
                </div>
                <Button asChild>
                    <Link to="/dashboard/blog/new">{t.blog.newPost}</Link>
                </Button>
            </div>

            {posts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        {t.blog.noContent}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {posts.map((p: PostItem) => (
                        <Card key={p.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{p.title}</CardTitle>
                                        <CardDescription>
                                            {new Date(p.createdAt).toLocaleDateString()}
                                            {p.updatedAt > p.createdAt && (
                                                <span className="ml-2">
                                                    ({t.blog.updated}: {new Date(p.updatedAt).toLocaleDateString()})
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/blog/${p.id}`}>{t.blog.view}</Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/dashboard/blog/${p.id}/edit`}>{t.blog.editPost}</Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            {t.blog.deletePost}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground line-clamp-2">
                                    {p.content.substring(0, 200)}...
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
