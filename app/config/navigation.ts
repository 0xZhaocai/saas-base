// app/config/navigation.ts
// 兼容层 - 从新位置重新导出导航配置
// TODO: 后续迁移完成后删除此文件，直接使用 @config

export { navigationConfig } from "../../config/navigation";
export type { NavItem, NavGroup, NavigationConfig } from "../../config/navigation";
