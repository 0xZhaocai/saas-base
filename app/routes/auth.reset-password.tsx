// app/routes/auth.reset-password.tsx
// 重置密码页面

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
        { title: `Reset Password | ${APP_CONFIG.name}` },
        { name: "description", content: "Set your new password" },
    ];
}

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // Dynamic document title based on language
    useEffect(() => {
        document.title = `${t.pageTitles.resetPassword} | ${APP_CONFIG.name}`;
    }, [t]);

    useEffect(() => {
        // 从 URL 获取重置令牌
        const tokenParam = searchParams.get("token");
        if (!tokenParam) {
            setError(t.errors.unknownError);
        } else {
            setToken(tokenParam);
        }
    }, [searchParams, t.errors.unknownError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError(t.errors.passwordMismatch);
            return;
        }

        if (password.length < 8) {
            setError(t.errors.passwordTooShort);
            return;
        }

        if (!token) {
            setError(t.errors.unknownError);
            return;
        }

        setLoading(true);

        try {
            // 使用 Better-Auth 客户端重置密码
            const { data, error } = await authClient.resetPassword({
                newPassword: password,
                token,
            });

            if (error) {
                const errorMessage = error.message || "";
                if (errorMessage.includes("token") || errorMessage.includes("expired")) {
                    setError(t.errors.unknownError);
                } else {
                    setError(t.errors.resetLinkFailed);
                }
            } else {
                // 重置成功，跳转到登录页
                navigate("/login", {
                    state: { message: t.forgotPassword.resetSuccess },
                });
            }
        } catch (err) {
            console.error("Reset password error:", err);
            setError(t.errors.networkError);
        } finally {
            setLoading(false);
        }
    };

    if (!token && error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
                <Navbar />
                <div className="flex items-center justify-center px-4 py-16 sm:py-24">
                    <Card className="w-full max-w-md shadow-xl border-border">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold text-destructive">
                                {t.verifyEmail.failed}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground">
                                {error}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate("/forgot-password")}
                            >
                                {t.forgotPassword.backToLogin}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <Navbar />

            <div className="flex items-center justify-center px-4 py-16 sm:py-24">
                <Card className="w-full max-w-md shadow-xl border-border">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t.forgotPassword.resetTitle}
                        </CardTitle>
                        <CardDescription>
                            {t.forgotPassword.resetSubtitle}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">{t.forgotPassword.newPassword}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t.auth.passwordPlaceholder}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder={t.auth.confirmPasswordPlaceholder}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="mt-6">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? t.common.loading : t.forgotPassword.resetBtn}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
