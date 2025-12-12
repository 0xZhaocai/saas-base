// config/app.ts
// 应用基础配置 - 基于此 SaaS 开发新项目时，只需修改此文件

/**
 * 应用基础配置
 * 修改这些值来自定义您的 SaaS 应用
 */
export const APP_CONFIG = {
    // =====================
    // 基础信息
    // =====================

    /** 应用名称 - 显示在导航栏、邮件、页面标题等处 */
    name: "Base SaaS",

    /** 应用简短名称 - 用于空间有限的地方 */
    shortName: "BaseSaaS",

    /** 应用描述 - 用于 SEO 和元数据 */
    description: "现代化的 SaaS 应用底座，基于 Cloudflare Workers 构建",

    /** 版权年份 */
    copyrightYear: "2025",

    // =====================
    // 品牌视觉
    // =====================

    /** Logo 配置 */
    logo: {
        /** Logo 图片路径 (放在 public 目录) */
        src: "/logo.svg",
        /** Logo 替代文本 */
        alt: "Base SaaS Logo",
        /** Logo 宽度 */
        width: 32,
        /** Logo 高度 */
        height: 32,
    },

    /** 主题色 (用于邮件等场景) */
    brandColors: {
        primary: "#3B82F6",      // 蓝色
        primaryDark: "#1D4ED8",  // 深蓝色
        background: "#0F172A",   // 深色背景
        text: "#F8FAFC",         // 浅色文字
    },

    // =====================
    // 链接配置
    // =====================

    /** 外部链接 */
    links: {
        /** 官网地址 */
        website: "https://example.com",
        /** 文档地址 */
        docs: "https://docs.example.com",
        /** 支持邮箱 */
        support: "support@example.com",
        /** 隐私政策 */
        privacy: "/privacy",
        /** 服务条款 */
        terms: "/terms",
    },

    // =====================
    // 功能开关
    // =====================

    features: {
        /** 是否启用邮箱验证 */
        emailVerification: false,
        /** 是否启用 Google 登录 */
        googleLogin: true,
        /** 是否启用 GitHub 登录 */
        githubLogin: true,
        /** 是否显示语言切换器 */
        languageSwitcher: true,
        /** 是否显示主题切换器 */
        themeSwitcher: true,
    },

    // =====================
    // 邮件配置
    // =====================

    email: {
        /** 邮件中显示的发件人名称 */
        senderName: "Base SaaS",
        /** 验证链接有效时间（小时） */
        verificationExpiry: 24,
        /** 密码重置链接有效时间（小时） */
        resetPasswordExpiry: 1,
    },

    // =====================
    // SEO 配置
    // =====================

    seo: {
        /** 默认页面标题后缀 */
        titleSuffix: " | Base SaaS",
        /** 默认 OG 图片 */
        ogImage: "/og-image.png",
        /** Twitter 账号 */
        twitterHandle: "@basesaas",
    },
} as const;

/**
 * 获取完整页面标题
 */
export function getPageTitle(title: string): string {
    return `${title}${APP_CONFIG.seo.titleSuffix}`;
}

/**
 * 获取版权文本
 */
export function getCopyrightText(): string {
    return `© ${APP_CONFIG.copyrightYear} ${APP_CONFIG.name}. All rights reserved.`;
}

// 导出类型
export type AppConfig = typeof APP_CONFIG;
