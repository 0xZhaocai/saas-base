// app/lib/config.ts
// 兼容层 - 从新位置重新导出配置
// TODO: 后续迁移完成后删除此文件，直接使用 @config

export {
    APP_CONFIG,
    getPageTitle,
    getCopyrightText,
} from "../../config/app";

export type { AppConfig } from "../../config/app";
