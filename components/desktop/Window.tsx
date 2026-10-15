"use client";

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { APPS } from "./registry";
import {
  useWindowDrag,
  useWindowResize,
  type ResizeDir,
} from "./useWindowGestures";
import type {
  DesktopArea,
  WindowManagerApi,
  WindowState,
} from "./WindowManager";

const TITLE_H = 40;

interface WindowProps {
  win: WindowState;
  focused: boolean;
  mobile: boolean;
  area: DesktopArea;
  wm: WindowManagerApi;
}

/**
 * neubrutalism 应用窗口
 * 标题栏（图标 + 标题 + 最小化/最大化/关闭）+ 内容区（lazy Suspense）
 * 桌面端：绝对定位 + 拖拽/缩放；移动端：全屏、禁用手势
 */
export function Window({ win, focused, mobile, area, wm }: WindowProps) {
  const { t } = useI18n();
  const def = APPS[win.id];
  const { Icon, Content, minSize } = def;

  const geom = mobile
    ? { x: 0, y: 0, w: area.w, h: area.h }
    : win.maximized
      ? { x: 0, y: 0, w: area.w, h: area.h }
      : { x: win.x, y: win.y, w: win.w, h: win.h };

  const geomRef = useRef(geom);
  const areaRef = useRef(area);
  const minRef = useRef(minSize);
  // ref 与最新 props 同步（layout effect，供 pointer 事件回调读取）
  useLayoutEffect(() => {
    geomRef.current = geom;
    areaRef.current = area;
    minRef.current = minSize;
  });

  const gestures = !mobile && !win.maximized;

  const drag = useWindowDrag({
    geomRef,
    areaRef,
    onMove: (x, y) => wm.move(win.id, x, y),
  });
  const resize = useWindowResize({
    geomRef,
    areaRef,
    minRef,
    onResize: (g) => wm.resize(win.id, g),
  });

  // 内容变化时保持滚动位置在顶部（params.slug 切换文章）
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [win.params.slug]);

  const setParams = (next: Record<string, string>) =>
    wm.setParams(win.id, next);

  // 最小化：display:none 保留窗口内容状态（关闭才卸载）
  return (
    <div
      role="dialog"
      aria-label={t(def.nameKey)}
      onPointerDown={() => wm.focus(win.id)}
      className={`absolute flex-col border-[3px] border-border bg-surface ${
        win.minimized ? "hidden" : "flex"
      } ${focused ? "shadow-neu-lg" : "shadow-neu"}`}
      style={{
        left: geom.x,
        top: geom.y,
        width: geom.w,
        height: geom.h,
        zIndex: 10 + win.z,
      }}
    >
      {/* 标题栏 */}
      <div
        {...(gestures ? drag : {})}
        onDoubleClick={gestures ? () => wm.toggleMaximize(win.id) : undefined}
        className={`flex h-10 shrink-0 touch-none items-center gap-2 border-b-[3px] border-border px-2 select-none ${
          focused ? "bg-accent" : "bg-surface-2"
        } ${gestures ? "cursor-move" : ""}`}
      >
        <Icon className="size-4 shrink-0 text-text" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-mono text-xs font-bold text-text">
          {t(def.nameKey)}
        </span>
        <div className="flex shrink-0 items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          <TitleButton
            label={t("desktop.window.minimize")}
            onClick={() => wm.minimize(win.id)}
          >
            <span aria-hidden="true" className="block h-[3px] w-2.5 bg-text" />
          </TitleButton>
          {!mobile && (
            <TitleButton
              label={t(
                win.maximized
                  ? "desktop.window.restore"
                  : "desktop.window.maximize",
              )}
              onClick={() => wm.toggleMaximize(win.id)}
            >
              <span
                aria-hidden="true"
                className="block size-2.5 border-[2.5px] border-border"
              />
            </TitleButton>
          )}
          <TitleButton
            label={t("desktop.window.close")}
            danger
            onClick={() => wm.close(win.id)}
          >
            <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
              <path
                d="M1 1l8 8M9 1l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          </TitleButton>
        </div>
      </div>

      {/* 内容区 */}
      <div ref={contentRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg">
        <Suspense fallback={<WindowSkeleton label={t("loading.label")} />}>
          <Content params={win.params} setParams={setParams} />
        </Suspense>
      </div>

      {/* 缩放手柄（8 向） */}
      {gestures &&
        (
          [
            ["n", "left-2 right-2 -top-1 h-2 cursor-ns-resize"],
            ["s", "left-2 right-2 -bottom-1 h-2 cursor-ns-resize"],
            ["e", "top-2 bottom-2 -right-1 w-2 cursor-ew-resize"],
            ["w", "top-2 bottom-2 -left-1 w-2 cursor-ew-resize"],
            ["ne", "-top-1.5 -right-1.5 size-3 cursor-nesw-resize"],
            ["nw", "-top-1.5 -left-1.5 size-3 cursor-nwse-resize"],
            ["se", "-bottom-1.5 -right-1.5 size-3 cursor-nwse-resize"],
            ["sw", "-bottom-1.5 -left-1.5 size-3 cursor-nesw-resize"],
          ] as [ResizeDir, string][]
        ).map(([dir, cls]) => (
          <div
            key={dir}
            aria-hidden="true"
            className={`absolute touch-none ${cls}`}
            onPointerDown={resize.startResize(dir)}
            onPointerMove={resize.onPointerMove}
            onPointerUp={resize.onPointerUp}
            onPointerCancel={resize.onPointerCancel}
          />
        ))}
    </div>
  );
}

function TitleButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex size-6 cursor-pointer items-center justify-center border-2 border-border bg-surface text-text transition-colors duration-100 hover:bg-accent hover:text-on-accent active:translate-x-px active:translate-y-px ${
        danger ? "hover:bg-error" : ""
      }`}
    >
      {children}
    </button>
  );
}

function WindowSkeleton({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="flex h-full min-h-32 items-center justify-center"
    >
      <span className="inline-block size-5 animate-spin border-[3px] border-border border-t-accent" />
    </div>
  );
}

export { TITLE_H };
