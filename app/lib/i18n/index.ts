// app/lib/i18n/index.ts
// i18n 统一导出入口

// 类型导出
export type { Language, I18nContent } from './types';
export { LANGUAGE_NAMES, getBrowserLanguage } from './types';

// 语言翻译导出
import { en } from './en';
import { zhCN } from './zh-CN';
import { zhTW } from './zh-TW';
import { ja } from './ja';
import type { Language, I18nContent } from './types';

/**
 * 所有翻译
 */
export const TRANSLATIONS: Record<Language, I18nContent> = {
    en,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    ja,
};

/**
 * 获取指定语言的翻译
 */
export function getTranslation(lang: Language): I18nContent {
    return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
