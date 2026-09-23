"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * 返回顶部（neubrutalism，仅移动端）
 * 滚动超过 1 屏出现；硬边框方块 + 硬阴影，避让底部 Tab 条
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={t("common.backToTop")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={[
        "fixed right-4 z-40 flex size-10 items-center justify-center border-[3px] border-border",
        "bg-text text-bg shadow-neu transition-opacity duration-300",
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]",
        "lg:hidden",
        "focus-visible:outline-3 focus-visible:outline-[var(--border)] focus-visible:outline-offset-3",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}