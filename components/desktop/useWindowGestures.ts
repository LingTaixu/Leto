"use client";

import { useCallback, useRef } from "react";
import type { DesktopArea, WindowGeometry } from "./WindowManager";

interface DragOptions {
  geomRef: { current: WindowGeometry | null };
  areaRef: { current: DesktopArea | null };
  onMove: (x: number, y: number) => void;
}

/** 标题栏在可用区域内的合法 x/y 范围 */
function clampPos(
  x: number,
  y: number,
  geom: WindowGeometry,
  area: DesktopArea,
): { x: number; y: number } {
  const minX = Math.min(0, area.w - 120);
  const maxX = Math.max(0, area.w - 120);
  const maxY = Math.max(0, area.h - 40);
  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, 0), maxY),
  };
}

/**
 * 窗口标题栏拖拽（Pointer Events + setPointerCapture）
 * 标题栏保持可见：窗口左右至少留 120px 在可用区域内，顶部不出界
 */
export function useWindowDrag({ geomRef, areaRef, onMove }: DragOptions) {
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // 仅主键/触摸，且忽略标题栏按钮
      if (e.button !== 0) return;
      const geom = geomRef.current;
      if (!geom) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: geom.x,
        originY: geom.y,
      };
    },
    [geomRef],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      const geom = geomRef.current;
      const area = areaRef.current;
      if (!drag || drag.pointerId !== e.pointerId || !geom || !area) return;
      const next = clampPos(
        drag.originX + (e.clientX - drag.startX),
        drag.originY + (e.clientY - drag.startY),
        geom,
        area,
      );
      if (next.x !== geom.x || next.y !== geom.y) onMove(next.x, next.y);
    },
    [geomRef, areaRef, onMove],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      dragRef.current = null;
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    }
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}

/* ---------- 缩放 ---------- */

export type ResizeDir = "e" | "w" | "s" | "n" | "se" | "sw" | "ne" | "nw";

interface ResizeOptions {
  geomRef: { current: WindowGeometry | null };
  minRef: { current: { w: number; h: number } | null };
  areaRef: { current: DesktopArea | null };
  onResize: (geom: WindowGeometry) => void;
}

function applyResize(
  dir: ResizeDir,
  dx: number,
  dy: number,
  origin: WindowGeometry,
  min: { w: number; h: number },
  area: DesktopArea | null,
): WindowGeometry {
  let { x, y, w, h } = origin;
  if (dir.includes("e")) w = origin.w + dx;
  if (dir.includes("s")) h = origin.h + dy;
  if (dir.includes("w")) {
    const nextW = origin.w - dx;
    w = nextW;
    x = origin.x + origin.w - nextW;
  }
  if (dir.includes("n")) {
    const nextH = origin.h - dy;
    h = nextH;
    y = origin.y + origin.h - nextH;
  }
  // 最小尺寸约束（w/n 方向顶边/左边跟随回退）
  if (w < min.w) {
    if (dir.includes("w")) x = origin.x + origin.w - min.w;
    w = min.w;
  }
  if (h < min.h) {
    if (dir.includes("n")) y = origin.y + origin.h - min.h;
    h = min.h;
  }
  // 桌面边界约束：窗口不越出可用区域（min 尺寸让位于边界）
  if (area) {
    if (dir.includes("w") && x < 0) {
      w = Math.max(w + x, Math.min(min.w, origin.x + origin.w));
      x = 0;
    }
    if (dir.includes("n") && y < 0) {
      h = Math.max(h + y, Math.min(min.h, origin.y + origin.h));
      y = 0;
    }
    if (dir.includes("e")) w = Math.min(w, Math.max(min.w, area.w - x));
    if (dir.includes("s")) h = Math.min(h, Math.max(min.h, area.h - y));
  }
  return { x, y, w, h };
}

/**
 * 窗口边缘/角落 8 向缩放（Pointer Events + setPointerCapture）
 */
export function useWindowResize({
  geomRef,
  minRef,
  areaRef,
  onResize,
}: ResizeOptions) {
  const stateRef = useRef<{
    pointerId: number;
    dir: ResizeDir;
    startX: number;
    startY: number;
    origin: WindowGeometry;
  } | null>(null);

  const startResize = useCallback(
    (dir: ResizeDir) => (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      const geom = geomRef.current;
      if (!geom) return;
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      stateRef.current = {
        pointerId: e.pointerId,
        dir,
        startX: e.clientX,
        startY: e.clientY,
        origin: geom,
      };
    },
    [geomRef],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const st = stateRef.current;
      if (!st || st.pointerId !== e.pointerId) return;
      const min = minRef.current ?? { w: 320, h: 320 };
      const next = applyResize(
        st.dir,
        e.clientX - st.startX,
        e.clientY - st.startY,
        st.origin,
        min,
        areaRef.current,
      );
      onResize(next);
    },
    [minRef, areaRef, onResize],
  );

  const endResize = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const st = stateRef.current;
    if (st && st.pointerId === e.pointerId) {
      stateRef.current = null;
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    }
  }, []);

  return { startResize, onPointerMove, onPointerUp: endResize, onPointerCancel: endResize };
}

export { clampPos };
