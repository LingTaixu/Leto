"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Records } from "@/components/notary/Records";
import { StoreCard } from "@/components/notary/StoreCard";
import { CONTRACT_ADDRESS } from "@/components/notary/contract";
import { useI18n } from "@/lib/i18n";

export default function NotaryPage() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-accent">{t("notary.kicker")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">
            {t("notary.title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {t("notary.desc")}
          </p>
        </div>
        <ConnectButton showBalance={true} />
      </header>

      <div className="mb-6">
        <span className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted">
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
    </main>
  );
}
