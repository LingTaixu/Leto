"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { formatEther, isAddress, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useChainId,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useI18n } from "@/lib/i18n";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function fmtBalance(value: bigint | undefined, symbol?: string) {
  if (value === undefined) return "-";
  const s = formatEther(value);
  const trimmed = s.length > 8 ? s.slice(0, 8).replace(/0+$/, "") || "0" : s;
  return `${trimmed} ${symbol ?? ""}`.trim();
}

export default function TransferPage() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="inline-block border-2 border-border bg-accent px-2 py-0.5 font-mono text-sm font-bold text-on-accent">{t("transfer.kicker")}</p>
          <h1 className="mt-2 font-bold tracking-tight text-text">
            {t("transfer.title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {t("transfer.desc")}
          </p>
        </div>
        <ConnectButton showBalance={true} />
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BalanceCard />
        <TransferCard />
      </div>
    </main>
  );
}

function BalanceCard() {
  const { address: connected } = useAccount();
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState<`0x${string}` | undefined>();

  const { data, isLoading, error } = useBalance({ address: query });
  const inputValid = input === "" || isAddress(input);

  return (
    <div className="border-[3px] border-border bg-surface p-5 shadow-neu">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-text">
          {t("transfer.balance.label")}
        </span>
        <span
          className="size-3 border-[3px] border-border bg-success"
          title={
            connected
              ? t("common.connected")
              : t("common.disconnected")
          }
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input && isAddress(input)) setQuery(input as `0x${string}`);
        }}
      >
        <label className="mb-2 block text-xs font-bold text-text">
          {t("transfer.balance.addressLabel")}
        </label>
        <input
          className="w-full border-[3px] border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:outline-3 focus:outline-[var(--border)] focus:outline-offset-2 disabled:opacity-50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            connected ? connected : t("transfer.balance.placeholder")
          }
        />
        <div className="mb-3 mt-2 flex justify-between font-mono text-xs text-faint">
          <span>
            {query
              ? t("transfer.balance.queried").replace("{addr}", short(query))
              : t("transfer.balance.inputHint")}
          </span>
          {connected && (
            <button
              type="button"
              className="font-bold text-text underline decoration-2 underline-offset-2 hover:bg-accent hover:text-on-accent"
              onClick={() => {
                setInput(connected);
                setQuery(connected);
              }}
            >
              {t("transfer.balance.useCurrent")}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!input || !inputValid}
          className="inline-flex h-10 w-full items-center justify-center border-[3px] border-border bg-text px-4 text-sm font-bold text-bg shadow-neu-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-50"
        >
          {t("transfer.balance.query")}
        </button>
      </form>

      {!query && (
        <p className="py-6 text-center font-mono text-sm text-faint">
          {t("transfer.balance.prompt")}
        </p>
      )}
      {query && isLoading && (
        <p className="py-6 text-center font-mono text-sm text-faint">
          {t("transfer.balance.querying")}
        </p>
      )}
      {query && error && (
        <div className="mt-3 break-all border-[3px] border-border bg-error px-3 py-2 font-mono text-xs text-on-accent">
          ✗ {error instanceof Error ? error.message : String(error)}
        </div>
      )}
      {query && data && !isLoading && (
        <div className="mt-4 border-[3px] border-border bg-surface-2 px-4 py-3">
          <p className="font-mono text-xs text-faint">
            {t("transfer.balance.walletLabel")}
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-text">
            {fmtBalance(data.value, data.symbol)}
          </p>
        </div>
      )}
    </div>
  );
}

