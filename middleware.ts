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

function pathWithLocale(req: NextRequest, locale: string) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return url;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = SUPPORTED_LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const cookieLocale = req.cookies.get("locale")?.value;
  const detected =
    cookieLocale && isSupportedLocale(cookieLocale) ? cookieLocale : getLocaleFromHeader(req);

  // 预留的其他语言前缀（如 /ja/...）：替换为检测到的 locale
  const first = pathname.split("/")[1] ?? "";
  if (/^[a-zA-Z]{2}$/.test(first)) {
    const rest = pathname.slice(first.length + 1);
    const url = req.nextUrl.clone();
    url.pathname = `/${detected}${rest}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(pathWithLocale(req, detected));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};