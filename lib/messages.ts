import type { Locale } from "@/lib/locales";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

/** en.json 定义消息树结构（zh 必须同构） */
export type Messages = typeof en;

export type MessageKey = DeepKeys<Messages>;

type DeepKeys<T> = T extends string
  ? never
  : {
      [K in keyof T]-?: K extends string
        ? `${K}` | `${K}.${DeepKeys<T[K]>}`
        : never;
    }[keyof T];

const MESSAGES: Record<string, Messages> = { en, zh };

function deepLookup(dict: unknown, key: string): unknown {
  let cur: unknown = dict;
  for (const part of key.split(".")) {
    if (cur && typeof cur === "object" && part in cur) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

/** server-safe：按 locale 取消息，缺失回退 zh */
export function resolveMessage(locale: Locale, key: string): string {
  const dict = MESSAGES[locale] ?? MESSAGES.zh;
  const direct = deepLookup(dict, key);
  if (typeof direct === "string") return direct;
  const fallback = deepLookup(MESSAGES.zh, key);
  return typeof fallback === "string" ? fallback : key;
}

/** server-safe：取数组/对象结构体消息，缺失回退 zh */
export function resolveRaw(locale: Locale, key: string): unknown {
  const dict = MESSAGES[locale] ?? MESSAGES.zh;
  const direct = deepLookup(dict, key);
  if (direct !== undefined) return direct;
  return deepLookup(MESSAGES.zh, key);
}