// app/routes/dashboard.blog.new.tsx
// Dashboard 创建新文章页面

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useTranslation } from "@/lib/app-context";
import { APP_CONFIG } from "@config";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Route } from "./+types/dashboard.blog.new";

export const meta: Route.MetaFunction = () => [
    { title: `New Post${APP_CONFIG.seo.titleSuffix}` },
];

type ApiResponse = {
    success: boolean;
    data?: { id: string };
    error?: string;
};

export default function DashboardBlogNewPage() {
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
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content }),
        });

        const result: ApiResponse = await response.json();

        if (result.success && result.data) {
            navigate(`/blog/${result.data.id}`);
        } else {
            setError(result.error || "Failed to create post");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{t.blog.newPost}</CardTitle>
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
