"use client";

import { useState } from "react";
import { toHex } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CONTRACT_ADDRESS, MAX_DATA_LENGTH, abi } from "./contract";
import { useI18n } from "@/lib/i18n";

function bytesToUtf8(hex: `0x${string}`): string {
  if (hex.startsWith("0x")) hex = hex.slice(2) as `0x${string}`;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

export function StoreCard() {
  const { address, isConnected } = useAccount();
  const { t } = useI18n();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync, data: txHash, isPending } = useWriteContract();
  const { data: receipt, isError: txFailed } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  const byteLength = new TextEncoder().encode(input).length;

  async function handleStore() {
    setError(null);
    const bytes = new TextEncoder().encode(input);
    if (bytes.length === 0) {
      setError(t("notary.store.empty"));
      return;
    }
    if (bytes.length > MAX_DATA_LENGTH) {
      setError(t("notary.store.tooLarge"));
      return;
    }
    try {
      await mutateAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "store",
        args: [toHex(bytes)],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const notConnected = !isConnected;
  const wrongChain = isConnected && chainId !== 97;

  return (
    <div className="rounded-lg border border-border/70 bg-surface/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-accent">
          {t("notary.store.kicker")}
        </span>
        <span
          className="size-2 rounded-full bg-success shadow-[0_0_8px_var(--color-success)]"
          title={
            isConnected
              ? t("common.connected")
              : t("common.disconnected")
          }
        />
      </div>

      {notConnected ? (
        <p className="py-8 text-center font-mono text-sm text-faint">
          {t("notary.store.connect")}
        </p>
      ) : wrongChain ? (
        <p className="rounded-md border border-warning/40 px-3 py-2 text-sm text-warning">
          {t("notary.store.switchChain")}
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStore();
          }}
        >
          <label className="mb-2 block text-xs text-muted">
            {t("notary.store.label")}
          </label>
          <input
            className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("notary.store.placeholder")}
            maxLength={64}
          />
          <div className="mb-3 mt-2 flex justify-between font-mono text-xs text-faint">
            <span>
              {t("notary.store.wallet").replace(
                "{addr}",
                address
                  ? `${address.slice(0, 6)}…${address.slice(-4)}`
                  : "-",
              )}
            </span>
            <span>
              {t("notary.store.bytes")
                .replace("{n}", String(byteLength))
                .replace("{max}", String(MAX_DATA_LENGTH))}
            </span>
          </div>
          <button
            type="submit"
            disabled={isPending || byteLength === 0}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-text px-4 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? t("notary.store.signing") : t("notary.store.submit")}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-3 break-all rounded-md border border-error/40 px-3 py-2 font-mono text-xs text-error">
          ✗ {error}
        </div>
      )}

      {txHash && (
        <div className="mt-3 border-t border-dashed border-border pt-3">
          <div className="flex justify-between font-mono text-xs">
            <span className="text-faint">txHash</span>
            <a
              href={`https://testnet.bscscan.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </a>
          </div>
          {isPending && (
            <div className="mt-2 animate-pulse font-mono text-xs text-warning">
              {t("notary.store.waiting")}
            </div>
          )}
          {receipt && receipt.status === "success" && (
            <div className="mt-2 font-mono text-xs text-success">
              {t("notary.store.success").replace(
                "{data}",
                publicClient
                  ? (() => {
                      const log = receipt.logs.find(
                        (l) =>
                          l.address.toLowerCase() ===
                          CONTRACT_ADDRESS.toLowerCase(),
                      );
                      return log ? bytesToUtf8(log.data) : "";
                    })()
                  : "",
              )}
            </div>
          )}
          {txFailed && (
            <div className="mt-2 font-mono text-xs text-error">
              {t("notary.store.failed")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
