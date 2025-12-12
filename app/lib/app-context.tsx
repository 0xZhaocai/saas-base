import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Language, type I18nContent, TRANSLATIONS, getBrowserLanguage } from "./i18n";
import { authClient } from "./auth.client";

export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: string;
}

interface AppContextProps {
    // 语言
    language: Language;
    setLanguage: (lang: Language) => void;
    t: I18nContent;

    // 主题
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    resolvedTheme: 'light' | 'dark';

    // 用户信息
    user: User | null;
    setUser: (user: User | null) => void;
    updateUser: (updates: Partial<User>) => void;
    userLoading: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// 从 localStorage 获取保存的值
function getStoredValue<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch {
        return fallback;
    }
}

export function AppProvider({ children }: { children: ReactNode }) {
    // 语言状态
    const [language, setLanguageState] = useState<Language>('en');

    // 主题状态
    const [theme, setThemeState] = useState<ThemeMode>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // 用户状态
    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(true);

    // 初始化：从 localStorage 读取主题和语言
    useEffect(() => {
        const storedLang = getStoredValue<Language>('app-language', getBrowserLanguage());
        const storedTheme = getStoredValue<ThemeMode>('app-theme', 'system');
        setLanguageState(storedLang);
        setThemeState(storedTheme);
    }, []);

    // 初始化：自动获取用户 session
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const session = await authClient.getSession();
                if (session?.data?.user) {
                    const u = session.data.user;
                    setUser({
                        id: u.id,
                        name: u.name || '',
                        email: u.email,
                        image: u.image,
                        emailVerified: u.emailVerified || false,
                        createdAt: u.createdAt?.toString() || new Date().toISOString(),
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user session:', error);
            } finally {
                setUserLoading(false);
            }
        };
        fetchUser();
    }, []);

    // 主题切换逻辑
    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (mode: ThemeMode) => {
            root.classList.remove('light', 'dark');

            let resolved: 'light' | 'dark';
            if (mode === 'system') {
                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                resolved = mode;
            }

            root.classList.add(resolved);
            setResolvedTheme(resolved);
        };

        applyTheme(theme);

        // 监听系统主题变化
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => applyTheme('system');
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [theme]);

    // 设置语言
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', JSON.stringify(lang));
        try {
            document.documentElement.setAttribute('lang', lang);
        } catch {
            // ignore
        }
        // 同步到 cookie，方便服务端邮件等场景读取
        try {
            document.cookie = `app-language=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        } catch {
            // ignore
        }
    };

    // 设置主题
    const setTheme = (mode: ThemeMode) => {
        setThemeState(mode);
        localStorage.setItem('app-theme', JSON.stringify(mode));
    };

    // 更新用户信息（部分更新）
    const updateUser = (updates: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...updates } : null);
    };

    // 当前翻译
    const t = TRANSLATIONS[language];

    return (
        <AppContext.Provider value={{
            language,
            setLanguage,
            t,
            theme,
            setTheme,
            resolvedTheme,
            user,
            setUser,
            updateUser,
            userLoading,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within AppProvider");
    }
    return context;
}

// 便捷 hook：仅获取翻译
export function useTranslation() {
    const { t, language, setLanguage } = useApp();
    return { t, language, setLanguage };
}

// 便捷 hook：仅获取主题
export function useTheme() {
    const { theme, setTheme, resolvedTheme } = useApp();
    return { theme, setTheme, resolvedTheme };
}

// 便捷 hook：仅获取用户信息
export function useUser() {
    const { user, setUser, updateUser, userLoading } = useApp();
    return { user, setUser, updateUser, userLoading };
}
