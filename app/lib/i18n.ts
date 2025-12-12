// app/lib/i18n.ts
// 兼容层 - 从新目录结构重新导出
// TODO: 后续迁移完成后，可将此文件删除，直接使用 @/lib/i18n/ 导入

export {
    // 类型
    type Language,
    type I18nContent,
    // 常量
    TRANSLATIONS,
    LANGUAGE_NAMES,
    // 函数
    getBrowserLanguage,
    getTranslation,
} from './i18n/index';
