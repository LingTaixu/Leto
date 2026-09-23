"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { CssPulse } from "./CssPulse";

const SESSION_KEY = "leto-boot-splash";
const HOLD_MS = 2000;
const FADE_MS = 300;
const MIN_TOTAL = HOLD_MS + FADE_MS;

type Phase = "waiting" | "holding" | "fading" | "done";

const SplashScene = dynamic(
  () => import("./ThreeScene").then((m) => m.ThreeScene),
  { ssr: false, loading: () => null },
);

/**
 * 全站首屏 splash 覆盖层
 * 状态机：waiting → hold(≥1s) → fading(300ms) → done(卸载)
 * sessionStorage 标记同一会话内（含刷新）不重复展示。
 */
export function BootSplash() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("waiting");

  useEffect(() => {
    let shown = false;
    try {
      shown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* storage 不可用时仍展示 splash */
    }

    if (shown) {
      const id = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(id);
    }

    const start = performance.now();
    const release = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_TOTAL - elapsed);
      window.setTimeout(() => {
        setPhase("fading");
        window.setTimeout(() => {
          setPhase("done");
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
        }, FADE_MS);
      }, remaining);
    };

    if (document.readyState === "complete") {
      release();
    } else {
      window.addEventListener("load", release, { once: true });
    }
    return () => window.removeEventListener("load", release);
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-busy="true"
      aria-label={t("loading.label")}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-300 ${
        phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {reduced ? <CssPulse /> : <SplashScene mode="splash" />}
    </div>
  );
}