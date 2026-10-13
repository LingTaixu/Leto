import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "@/lib/locales";

function getLocaleFromHeader(req: NextRequest): string {
  const accept = req.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const tag = part.trim().split(";")[0]?.toLowerCase();
    if (!tag) continue;
    const base = tag.split("-")[0];
    if (isSupportedLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/**
 * 旧路由 → 桌面深链映射（rest 为去掉 locale 前缀后的路径）
 * /blog/<slug> → ?app=blog&slug=<slug>；/web3/kline → ?app=kline …
 */
function mapLegacy(rest: string): { path: string; search: string } | null {
  const blog = /^\/blog(?:\/([^/]+?))?\/?$/.exec(rest);
  if (blog) {
    return blog[1]
      ? { path: "", search: `?app=blog&slug=${encodeURIComponent(blog[1])}` }
      : { path: "", search: "?app=blog" };
  }
  if (/^\/about\/?$/.test(rest)) return { path: "", search: "?app=about" };
  const web3 = /^\/web3\/(kline|notary|transfer)\/?$/.exec(rest);
  if (web3) return { path: "", search: `?app=${web3[1]}` };
  if (/^\/web3\/?$/.test(rest)) return { path: "", search: "" };
  return null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const localePrefix = SUPPORTED_LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  let locale: string;
  let rest: string;
  if (localePrefix) {
    locale = localePrefix;
    rest = pathname.slice(localePrefix.length + 1);
  } else {
    const cookieLocale = req.cookies.get("locale")?.value;
    locale =
      cookieLocale && isSupportedLocale(cookieLocale)
        ? cookieLocale
        : getLocaleFromHeader(req);

    // 预留的其他语言前缀（如 /ja/...）：替换为检测到的 locale
    const first = pathname.split("/")[1] ?? "";
    rest = /^[a-zA-Z]{2}$/.test(first) ? pathname.slice(first.length + 1) : pathname;
  }

  // 旧路由重定向到桌面深链（保留原有其他 query）
  const legacy = mapLegacy(rest);
  if (legacy) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${legacy.path}`;
    const params = new URLSearchParams(req.nextUrl.search);
    for (const [k, v] of new URLSearchParams(legacy.search)) {
      params.set(k, v);
    }
    url.search = params.toString() ? `?${params.toString()}` : "";
    return NextResponse.redirect(url);
  }

  if (localePrefix) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${rest === "/" ? "" : rest}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
