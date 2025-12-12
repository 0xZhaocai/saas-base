// app/components/app-sidebar.tsx
// 应用侧边栏 - 使用官方 shadcn/ui Sidebar 组件

import { Link, useLocation } from "react-router";
import { Icons } from "@/components/icons";
import { navigationConfig } from "@/config/navigation";
import { APP_CONFIG } from "@config";
import { getUserAvatarUrl } from "@/lib/utils";
import { authClient } from "@/lib/auth.client";
import { type Language, LANGUAGE_NAMES } from "@/lib/i18n";
import { type ThemeMode } from "@/lib/app-context";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
    t: any;
    // Theme
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    // Language
    language: Language;
    setLanguage: (lang: Language) => void;
}

export function AppSidebar({ user, t, theme, setTheme, language, setLanguage }: AppSidebarProps) {
    const location = useLocation();

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/";

    };

    // 根据 i18n 键获取标签文本
    const getLabel = (key: string) => {
        const keys = key.split('.');
        let value: any = t;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    return (
        <Sidebar collapsible="icon">
            {/* Logo Header */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Link to="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Icons.LayoutGrid className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {APP_CONFIG.name}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Navigation Content */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationConfig.items.map((item) => {
                                const Icon = Icons[item.icon as keyof typeof Icons];
                                const isActive = location.pathname === item.to;
                                return (
                                    <SidebarMenuItem key={item.to}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={getLabel(item.label)}
                                        >
                                            <Link to={item.to}>
                                                <Icon />
                                                <span>{getLabel(item.label)}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* User Footer */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <img
                                        src={getUserAvatarUrl(user)}
                                        alt={user.name}
                                        className="size-8 rounded-lg object-cover"
                                    />
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {user.name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {user.email}
                                        </span>
                                    </div>
                                    <Icons.ChevronUp className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-56"
                                align="start"
                            >
                                {/* Profile */}
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link to="/profile">
                                        <Icons.User className="mr-2 size-4" />
                                        {t.common.profile}
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Theme Submenu */}
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        {theme === 'light' ? <Icons.Sun className="mr-2 size-4" /> :
                                            theme === 'dark' ? <Icons.Moon className="mr-2 size-4" /> :
                                                <Icons.Monitor className="mr-2 size-4" />}
                                        {t.common.theme}
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
                                                <Icons.Sun className="mr-2 size-4" />
                                                {t.common.themeLight}
                                                {theme === 'light' && <Icons.Check className="ml-auto size-4" />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
                                                <Icons.Moon className="mr-2 size-4" />
                                                {t.common.themeDark}
                                                {theme === 'dark' && <Icons.Check className="ml-auto size-4" />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
                                                <Icons.Monitor className="mr-2 size-4" />
                                                {t.common.themeSystem}
                                                {theme === 'system' && <Icons.Check className="ml-auto size-4" />}
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>

                                {/* Language Submenu */}
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Icons.Globe className="mr-2 size-4" />
                                        {t.common.language}
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            {(['en', 'fr', 'es', 'zh-CN', 'zh-TW', 'ja', 'ko'] as Language[]).map(lang => (
                                                <DropdownMenuItem
                                                    key={lang}
                                                    onClick={() => setLanguage(lang)}
                                                    className="cursor-pointer"
                                                >
                                                    {LANGUAGE_NAMES[lang]}
                                                    {language === lang && <Icons.Check className="ml-auto size-4" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>

                                <DropdownMenuSeparator />

                                {/* Logout */}
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="cursor-pointer"
                                >
                                    <Icons.LogOut className="mr-2 size-4" />
                                    {t.nav.logout}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            {/* Rail for toggling sidebar */}
            <SidebarRail />
        </Sidebar>
    );
}
