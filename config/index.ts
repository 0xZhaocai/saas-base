// config/index.ts
// 统一配置导出入口

export { APP_CONFIG, getPageTitle, getCopyrightText } from "./app";
export type { AppConfig } from "./app";

export { navigationConfig } from "./navigation";
export type { NavItem, NavGroup, NavigationConfig } from "./navigation";
