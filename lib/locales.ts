/** 支持的语言与开放联合（预留其他语言：新增前缀 + 消息文件即可） */
export const SUPPORTED_LOCALES = ["zh", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type Locale = SupportedLocale | (string & {});

export const DEFAULT_LOCALE: Locale = "zh";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}