"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Marquee } from "@/components/Marquee";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import type { Article } from "@/lib/posts";
import { DesktopDataProvider } from "./DesktopData";
import { Taskbar } from "./Taskbar";
import { Window } from "./Window";
import {
  TASKBAR_H,
  WindowManagerProvider,
  useWindowManager,
  type DesktopArea,
} from "./WindowManager";
import { APPS, APP_ORDER, isAppId } from "./registry";

/** 桌面壁纸技能跑马灯（原首页 Marquee 并入桌面装饰） */
const SKILLS = [
  "React",
  "Next.js",
  "Vue 3",
  "TypeScript",
  "Tailwind CSS",
  "Web3",
  "Ethereum",
  "Hyperliquid",
  "Polymarket",
  "DEX",
  "EVM",
  "React Query",
  "Wagmi",
  "Three.js",
];

const MOBILE_QUERY = "(max-width: 1023px), (pointer: coarse)";

/**
 * 桌面入口（client shell）
 * server 页面注入文章数据；本组件负责壁纸/图标/窗口层/任务栏与深链
 */
export function Desktop({
  locale,
  articles,
}: {
  locale: Locale;
  articles: Article[];
}) {
  const [area, setArea] = useState<DesktopArea>({ w: 1024, h: 640 });
  const [mobile, setMobile] = useState(false);
  const envRef = useRef({ area, mobile });

  // 视口 / 移动端判定放在挂载后，避免 hydration 不一致；
  // envRef 在 layout effect 中同步，保证子组件 passive effect（深链唤起）读到最新值
  useLayoutEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => {
      const next = {
        area: {
          w: window.innerWidth,
          h: Math.max(240, window.innerHeight - TASKBAR_H),
        },
        mobile: mql.matches,
      };
      envRef.current = next;
      setArea(next.area);
      setMobile(next.mobile);
    };
    update();
    window.addEventListener("resize", update);
    mql.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mql.removeEventListener("change", update);
    };
  }, []);

  return (
    <DesktopDataProvider value={{ locale, articles }}>
      <WindowManagerProvider envRef={envRef}>
        <div className="relative h-dvh w-full overflow-hidden bg-bg">
          {/* 壁纸：点阵 + 跑马灯装饰 + 品牌水印 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--border) 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute inset-x-0 top-0 z-0">
            <Marquee skills={SKILLS} />
          </div>
          <p
            aria-hidden="true"
            className="pointer-events-none absolute bottom-16 right-4 z-0 select-none font-display text-7xl font-extrabold tracking-tight text-text opacity-[0.06] lg:text-9xl"
          >
            LETO_OS
          </p>

          <DesktopLayer area={area} mobile={mobile} />
          <Taskbar />
        </div>
      </WindowManagerProvider>
    </DesktopDataProvider>
  );
}

/** 图标 + 窗口层（需在 WindowManagerProvider 内；不读 searchParams，可 SSR） */
function DesktopLayer({
  area,
  mobile,
}: {
  area: DesktopArea;
  mobile: boolean;
}) {
  const { t } = useI18n();
  const wm = useWindowManager();

  const launch = useCallback(
    (id: keyof typeof APPS) => wm.open(id),
    [wm],
  );

  return (
    <div
      className="absolute inset-x-0 top-0 overflow-hidden"
      style={{ height: area.h }}
    >
      {/* 深链/URL 同步（useSearchParams 隔离在 Suspense 内） */}
      <Suspense fallback={null}>
        <DeepLinkSync mobile={mobile} />
      </Suspense>
      {/* 桌面图标网格 */}
      <nav
        aria-label={t("desktop.iconGrid")}
        className="absolute left-3 top-14 z-[1] grid grid-flow-col grid-rows-3 gap-2 lg:left-6 lg:top-16 lg:gap-3"
      >
        {APP_ORDER.map((id) => {
          const app = APPS[id];
          const { Icon } = app;
          return (
            <button
              key={id}
              type="button"
              onClick={() => launch(id)}
              className="group flex w-16 cursor-pointer flex-col items-center gap-1 lg:w-20"
            >
              <span className="flex size-12 items-center justify-center border-[3px] border-border bg-surface text-text shadow-neu-sm transition-all duration-100 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-accent group-hover:shadow-neu group-active:translate-x-0.5 group-active:translate-y-0.5 group-active:shadow-none lg:size-14">
                <Icon className="size-6 lg:size-7" aria-hidden="true" />
              </span>
              <span className="max-w-full truncate border-2 border-transparent px-1 font-mono text-[10px] font-bold text-text group-hover:border-border group-hover:bg-surface lg:text-xs">
                {t(app.nameKey)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 窗口层（数组序即 z 序） */}
      {wm.windows.map((win, i) => (
        <WindowLayerItem
          key={win.id}
          id={win.id}
          zIndex={10 + i}
          mobile={mobile}
          area={area}
        />
      ))}
    </div>
  );
}

/** 深链唤起与焦点窗口 → URL 同步 */
function DeepLinkSync({ mobile }: { mobile: boolean }) {
  const wm = useWindowManager();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* 深链唤起：?app=<id>&slug=<slug>；未知 id 忽略（spec：桌面正常渲染）；
     无 app 参数时桌面端自动开欢迎窗口 */
  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    const app = searchParams.get("app");
    if (app === null) {
      if (!mobile) wm.open("home");
      return;
    }
    if (!isAppId(app)) return;
    const slug = searchParams.get("slug");
    wm.open(app, slug ? { slug } : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 焦点窗口 → URL 同步（合并保留 coin/interval 等应用参数） */
  const focusedId = wm.focusedId;
  const focusedWin = wm.windows.find((w) => w.id === focusedId);
  const focusedSlug = focusedWin?.params.slug ?? "";
  /* 首个窗口出现前不写 URL，避免与深链 OPEN 竞态清掉 ?app= */
  const hadWindowRef = useRef(false);
  useEffect(() => {
    if (!openedRef.current) return;
    if (focusedId) hadWindowRef.current = true;
    else if (!hadWindowRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (focusedId && focusedWin && !focusedWin.minimized) {
      params.set("app", focusedId);
      if (focusedId === "blog" && focusedSlug) {
        params.set("slug", focusedSlug);
      } else {
        params.delete("slug");
      }
    } else {
      params.delete("app");
      params.delete("slug");
    }
    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    if (target !== `${window.location.pathname}${window.location.search}`) {
      router.replace(target, { scroll: false });
    }
  }, [focusedId, focusedWin, focusedSlug, pathname, router]);

  return null;
}

/** 从 store 取最新窗口状态渲染（zIndex 由数组序决定，避免 z 无限增长越层） */
function WindowLayerItem({
  id,
  zIndex,
  mobile,
  area,
}: {
  id: keyof typeof APPS;
  zIndex: number;
  mobile: boolean;
  area: DesktopArea;
}) {
  const wm = useWindowManager();
  const win = wm.windows.find((w) => w.id === id);
  if (!win) return null;
  return (
    <Window
      win={{ ...win, z: zIndex - 10 }}
      focused={wm.focusedId === id}
      mobile={mobile}
      area={area}
      wm={wm}
    />
  );
}
