// app/routes/auth.login.tsx
// 登录页面 - 支持邮箱密码、Google OAuth

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { signIn, authClient } from "@/lib/auth.client";
import { useTranslation } from "@/lib/app-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";

export function meta() {
    return [
        { title: `Login | ${APP_CONFIG.name}` },
        { name: "description", content: "Log in to your account" },
    ];
}

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [resendingVerification, setResendingVerification] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    // Dynamic document title based on language
    useEffect(() => {
        document.title = `${t.pageTitles.login} | ${APP_CONFIG.name}`;
    }, [t]);

    // Map error messages to i18n
    const getErrorMessage = (errorMessage: string): string => {
        const lowerError = errorMessage.toLowerCase();
        if (lowerError.includes("email not verified") || lowerError.includes("not verified")) {
            setShowResendVerification(true);
            return t.errors.emailNotVerified;
        }
        if (
            lowerError.includes("not found") ||
            lowerError.includes("no user") ||
            lowerError.includes("no account") ||
            lowerError.includes("does not exist")
        ) {
            return t.errors.userNotFound;
        }
        if (lowerError.includes("invalid") || lowerError.includes("credentials") || lowerError.includes("password")) {
            return t.errors.invalidCredentials;
        }
        return t.errors.unknownError;
    };

    // 邮箱密码登录
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setShowResendVerification(false);
        setVerificationSent(false);
        setLoading(true);

        try {
            // 先检查邮箱是否存在，避免未知用户时提示为密码错误
            const existsRes = await fetch(`/api/user/exists?email=${encodeURIComponent(email)}`);
            if (existsRes.ok) {
                const data = (await existsRes.json()) as { exists?: boolean };
                if (data.exists === false) {
                    setError(t.errors.userNotFound);
                    return;
                }
            }

            const result = await signIn.email({
                email,
                password,
            });

            if (result.error) {
                const message = result.error.message || "Login failed";
                setError(getErrorMessage(message));
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(t.errors.networkError);
        } finally {
            setLoading(false);
        }
    };

    // Google OAuth 登录
    const handleGoogleLogin = async () => {
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
            });
        } catch (err) {
            setError(t.errors.networkError);
        }
    };

    // 重发验证邮件（使用 Better-Auth 客户端 API）
    const handleResendVerification = async () => {
        setResendingVerification(true);
        try {
            // 使用 Better-Auth 官方客户端 API
            await authClient.sendVerificationEmail({
                email: email,
                callbackURL: "/dashboard", // 验证成功后跳转的页面
            });
            setVerificationSent(true);
            setShowResendVerification(false);
        } catch (err) {
            console.error("Failed to send verification email:", err);
            // 仍显示成功以避免信息泄露
            setVerificationSent(true);
            setShowResendVerification(false);
        } finally {
            setResendingVerification(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <Navbar />

            <div className="flex items-center justify-center px-4 py-16 sm:py-24">
                <Card className="w-full max-w-md shadow-xl border-border">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t.auth.welcomeBack}
                        </CardTitle>
                        <CardDescription>
                            {t.auth.enterCredentials}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Google OAuth 登录 */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleLogin}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {t.auth.loginWithGoogle}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    {t.auth.orWithEmail}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                                {showResendVerification && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 ml-2 h-auto text-destructive underline"
                                        onClick={handleResendVerification}
                                        disabled={resendingVerification}
                                    >
                                        {resendingVerification ? t.common.loading : t.profile.resendVerification}
                                    </Button>
                                )}
                            </div>
                        )}

                        {verificationSent && (
                            <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
                                {t.profile.verificationSent}
                            </div>
                        )}

                        {/* 邮箱密码登录表单 */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t.auth.email}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">{t.auth.password}</Label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        {t.auth.forgotPassword}
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? t.common.loading : t.auth.loginBtn}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-2">
                        <p className="text-sm text-center text-muted-foreground">
                            {t.auth.noAccount}{" "}
                            <Link
                                to="/register"
                                className="text-primary font-medium hover:underline"
                            >
                                {t.auth.register}
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
