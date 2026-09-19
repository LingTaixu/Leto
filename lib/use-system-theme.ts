"use client";

import { useSyncExternalStore } from "react";

const MQ = "(prefers-color-scheme: dark)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MQ);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

// SSR 阶段拿不到 window，返回保守值 'light'，hydrate 后自纠正
export function useSystemTheme(): "light" | "dark" {
  const isDark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MQ).matches,
    () => false
  );
  return isDark ? "dark" : "light";
}