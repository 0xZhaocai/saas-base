// app/routes/dashboard.index.tsx
// 仪表盘首页

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { useTranslation } from "@/lib/app-context";
import { authClient } from "@/lib/auth.client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";

// Context type from layout
interface DashboardContext {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        emailVerified?: boolean;
    };
}

// Icons
const Icons = {
    DollarSign: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    ),
    Users: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    TrendingUp: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
    ),
    Check: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5" /></svg>
    ),
    Mail: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
    ),
    X: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    ),
};

export function meta() {
    return [
        { title: `Dashboard | ${APP_CONFIG.name}` },
        { name: "description", content: "Manage your account and applications" },
    ];
}

// Stat Card Component
function StatCard({
    title,
    value,
    change,
    icon: Icon
}: {
    title: string;
    value: string;
    change: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    const isPositive = change.startsWith('+');
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className={`text-xs flex items-center gap-1 mt-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    <Icons.TrendingUp className="h-3 w-3" />
                    {change}
                </p>
            </CardContent>
        </Card>
    );
}

export default function DashboardIndex() {
    const { t } = useTranslation();
    const { user } = useOutletContext<DashboardContext>();
    const [showVerificationBanner, setShowVerificationBanner] = useState(true);
    const [resendingVerification, setResendingVerification] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    // Dynamic document title based on language
    useEffect(() => {
        document.title = `${t.pageTitles.dashboard} | ${APP_CONFIG.name}`;
    }, [t]);

    // 重发验证邮件（使用 Better-Auth 客户端 API）
    const handleResendVerification = async () => {
        if (!user?.email) return;

        setResendingVerification(true);
        try {
            // 使用 Better-Auth 官方客户端 API
            await authClient.sendVerificationEmail({
                email: user.email,
                callbackURL: "/dashboard", // 验证成功后跳转的页面
            });

            setVerificationSent(true);
            // 3秒后隐藏成功消息
            setTimeout(() => {
                setVerificationSent(false);
            }, 3000);
        } catch (err) {
            console.error("Failed to resend verification:", err);
        } finally {
            setResendingVerification(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {t.dashboard.title}
                </h1>
                <p className="text-muted-foreground">
                    {t.dashboard.welcome}, <span className="text-primary font-semibold">{user?.name || 'Guest'}</span>.
                </p>
            </div>

            {/* Email Verification Banner */}
            {user && !user.emailVerified && showVerificationBanner && (
                <div className="relative rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
                    <button
                        onClick={() => setShowVerificationBanner(false)}
                        className="absolute top-3 right-3 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                        aria-label="Close"
                    >
                        <Icons.X />
                    </button>

                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                                <Icons.Mail className="text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>

                        <div className="flex-1 pr-8">
                            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                {t.profile.emailNotVerified}
                            </h3>
                            <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
                                {t.verifyEmail.checkInbox}
                            </p>

                            <div className="mt-3 flex items-center gap-3">
                                <Button
                                    onClick={handleResendVerification}
                                    disabled={resendingVerification || verificationSent}
                                    size="sm"
                                    variant="outline"
                                    className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                                >
                                    {resendingVerification
                                        ? t.common.loading
                                        : t.profile.resendVerification}
                                </Button>

                                {verificationSent && (
                                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <Icons.Check className="w-4 h-4" />
                                        {t.profile.verificationSent}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title={t.dashboard.statRevenue}
                    value="$124,500.00"
                    change="+12.5%"
                    icon={Icons.DollarSign}
                />
                <StatCard
                    title={t.dashboard.statUsers}
                    value="8,432"
                    change="+5.2%"
                    icon={Icons.Users}
                />
                <StatCard
                    title={t.dashboard.statGrowth}
                    value="24.3%"
                    change="+2.1%"
                    icon={Icons.TrendingUp}
                />
            </div>

            {/* Quick Start */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.dashboard.quickStart}</CardTitle>
                    <CardDescription>
                        Complete these steps to set up your app
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Step 1 - Completed */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                <Icons.Check />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">
                                    {t.dashboard.steps.createAccount.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t.dashboard.steps.createAccount.desc}
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <span className="text-sm font-medium">2</span>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">
                                    {t.dashboard.steps.configProject.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t.dashboard.steps.configProject.desc}
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <span className="text-sm font-medium">3</span>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">
                                    {t.dashboard.steps.inviteTeam.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t.dashboard.steps.inviteTeam.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.dashboard.recentActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-1/4" />
                                    <div className="h-3 bg-muted rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
