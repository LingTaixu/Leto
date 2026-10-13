"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Records } from "@/components/notary/Records";
import { StoreCard } from "@/components/notary/StoreCard";
import { CONTRACT_ADDRESS } from "@/components/notary/contract";
import { useI18n } from "@/lib/i18n";

/**
 * 数据存证窗口：原 /web3/notary 页面内容窗口化
 */
export function NotaryApp() {
  const { t } = useI18n();
  return (
    <div className="p-4 lg:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="inline-block border-2 border-border bg-accent px-2 py-0.5 font-mono text-sm font-bold text-on-accent">
            {t("notary.kicker")}
          </p>
          <h2 className="mt-2 font-bold tracking-tight text-text">
            {t("notary.title")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {t("notary.desc")}
          </p>
        </div>
        <ConnectButton showBalance={true} />
      </header>

      <div className="mb-6">
        <span className="border-[3px] border-border bg-surface px-3 py-1 font-mono text-xs font-bold text-text">
          {t("notary.contract").replace(
            "{addr}",
            `${CONTRACT_ADDRESS.slice(0, 6)}…${CONTRACT_ADDRESS.slice(-4)}`,
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StoreCard />
        <Records />
      </div>
    </div>
  );
}
