// app/routes/verify-email.tsx
// 邮箱验证页面

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "@/lib/app-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function meta() {
    return [
        { title: "Verify Email | Nex Base SaaS" },
        { name: "description", content: "Verify your email address" },
    ];
}

export default function VerifyEmailPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');
    const [token, setToken] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const verifyToken = searchParams.get("token");
        if (!verifyToken) {
            setStatus('failed');
            return;
        }
        setToken(verifyToken);
        verifyEmail(verifyToken);
    }, [searchParams]);

    const verifyEmail = async (token: string) => {
        const callback = searchParams.get("callbackURL") || "/dashboard";
        try {
            // Better-Auth 的验证端点是 GET 请求
            const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok || response.status === 302) {
                // 验证成功（200 OK 或 302 重定向都表示成功）
                setStatus('success');
                // 不使用 toast，直接在页面显示成功信息
                // 开始倒计时
            } else {
                setStatus('failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('failed');
        }
    };

    // 成功后的倒计时逻辑
    useEffect(() => {
        if (status === 'success') {
            const callback = searchParams.get("callbackURL") || "/dashboard";
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        // 使用 window.location.href 强制刷新，确保 loader 重新执行
                        window.location.href = `${callback}?verified=1`;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [status, searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <Navbar />

            <div className="flex items-center justify-center px-4 py-16 sm:py-24">
                <Card className="w-full max-w-md shadow-xl border-border">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t.verifyEmail.title}
                        </CardTitle>
                        <CardDescription>
                            {status === 'checking' && t.verifyEmail.checking}
                            {status === 'success' && t.verifyEmail.success}
                            {status === 'failed' && t.verifyEmail.failed}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {status === 'checking' && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                                    ✅ {t.verifyEmail.success}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t.verifyEmail.successMessage}
                                </p>
                                <p className="text-xs text-muted-foreground mt-4">
                                    {t.verifyEmail.redirecting} {countdown} {t.verifyEmail.seconds}...
                                </p>
                            </div>
                        )}

                        {status === 'failed' && (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <p className="text-sm text-destructive mb-4">
                                    {t.verifyEmail.failed}
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/login')}
                                >
                                    {t.forgotPassword.backToLogin}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