function TransferCard() {
  const { address, isConnected } = useAccount();
  const { t } = useI18n();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { sendTransactionAsync, data: txHash, isPending } =
    useSendTransaction();
  const { data: receipt, isError: txFailed } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  const busy = isPending || (!!txHash && !receipt);

  const notConnected = !isConnected;
  const wrongChain = isConnected && chainId !== 97;
  const toValid = to !== "" && isAddress(to);
  const amountValue = amount === "" ? 0n : (() => {
    try {
      return parseEther(amount);
    } catch {
      return null;
    }
  })();
  const amountValid = amountValue !== null && amountValue > 0n;
  const enough = balance?.value !== undefined && amountValue !== null && amountValue <= balance.value;

  async function handleSend() {
    setError(null);
    if (!toValid) {
      setError(t("transfer.send.invalidAddress"));
      return;
    }
    if (!amountValid) {
      setError(t("transfer.send.invalidAmount"));
      return;
    }
    if (!enough) {
      setError(t("transfer.send.insufficient"));
      return;
    }
    try {
      await sendTransactionAsync({
        to: to as `0x${string}`,
        value: parseEther(amount),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="border-[3px] border-border bg-surface p-5 shadow-neu">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-text">
          {t("transfer.send.label")}
        </span>
      </div>

      {notConnected ? (
        <p className="py-8 text-center font-mono text-sm text-faint">
          {t("transfer.balance.connect")}
        </p>
      ) : wrongChain ? (
        <p className="border-[3px] border-border bg-warning px-3 py-2 text-sm font-medium text-on-accent">
          {t("transfer.balance.switchChain")}
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <label className="mb-2 block text-xs font-bold text-text">
            {t("transfer.send.toLabel")}
          </label>
          <input
            className="w-full border-[3px] border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:outline-3 focus:outline-[var(--border)] focus:outline-offset-2 disabled:opacity-50"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={t("transfer.send.toPlaceholder")}
            disabled={busy}
          />
          <label className="mb-2 mt-4 block text-xs font-bold text-text">
            {t("transfer.send.amountLabel")}
          </label>
          <input
            className="w-full border-[3px] border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:outline-3 focus:outline-[var(--border)] focus:outline-offset-2 disabled:opacity-50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t("transfer.send.amountPlaceholder")}
            inputMode="decimal"
            disabled={busy}
          />
          <div className="mb-3 mt-2 flex justify-between font-mono text-xs text-faint">
            <span>
              {t("transfer.send.current").replace(
                "{balance}",
                fmtBalance(balance?.value, balance?.symbol),
              )}
            </span>
            <span>
              {amountValue !== null && amountValue > 0n
                ? t("transfer.send.approximate").replace("{amount}", amount)
                : t("transfer.send.amountHint")}
            </span>
          </div>
          <button
            type="submit"
            disabled={busy || !toValid || !amountValid || !enough}
            className="inline-flex h-10 w-full items-center justify-center gap-2 border-[3px] border-border bg-text px-4 text-sm font-bold text-bg shadow-neu-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-50"
          >
            {busy && (
              <svg
                className="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {busy
              ? isPending
                ? t("transfer.send.signing")
                : t("transfer.send.mining")
              : t("transfer.send.submit")}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-3 break-all border-[3px] border-border bg-error px-3 py-2 font-mono text-xs text-on-accent">
          ✗ {error}
        </div>
      )}

      {txHash && (
        <div className="mt-3 border-t-2 border-dashed border-border pt-3">
          <div className="flex justify-between font-mono text-xs">
            <span className="text-faint">txHash</span>
            <a
              href={`https://testnet.bscscan.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-text underline decoration-2 underline-offset-2 hover:bg-accent hover:text-on-accent"
            >
              {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </a>
          </div>
          {busy && (
            <div className="mt-2 flex items-center gap-2 font-mono text-xs font-bold text-text">
              <svg
                className="size-3 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              {isPending
                ? t("transfer.send.waiting")
                : t("transfer.send.confirming")}
            </div>
          )}
          {receipt && receipt.status === "success" && (
            <div className="mt-2 font-mono text-xs font-bold text-success-dark">
              {t("transfer.send.success")}
            </div>
          )}
          {txFailed && (
            <div className="mt-2 font-mono text-xs font-bold text-error-dark">
              {t("transfer.send.signFailed")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
