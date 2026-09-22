"use client";

import { useSyncExternalStore } from "react";

const MQ = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MQ);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * 是否偏好减弱动画（prefers-reduced-motion: reduce）
 * SSR 阶段拿不到 window，返回 false（不降级），hydrate 后自纠正。
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MQ).matches,
    () => false
  );
}
