// app/routes/auth.forgot-password.tsx
// 忘记密码页面

import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "@/lib/app-context";
import { authClient } from "@/lib/auth.client";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";

export function meta() {
    return [
        { title: `Forgot Password | ${APP_CONFIG.name}` },
        { name: "description", content: "Reset your password" },
    ];
}

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Dynamic document title based on language
    useEffect(() => {
        document.title = `${t.pageTitles.forgotPassword} | ${APP_CONFIG.name}`;
    }, [t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 先校验邮箱是否存在，避免误发/误提示
            const existsRes = await fetch(`/api/user/exists?email=${encodeURIComponent(email)}`);
            if (existsRes.ok) {
                const data = await existsRes.json() as { exists?: boolean };
                if (data.exists === false) {
                    setError(t.errors.userNotFound);
                    return;
                }
            }

            // 使用 Better-Auth 客户端发送密码重置请求
            const { data, error } = await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            });

            if (error) {
                // 翻译错误消息
                const errorMessage = error.message || "";
                if (errorMessage.includes("not found") || errorMessage.includes("User not found")) {
                    setError(t.errors.userNotFound);
                } else if (errorMessage.includes("Invalid")) {
                    setError(t.errors.emailInvalid);
                } else {
                    setError(t.errors.resetLinkFailed);
                }
            } else {
                setSuccess(true);
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            setError(t.errors.networkError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <Navbar />

            <div className="flex items-center justify-center px-4 py-16 sm:py-24">
                <Card className="w-full max-w-md shadow-xl border-border">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t.forgotPassword.title}
                        </CardTitle>
                        <CardDescription>
                            {success
                                ? t.forgotPassword.emailSent
                                : t.forgotPassword.subtitle}
                        </CardDescription>
                    </CardHeader>

                    {success ? (
                        <CardContent className="space-y-4">
                            <div className="rounded-lg bg-primary/10 p-4 text-center">
                                <p className="text-sm text-primary font-medium">
                                    ✉️ {t.forgotPassword.emailSent}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {t.verifyEmail.checkInbox}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link to="/login">
                                    {t.forgotPassword.backToLogin}
                                </Link>
                            </Button>
                        </CardContent>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t.auth.email}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t.auth.emailPlaceholder}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        autoFocus
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4 mt-6">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? t.common.loading : t.forgotPassword.sendLink}
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    asChild
                                >
                                    <Link to="/login">
                                        {t.forgotPassword.backToLogin}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}
