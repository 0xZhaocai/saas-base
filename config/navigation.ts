// config/navigation.ts
// 导航配置 - 添加新菜单项时只需修改此文件

/**
 * 导航项配置
 */
export interface NavItem {
    /** 路由路径 */
    to: string;
    /** 图标名称（对应 Icons 组件） */
    icon: string;
    /** 国际化标签键 */
    label: string;
    /** 是否在移动端显示（默认 true） */
    showOnMobile?: boolean;
    /** 是否在桌面端显示（默认 true） */
    showOnDesktop?: boolean;
    /** 权限要求（可选，未来扩展） */
    permission?: string;
}

/**
 * 导航分组配置
 */
export interface NavGroup {
    /** 分组标题（可选） */
    title?: string;
    /** 分组内的导航项 */
    items: NavItem[];
}

/**
 * 主导航配置
 * 
 * 使用指南：
 * 1. 添加新菜单项：在 items 数组中添加新对象
 * 2. icon 值必须是 Icons 组件中已定义的图标名称
 * 3. label 值是 i18n 翻译键（如 "nav.dashboard"）
 * 
 * 示例：添加"分析"页面
 * { to: "/analytics", icon: "BarChart", label: "nav.analytics" }
 */
export const navigationConfig: NavGroup = {
    items: [
        {
            to: "/dashboard",
            icon: "LayoutGrid",
            label: "nav.dashboard",
        },
        {
            to: "/dashboard/blog",
            icon: "FileText",
            label: "nav.myPosts",
        },
        // Profile 已移至用户头像下拉菜单
        // 在此添加更多业务模块菜单...
    ],
};

// 导出类型
export type NavigationConfig = typeof navigationConfig;
