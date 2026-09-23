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
    <div className="border-[3px] border-border bg-surface p-5 shadow-neu">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-text">
          {t("notary.store.kicker")}
        </span>
        <span
          className="size-3 border-2 border-border bg-success"
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
        <p className="border-2 border-border bg-warning px-3 py-2 text-sm font-medium text-on-accent">
          {t("notary.store.switchChain")}
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStore();
          }}
        >
          <label className="mb-2 block text-xs font-bold text-text">
            {t("notary.store.label")}
          </label>
          <input
            className="w-full border-[3px] border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:outline-3 focus:outline-accent focus:outline-offset-2"
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
            className="inline-flex h-10 w-full items-center justify-center border-[3px] border-border bg-text px-4 text-sm font-bold text-bg shadow-neu-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? t("notary.store.signing") : t("notary.store.submit")}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-3 break-all border-2 border-border bg-error px-3 py-2 font-mono text-xs text-on-accent">
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
          {isPending && (
            <div className="mt-2 animate-pulse font-mono text-xs font-bold text-text">
              {t("notary.store.waiting")}
            </div>
          )}
          {receipt && receipt.status === "success" && (
            <div className="mt-2 font-mono text-xs font-bold text-success">
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
            <div className="mt-2 font-mono text-xs font-bold text-error">
              {t("notary.store.failed")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
