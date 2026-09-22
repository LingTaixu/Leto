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
      setError("输入不能为空");
      return;
    }
    if (bytes.length > MAX_DATA_LENGTH) {
      setError(
        `数据超出 ${MAX_DATA_LENGTH} 字节上限（当前 ${bytes.length} 字节）`,
      );
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
        <span className="font-mono text-xs text-accent">{"// 存证写入"}</span>
        <span
          className="size-2 rounded-full bg-success shadow-[0_0_8px_var(--color-success)]"
          title={isConnected ? "已连接" : "未连接"}
        />
      </div>

      {notConnected ? (
        <p className="py-8 text-center font-mono text-sm text-faint">
          连接钱包以发起存证交易
        </p>
      ) : wrongChain ? (
        <p className="rounded-md border border-warning/40 px-3 py-2 text-sm text-warning">
          请在 RainbowKit 中切换到 BSC Testnet (#97)
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStore();
          }}
        >
          <label className="mb-2 block text-xs text-muted">
            IP / 数据（≤ 64 字节）
          </label>
          <input
            className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="如 192.168.1.1 或 2001:db8::1"
            maxLength={64}
          />
          <div className="mb-3 mt-2 flex justify-between font-mono text-xs text-faint">
            <span>
              钱包:{" "}
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "-"}
            </span>
            <span>
              字节: {byteLength}/{MAX_DATA_LENGTH}
            </span>
          </div>
          <button
            type="submit"
            disabled={isPending || byteLength === 0}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-text px-4 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? "等待签名…" : "存证上链"}
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
              等待交易上链…
            </div>
          )}
          {receipt && receipt.status === "success" && (
            <div className="mt-2 font-mono text-xs text-success">
              ✓ 存证成功。数据:{" "}
              {publicClient
                ? (() => {
                    const log = receipt.logs.find(
                      (l) =>
                        l.address.toLowerCase() ===
                        CONTRACT_ADDRESS.toLowerCase(),
                    );
                    return log ? bytesToUtf8(log.data) : "";
                  })()
                : ""}
            </div>
          )}
          {txFailed && (
            <div className="mt-2 font-mono text-xs text-error">
              ✗ 交易失败，见区块浏览器
            </div>
          )}
        </div>
      )}
    </div>
  );
}
