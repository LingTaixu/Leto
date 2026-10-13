"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { APPS, type AppId } from "./registry";

export interface WindowGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowState extends WindowGeometry {
  id: AppId;
  z: number;
  minimized: boolean;
  maximized: boolean;
  /** 最大化前的几何（还原用） */
  restore: WindowGeometry | null;
  /** 深链参数（如 blog 的 slug） */
  params: Record<string, string>;
}

export interface WindowStore {
  /** z 序从低到高排列 */
  windows: WindowState[];
  focusedId: AppId | null;
  nextZ: number;
}

type Action =
  | {
      type: "OPEN";
      id: AppId;
      params?: Record<string, string>;
      area: DesktopArea;
      mobile: boolean;
    }
  | { type: "CLOSE"; id: AppId }
  | { type: "MINIMIZE"; id: AppId }
  | { type: "TOGGLE_MAXIMIZE"; id: AppId; area: DesktopArea }
  | { type: "FOCUS"; id: AppId }
  | { type: "MOVE"; id: AppId; x: number; y: number }
  | { type: "RESIZE"; id: AppId; geom: WindowGeometry }
  | { type: "SET_PARAMS"; id: AppId; params: Record<string, string> }
  | { type: "MINIMIZE_OTHERS"; id: AppId };

/** 桌面可用区域（不含任务栏），由 Desktop 提供 */
export type DesktopArea = { w: number; h: number };

/** 任务栏高度（px），桌面可用区域 = 视口高度 - TASKBAR_H */
export const TASKBAR_H = 56;

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), Math.max(min, max));
}

/** 左侧图标网格保留宽度（新窗口不落在图标上） */
const ICON_COL_W = 200;

/** 新窗口 cascade 落位：错开排列并夹在可用区域内 */
function cascadeGeom(
  def: { w: number; h: number },
  min: { w: number; h: number },
  count: number,
  area: DesktopArea,
): WindowGeometry {
  const w = clamp(def.w, min.w, area.w);
  const h = clamp(def.h, min.h, area.h);
  const offset = (count % 6) * 28;
  const left = Math.min(ICON_COL_W, Math.max(0, area.w - w));
  const x = clamp(left + offset, 0, Math.max(0, area.w - w));
  const y = clamp(24 + offset, 0, Math.max(0, area.h - h));
  return { x, y, w, h };
}

function bringToFront(
  windows: WindowState[],
  id: AppId,
  z: number,
): WindowState[] {
  const rest = windows.filter((w) => w.id !== id);
  const target = windows.find((w) => w.id === id);
  if (!target) return windows;
  return [...rest, { ...target, z }];
}

function topVisible(windows: WindowState[]): AppId | null {
  for (let i = windows.length - 1; i >= 0; i--) {
    if (!windows[i].minimized) return windows[i].id;
  }
  return null;
}

function reducer(store: WindowStore, action: Action): WindowStore {
  switch (action.type) {
    case "OPEN": {
      const existing = store.windows.find((w) => w.id === action.id);
      const z = store.nextZ;
      if (existing) {
        // 已打开（含最小化）：还原/聚焦既有窗口，合并深链参数
        let windows = bringToFront(store.windows, action.id, z);
        windows = windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                minimized: false,
                params: action.params ? { ...action.params } : w.params,
              }
            : action.mobile
              ? { ...w, minimized: true }
              : w,
        );
        return { windows, focusedId: action.id, nextZ: z + 1 };
      }
      const def = APPS[action.id];
      const geom = cascadeGeom(
        def.defaultSize,
        def.minSize,
        store.windows.length,
        action.area,
      );
      const win: WindowState = {
        id: action.id,
        ...geom,
        z,
        minimized: false,
        maximized: false,
        restore: null,
        params: action.params ?? {},
      };
      const windows = action.mobile
        ? [
            ...store.windows.map((w) => ({ ...w, minimized: true })),
            win,
          ]
        : [...store.windows, win];
      return { windows, focusedId: action.id, nextZ: z + 1 };
    }
    case "CLOSE": {
      const windows = store.windows.filter((w) => w.id !== action.id);
      const focusedId =
        store.focusedId === action.id ? topVisible(windows) : store.focusedId;
      return { ...store, windows, focusedId };
    }
    case "MINIMIZE": {
      const windows = store.windows.map((w) =>
        w.id === action.id ? { ...w, minimized: true } : w,
      );
      const focusedId =
        store.focusedId === action.id ? topVisible(windows) : store.focusedId;
      return { ...store, windows, focusedId };
    }
    case "MINIMIZE_OTHERS": {
      const windows = store.windows.map((w) =>
        w.id === action.id ? { ...w, minimized: false } : { ...w, minimized: true },
      );
      return { ...store, windows, focusedId: action.id };
    }
    case "TOGGLE_MAXIMIZE": {
      const z = store.nextZ;
      const windows = bringToFront(store.windows, action.id, z).map((w) => {
        if (w.id !== action.id) return w;
        if (w.maximized) {
          return {
            ...w,
            maximized: false,
            ...(w.restore ?? {
              x: w.x,
              y: w.y,
              w: w.w,
              h: w.h,
            }),
            restore: null,
          };
        }
        return {
          ...w,
          maximized: true,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: 0,
          y: 0,
          w: action.area.w,
          h: action.area.h,
        };
      });
      return { ...store, windows, focusedId: action.id, nextZ: z + 1 };
    }
    case "FOCUS": {
      const target = store.windows.find((w) => w.id === action.id);
      if (!target) return store;
      if (target.minimized) {
        const z = store.nextZ;
        const windows = bringToFront(store.windows, action.id, z).map((w) =>
          w.id === action.id ? { ...w, minimized: false } : w,
        );
        return { ...store, windows, focusedId: action.id, nextZ: z + 1 };
      }
      if (store.focusedId === action.id && target.z === store.nextZ - 1) {
        return store;
      }
      const z = store.nextZ;
      return {
        ...store,
        windows: bringToFront(store.windows, action.id, z),
        focusedId: action.id,
        nextZ: z + 1,
      };
    }
    case "MOVE": {
      return {
        ...store,
        windows: store.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      };
    }
    case "RESIZE": {
      return {
        ...store,
        windows: store.windows.map((w) =>
          w.id === action.id ? { ...w, ...action.geom } : w,
        ),
      };
    }
    case "SET_PARAMS": {
      return {
        ...store,
        windows: store.windows.map((w) =>
          w.id === action.id ? { ...w, params: action.params } : w,
        ),
      };
    }
  }
}

