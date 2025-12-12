// app/routes/blog.index.tsx
// Blog list page

import { useLoaderData, Link } from "react-router";
import { data, type LoaderFunctionArgs } from "react-router";
import { getDb } from "@/db";
import { post, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { useTranslation } from "@/lib/app-context";
import { APP_CONFIG } from "@config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import type { Route } from "./+types/blog.index";
import type { Post } from "@/db/schema";

export const meta: Route.MetaFunction = () => [
    { title: `Blog${APP_CONFIG.seo.titleSuffix}` },
];

type PostWithAuthor = {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    authorName: string | null;
};

export async function loader({ context }: LoaderFunctionArgs) {
    const db = getDb(context.cloudflare.env);
    const posts = await db
        .select({
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            authorName: user.name,
        })
        .from(post)
        .leftJoin(user, eq(post.authorId, user.id))
        .orderBy(desc(post.createdAt));

    return data({ posts });
}

export default function BlogListPage() {
    const { posts } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">{t.blog.title}</h1>
                </div>

                {posts.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            {t.blog.noContent}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((p: PostWithAuthor) => (
                            <Link key={p.id} to={`/blog/${p.id}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="line-clamp-2">{p.title}</CardTitle>
                                        <CardDescription>
                                            {t.blog.by} {p.authorName || "Unknown"} · {new Date(p.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground line-clamp-3">
                                            {p.content.substring(0, 150)}...
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
