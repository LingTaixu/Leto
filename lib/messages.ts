import type { Locale } from "@/lib/locales";

// en 模块（zh 同构）
import enCommon from "@/messages/en/common.json";
import enHome from "@/messages/en/home.json";
import enBlog from "@/messages/en/blog.json";
import enWeb3 from "@/messages/en/web3.json";
import enNotary from "@/messages/en/notary.json";
import enTransfer from "@/messages/en/transfer.json";
import enKline from "@/messages/en/kline.json";
import enAbout from "@/messages/en/about.json";

// zh 模块
import zhCommon from "@/messages/zh/common.json";
import zhHome from "@/messages/zh/home.json";
import zhBlog from "@/messages/zh/blog.json";
import zhWeb3 from "@/messages/zh/web3.json";
import zhNotary from "@/messages/zh/notary.json";
import zhTransfer from "@/messages/zh/transfer.json";
import zhKline from "@/messages/zh/kline.json";
import zhAbout from "@/messages/zh/about.json";

/** en 模块合并定义消息树结构（zh 模块须同构） */
export type Messages = typeof enCommon &
  typeof enHome &
  typeof enBlog &
  typeof enWeb3 &
  typeof enNotary &
  typeof enTransfer &
  typeof enKline &
  typeof enAbout;

export type MessageKey = DeepKeys<Messages>;

type DeepKeys<T> = T extends string
  ? never
  : {
      [K in keyof T]-?: K extends string
        ? `${K}` | `${K}.${DeepKeys<T[K]>}`
        : never;
    }[keyof T];

const MESSAGES: Record<string, Messages> = {
  en: {
    ...enCommon,
    ...enHome,
    ...enBlog,
    ...enWeb3,
    ...enNotary,
    ...enTransfer,
    ...enKline,
    ...enAbout,
  },
  zh: {
    ...zhCommon,
    ...zhHome,
    ...zhBlog,
    ...zhWeb3,
    ...zhNotary,
    ...zhTransfer,
    ...zhKline,
    ...zhAbout,
  },
};

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