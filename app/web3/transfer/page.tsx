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
  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-accent">{"// VALUE TRANSFER"}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">
            BSC 原生币转账
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            连接钱包，查询任意地址的 BSC Testnet BNB 余额，并发起原生币转账交易。
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
  const [input, setInput] = useState("");
  const [query, setQuery] = useState<`0x${string}` | undefined>();

  const { data, isLoading, error } = useBalance({ address: query });
  const inputValid = input === "" || isAddress(input);

  return (
    <div className="rounded-lg border border-border/70 bg-surface/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-accent">{"// 余额查询"}</span>
        <span
          className="size-2 rounded-full bg-success shadow-[0_0_8px_var(--color-success)]"
          title={connected ? "已连接" : "未连接"}
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input && isAddress(input)) setQuery(input as `0x${string}`);
        }}
      >
        <label className="mb-2 block text-xs text-muted">钱包地址</label>
        <input
          className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={connected ? connected : "0x..."}
        />
        <div className="mb-3 mt-2 flex justify-between font-mono text-xs text-faint">
          <span>{query ? `查询: ${short(query)}` : "输入或粘贴地址"}</span>
          {connected && (
            <button
              type="button"
              className="text-accent hover:underline"
              onClick={() => {
                setInput(connected);
                setQuery(connected);
              }}
            >
              使用当前地址
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!input || !inputValid}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-text px-4 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          查询余额
        </button>
      </form>

      {!query && (
        <p className="py-6 text-center font-mono text-sm text-faint">
          输入地址以查询余额
        </p>
      )}
      {query && isLoading && (
        <p className="py-6 text-center font-mono text-sm text-faint">
          正在查询…
        </p>
      )}
      {query && error && (
        <div className="mt-3 break-all rounded-md border border-error/40 px-3 py-2 font-mono text-xs text-error">
          ✗ {error instanceof Error ? error.message : String(error)}
        </div>
      )}
      {query && data && !isLoading && (
        <div className="mt-4 rounded-md border border-border/60 bg-surface px-4 py-3">
          <p className="font-mono text-xs text-faint">余额</p>
          <p className="mt-1 font-mono text-xl font-semibold text-accent">
            {fmtBalance(data.value, data.symbol)}
          </p>
        </div>
      )}
    </div>
  );
}

function TransferCard() {
  const { address, isConnected } = useAccount();
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
      setError("收款地址无效");
      return;
    }
    if (!amountValid) {
      setError("金额必须大于 0");
      return;
    }
    if (!enough) {
      setError("余额不足");
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
    <div className="rounded-lg border border-border/70 bg-surface/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-accent">{"// 发起转账"}</span>
      </div>

      {notConnected ? (
        <p className="py-8 text-center font-mono text-sm text-faint">
          连接钱包以发起转账
        </p>
      ) : wrongChain ? (
        <p className="rounded-md border border-warning/40 px-3 py-2 text-sm text-warning">
          请在 RainbowKit 中切换到 BSC Testnet (#97)
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <label className="mb-2 block text-xs text-muted">收款地址</label>
          <input
            className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            disabled={busy}
          />
          <label className="mb-2 mt-4 block text-xs text-muted">
            金额（BNB）
          </label>
          <input
            className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            inputMode="decimal"
            disabled={busy}
          />
          <div className="mb-3 mt-2 flex justify-between font-mono text-xs text-faint">
            <span>当前: {fmtBalance(balance?.value, balance?.symbol)}</span>
            <span>
              {amountValue !== null && amountValue > 0n
                ? `≈ ${amount} BNB`
                : "输入金额"}
            </span>
          </div>
          <button
            type="submit"
            disabled={busy || !toValid || !amountValid || !enough}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-text px-4 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
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
            {busy ? (isPending ? "等待签名…" : "等待上链…") : "发送转账"}
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
          {busy && (
            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-warning">
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
              {isPending ? "等待钱包签名…" : "等待交易上链…"}
            </div>
          )}
          {receipt && receipt.status === "success" && (
            <div className="mt-2 font-mono text-xs text-success">
              ✓ 转账成功
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
