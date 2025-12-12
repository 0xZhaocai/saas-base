// app/routes/dashboard.layout.tsx
// 仪表盘布局 - 使用官方 shadcn/ui Sidebar 组件

import { useEffect } from "react";
import { Outlet } from "react-router";
import type { Route } from "./+types/dashboard.layout";
import { createAuth } from "@/lib/auth.server";
import { useTranslation, useUser, useTheme } from "@/lib/app-context";
import { APP_CONFIG } from "@config";
import { Button } from "@/components/ui/button";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

// 新的 Sidebar 系统
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";


export async function loader({ request, context }: Route.LoaderArgs) {
    const auth = createAuth(context.cloudflare.env);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        throw new Response(null, {
            status: 302,
            headers: { Location: "/login" },
        });
    }

    // Get latest user data from database instead of relying on session cache
    const env = context.cloudflare.env as Env;
    const db = drizzle(env.DB, { schema });

    const users = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, session.user.id))
        .limit(1);

    const latestUser = users[0];

    // If user not found in DB (shouldn't happen), fall back to session data
    const user = latestUser ? {
        id: latestUser.id,
        name: latestUser.name,
        email: latestUser.email,
        image: latestUser.image,
        emailVerified: latestUser.emailVerified,
        createdAt: latestUser.createdAt,
    } : session.user;

    return { user };
}

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
    const { t, language, setLanguage } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { user, setUser } = useUser();

    // 同步服务器数据到全局 Context
    useEffect(() => {
        if (loaderData.user) {
            setUser({
                ...loaderData.user,
                createdAt: loaderData.user.createdAt.toISOString(),
            });
        }
    }, [loaderData.user, setUser]);

    return (
        <SidebarProvider>
            {/* Sidebar - 桌面端和移动端统一处理 */}
            {user && (
                <AppSidebar
                    user={user}
                    t={t}
                    theme={theme}
                    setTheme={setTheme}
                    language={language}
                    setLanguage={setLanguage}
                />
            )}

            {/* Main Content Area */}
            <SidebarInset>
                {/* Top Header */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
                    {/* Sidebar Toggle (显示在所有尺寸) */}
                    <SidebarTrigger className="-ml-1" />

                    {/* Mobile: Brand */}
                    <div className="flex md:hidden items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <Icons.LayoutGrid className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-foreground">{APP_CONFIG.name}</span>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Right Controls - Feature Buttons */}
                    <div className="flex items-center gap-1">
                        {/* Search Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            title={t.common.search}
                        >
                            <Icons.Search />
                        </Button>

                        {/* Notifications Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground relative"
                            title={t.common.notifications}
                        >
                            <Icons.Bell />
                            {/* Notification badge example */}
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                        </Button>

                        {/* Help Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            title={t.common.help}
                        >
                            <Icons.HelpCircle />
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet context={{ user }} />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
