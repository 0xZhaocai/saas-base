// app/components/navbar.tsx
// 顶部导航栏组件 - 匹配原型设计

import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useTheme, useTranslation, useUser } from "@/lib/app-context";
import { authClient } from "@/lib/auth.client";
import { type Language, LANGUAGE_NAMES } from "@/lib/i18n";
import { APP_CONFIG } from "@config";
import { getUserAvatarUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons - 使用统一的 Icons 组件
import { Icons } from "@/components/icons";

// 语言简写显示
const LANG_SHORT: Record<Language, string> = {
    en: 'EN',
    'zh-CN': '简',
    'zh-TW': '繁',
    ja: 'JA',
    fr: 'FR',
    ko: '한',
    es: 'ES',
};

export function Navbar() {
    const location = useLocation();
    const { t, language, setLanguage } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { user, setUser } = useUser(); // 从全局 Context 获取用户信息
    const [isLangMenuOpen, setLangMenuOpen] = useState(false);
    const [isThemeMenuOpen, setThemeMenuOpen] = useState(false);

    // 获取用户名首字母
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // 获取主题图标
    const ThemeIcon = theme === 'light' ? Icons.Sun : theme === 'dark' ? Icons.Moon : Icons.Monitor;

    const handleLogout = async () => {
        await authClient.signOut();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <Icons.LayoutGrid className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-foreground">
                            {APP_CONFIG.name}
                        </span>
                    </Link>

                    {/* Center Nav Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors ${location.pathname === '/'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t.nav.home}
                        </Link>
                        <Link
                            to="/blog"
                            className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/blog')
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t.nav.blog}
                        </Link>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3">
                        {/* Theme Dropdown - 自定义实现，避免 Radix UI 在 React 19 SSR 下的兼容性问题 */}
                        <div className="relative">
                            <button
                                onClick={() => setThemeMenuOpen(!isThemeMenuOpen)}
                                className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                title={t.common.theme}
                            >
                                <ThemeIcon />
                            </button>

                            {isThemeMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setThemeMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-36 bg-popover rounded-lg shadow-xl border border-border py-1 z-20 overflow-hidden">
                                        <button
                                            onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center justify-between ${theme === 'light' ? 'text-primary font-medium' : 'text-popover-foreground'}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Icons.Sun className="size-4" />
                                                {t.common.themeLight}
                                            </span>
                                            {theme === 'light' && <Icons.Check className="text-primary size-4" />}
                                        </button>
                                        <button
                                            onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center justify-between ${theme === 'dark' ? 'text-primary font-medium' : 'text-popover-foreground'}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Icons.Moon className="size-4" />
                                                {t.common.themeDark}
                                            </span>
                                            {theme === 'dark' && <Icons.Check className="text-primary size-4" />}
                                        </button>
                                        <button
                                            onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center justify-between ${theme === 'system' ? 'text-primary font-medium' : 'text-popover-foreground'}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Icons.Monitor className="size-4" />
                                                {t.common.themeSystem}
                                            </span>
                                            {theme === 'system' && <Icons.Check className="text-primary size-4" />}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Language Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setLangMenuOpen(!isLangMenuOpen)}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <Icons.Globe className="w-4 h-4" />
                                <span className="text-sm font-medium">{LANG_SHORT[language]}</span>
                            </button>

                            {isLangMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-36 bg-popover rounded-lg shadow-xl border border-border py-1 z-20 overflow-hidden">
                                        {(['en', 'fr', 'es', 'zh-CN', 'zh-TW', 'ja', 'ko'] as Language[]).map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => { setLanguage(lang); setLangMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center justify-between ${language === lang ? 'text-primary font-medium' : 'text-popover-foreground'
                                                    }`}
                                            >
                                                {LANGUAGE_NAMES[lang]}
                                                {language === lang && <Icons.Check className="text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-5 w-px bg-border" />

                        {/* Auth */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        <img
                                            src={getUserAvatarUrl(user)}
                                            alt={user.name}
                                            className="h-7 w-7 rounded-full"
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="cursor-pointer">
                                            {t.common.profile}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-destructive cursor-pointer"
                                    >
                                        {t.nav.logout}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link to="/login">
                                <Button size="sm" className="h-8 px-4">
                                    {t.nav.login}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