export interface WindowManagerApi extends WindowStore {
  open: (id: AppId, params?: Record<string, string>) => void;
  close: (id: AppId) => void;
  minimize: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  focus: (id: AppId) => void;
  move: (id: AppId, x: number, y: number) => void;
  resize: (id: AppId, geom: WindowGeometry) => void;
  setParams: (id: AppId, params: Record<string, string>) => void;
  minimizeOthers: (id: AppId) => void;
}

const WindowManagerContext = createContext<WindowManagerApi | null>(null);

const INITIAL: WindowStore = { windows: [], focusedId: null, nextZ: 1 };

/**
 * 窗口管理器 Provider
 * area/mobile 由 Desktop 通过 ref 注入（避免 reducer 依赖 DOM）
 */
export function WindowManagerProvider({
  children,
  envRef,
}: {
  children: ReactNode;
  envRef: React.RefObject<{ area: DesktopArea; mobile: boolean }>;
}) {
  const [store, dispatch] = useReducer(reducer, INITIAL);

  const open = useCallback(
    (id: AppId, params?: Record<string, string>) => {
      const { area, mobile } =
        envRef.current ?? { area: { w: 1024, h: 640 }, mobile: false };
      dispatch({ type: "OPEN", id, params, area, mobile });
    },
    [envRef],
  );
  const close = useCallback((id: AppId) => dispatch({ type: "CLOSE", id }), []);
  const minimize = useCallback(
    (id: AppId) => dispatch({ type: "MINIMIZE", id }),
    [],
  );
  const toggleMaximize = useCallback(
    (id: AppId) => {
      const { area } =
        envRef.current ?? { area: { w: 1024, h: 640 }, mobile: false };
      dispatch({ type: "TOGGLE_MAXIMIZE", id, area });
    },
    [envRef],
  );
  const focus = useCallback((id: AppId) => dispatch({ type: "FOCUS", id }), []);
  const move = useCallback(
    (id: AppId, x: number, y: number) => dispatch({ type: "MOVE", id, x, y }),
    [],
  );
  const resize = useCallback(
    (id: AppId, geom: WindowGeometry) =>
      dispatch({ type: "RESIZE", id, geom }),
    [],
  );
  const setParams = useCallback(
    (id: AppId, params: Record<string, string>) =>
      dispatch({ type: "SET_PARAMS", id, params }),
    [],
  );
  const minimizeOthers = useCallback(
    (id: AppId) => dispatch({ type: "MINIMIZE_OTHERS", id }),
    [],
  );

  const api = useMemo<WindowManagerApi>(
    () => ({
      ...store,
      open,
      close,
      minimize,
      toggleMaximize,
      focus,
      move,
      resize,
      setParams,
      minimizeOthers,
    }),
    [
      store,
      open,
      close,
      minimize,
      toggleMaximize,
      focus,
      move,
      resize,
      setParams,
      minimizeOthers,
    ],
  );

  return (
    <WindowManagerContext.Provider value={api}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager(): WindowManagerApi {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) {
    throw new Error("useWindowManager must be used within WindowManagerProvider");
  }
  return ctx;
}
