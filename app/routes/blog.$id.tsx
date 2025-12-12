// app/routes/blog.$id.tsx
// Blog detail page

import { useLoaderData, Link } from "react-router";
import { data, type LoaderFunctionArgs } from "react-router";
import { getDb } from "@/db";
import { post, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useTranslation } from "@/lib/app-context";
import { APP_CONFIG } from "@config";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import type { Route } from "./+types/blog.$id";

type PostDetail = {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    authorName: string | null;
};

export const meta: Route.MetaFunction = ({ data: loaderData }) => {
    const postData = loaderData as { post: PostDetail } | undefined;
    return [
        { title: `${postData?.post?.title || "Post"}${APP_CONFIG.seo.titleSuffix}` },
    ];
};

export async function loader({ params, context }: LoaderFunctionArgs) {
    const db = getDb(context.cloudflare.env);
    const id = params.id;

    const [result] = await db
        .select({
            id: post.id,
            title: post.title,
            content: post.content,
            authorId: post.authorId,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            authorName: user.name,
        })
        .from(post)
        .leftJoin(user, eq(post.authorId, user.id))
        .where(eq(post.id, id!));

    if (!result) {
        throw new Response("Not Found", { status: 404 });
    }

    return data({ post: result });
}

export default function BlogDetailPage() {
    const { post: p } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto py-8 px-4 max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">{p.title}</CardTitle>
                        <p className="text-muted-foreground">
                            {t.blog.by} {p.authorName || "Unknown"} · {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                            {p.content}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" asChild>
                            <Link to="/blog">← {t.blog.backToList}</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
