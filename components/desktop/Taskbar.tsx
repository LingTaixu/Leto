"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback, useSyncExternalStore } from "react";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { useI18n } from "@/lib/i18n";
import { APPS } from "./registry";
import { useWindowManager } from "./WindowManager";
import { TASKBAR_H } from "./WindowManager";

/**
 * 底部任务栏（Dock）
 * 运行中应用条目（焦点/运行/最小化三态）+ 语言切换 + 钱包 + 时钟
 */
export function Taskbar() {
  const { t } = useI18n();
  const wm = useWindowManager();

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t-[3px] border-border bg-surface px-2 lg:px-4"
      style={{ height: TASKBAR_H }}
      role="toolbar"
      aria-label={t("desktop.taskbar")}
    >
      {/* 运行中应用条目 */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {wm.windows.map((win) => {
          const app = APPS[win.id];
          const { Icon } = app;
          const focused = wm.focusedId === win.id && !win.minimized;
          return (
            <button
              key={win.id}
              type="button"
              onClick={() => {
                if (focused) wm.minimize(win.id);
                else wm.open(win.id);
              }}
              aria-current={focused ? "true" : undefined}
              aria-label={t(app.nameKey)}
              title={t(app.nameKey)}
              className={`flex h-10 shrink-0 cursor-pointer items-center gap-1.5 border-[3px] border-border px-2 transition-all duration-100 active:translate-x-px active:translate-y-px lg:px-2.5 ${
                focused
                  ? "bg-accent text-on-accent shadow-neu-sm"
                  : win.minimized
                    ? "bg-surface-2 text-faint opacity-70 hover:opacity-100"
                    : "bg-surface text-text hover:bg-accent hover:text-on-accent"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden max-w-24 truncate font-mono text-xs font-bold sm:block">
                {t(app.nameKey)}
              </span>
              {/* 运行状态指示点 */}
              <span
                aria-hidden="true"
                className={`size-1.5 shrink-0 border border-border ${
                  win.minimized ? "bg-faint" : "bg-success"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* 右侧：语言 / 钱包 / 时钟 */}
      <div className="flex shrink-0 items-center gap-2">
        <LocaleSwitch />
        <ConnectButton showBalance={false} accountStatus="address" chainStatus="none" />
        <Clock />
      </div>
    </div>
  );
}

/** 任务栏时钟（locale 格式化，30s 自刷新；useSyncExternalStore 避免 effect setState） */
function Clock() {
  const { locale, t } = useI18n();
  const getSnapshot = useCallback(
    () =>
      new Date().toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale],
  );
  const subscribe = useCallback((onChange: () => void) => {
    const id = window.setInterval(onChange, 30_000);
    return () => window.clearInterval(id);
  }, []);
  const now = useSyncExternalStore(subscribe, getSnapshot, () => "--:--");

  return (
    <span
      aria-label={t("desktop.clock")}
      className="hidden border-[3px] border-border bg-text px-2 py-1 font-mono text-xs font-bold text-bg md:inline-block"
    >
      {now || "--:--"}
    </span>
  );
}
