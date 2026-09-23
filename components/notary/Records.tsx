"use client";

import { useEffect, useMemo, useState } from "react";
import { parseAbiItem } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { CONTRACT_ADDRESS, DEPLOY_BLOCK, abi } from "./contract";
import { useI18n } from "@/lib/i18n";

export interface StoredRecord {
  txHash: `0x${string}`;
  blockNumber: bigint;
  timestamp: bigint;
  data: string;
}

const storedEvent = parseAbiItem(
  "event Stored(uint256 indexed timestamp, bytes data)",
);

const MAX_LOG_RANGE = BigInt(40000);
const LOOKBACK_BLOCKS = BigInt(49000);
const CONCURRENCY = 4;

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index]!);
    }
  };
  const workers = Array.from(
    { length: Math.min(limit, Math.max(items.length, 1)) },
    worker,
  );
  await Promise.all(workers);
  return results;
}

function decodeData(hex: `0x${string}`): string {
  const s = hex.slice(2);
  const len = parseInt(s.slice(64, 128), 16);
  const payload = s.slice(128, 128 + len * 2);
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(payload.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

function short(hash: string, n = 8) {
  return `${hash.slice(0, 6)}…${hash.slice(-n)}`;
}

function fmtTime(ts: bigint): string {
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleString("zh-CN", { hour12: false });
}

export function Records() {
  const { t } = useI18n();
  const publicClient = usePublicClient();
  const [records, setRecords] = useState<StoredRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;
    const client = publicClient;
    let cancelled = false;

    async function load() {
      try {
        const latest = await client.getBlockNumber();
        if (cancelled) return;

        // 免费公共 RPC 只保留最近约 5 万块历史，更早的日志会被剪枝。
        // 因此查询窗口取 [max(DEPLOY_BLOCK, latest - LOOKBACK), latest]。
        const deploy = BigInt(DEPLOY_BLOCK);
        const lookbackStart = latest - LOOKBACK_BLOCKS + BigInt(1);
        const start = lookbackStart > deploy ? lookbackStart : deploy;

        const ranges: { from: bigint; to: bigint }[] = [];
        for (let from = start; from <= latest; from += MAX_LOG_RANGE) {
          const end = from + MAX_LOG_RANGE - BigInt(1);
          ranges.push({ from, to: end < latest ? end : latest });
        }

        const batches = await mapLimit(ranges, CONCURRENCY, ({ from, to }) =>
          client.getLogs({
            address: CONTRACT_ADDRESS,
            event: storedEvent,
            fromBlock: from,
            toBlock: to,
          }),
        );

        if (cancelled) return;
        const list: StoredRecord[] = batches
          .flat()
          .filter(
            (l) =>
              l.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() &&
              l.transactionHash !== null &&
              l.blockNumber !== null,
          )
          .map((l) => ({
            txHash: l.transactionHash as `0x${string}`,
            blockNumber: l.blockNumber as bigint,
            timestamp:
              (l as unknown as { args: { timestamp?: bigint } }).args
                .timestamp ?? BigInt(0),
            data: decodeData(l.data),
          }))
          .sort((a, b) => (a.blockNumber < b.blockNumber ? 1 : -1));
        setRecords(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi,
    eventName: "Stored",
    onLogs: (logs) => {
      const fresh: StoredRecord[] = logs
        .filter(
          (l) =>
            l.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() &&
            l.transactionHash !== null &&
            l.blockNumber !== null,
        )
        .map((l) => ({
          txHash: l.transactionHash as `0x${string}`,
          blockNumber: l.blockNumber as bigint,
          timestamp:
            (l as unknown as { args: { timestamp?: bigint } }).args.timestamp ??
            BigInt(0),
          data: decodeData(l.data),
        }));
      if (fresh.length === 0) return;
      setRecords((prev) => {
        const seen = new Set(prev.map((r) => r.txHash));
        const added = fresh.filter((r) => !seen.has(r.txHash));
        return [...added, ...prev];
      });
    },
  });

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const latest = records[0]!;
    return {
      total: records.length,
      latestBlock: latest.blockNumber,
    };
  }, [records]);

  return (
    <div className="rounded-lg border border-border/70 bg-surface/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-accent">
          {t("notary.records.label")}
        </span>
        {stats && (
          <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted">
            {t("notary.records.stats")
              .replace("{count}", String(stats.total))
              .replace("{block}", stats.latestBlock.toString())}
          </span>
        )}
      </div>

      <p className="mb-3 font-mono text-[11px] leading-relaxed text-faint">
        {t("notary.records.notice")}
      </p>

      {loading && (
        <p className="py-8 text-center font-mono text-sm text-faint">
          {t("notary.records.scanning")}
        </p>
      )}
      {error && (
        <div className="break-all rounded-md border border-error/40 px-3 py-2 font-mono text-xs text-error">
          ✗ {error}
        </div>
      )}
      {!loading && !error && records.length === 0 && (
        <p className="py-8 text-center font-mono text-sm text-faint">
          {t("notary.records.empty")}
        </p>
      )}

      {records.length > 0 && (
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr>
                <th className="px-2 pb-2 text-left font-mono text-xs font-medium uppercase tracking-wider text-faint">
                  {t("notary.records.colIndex")}
                </th>
                <th className="px-2 pb-2 text-left font-mono text-xs font-medium uppercase tracking-wider text-faint">
                  {t("notary.records.colData")}
                </th>
                <th className="px-2 pb-2 text-left font-mono text-xs font-medium uppercase tracking-wider text-faint">
                  {t("notary.records.colTimestamp")}
                </th>
                <th className="px-2 pb-2 text-left font-mono text-xs font-medium uppercase tracking-wider text-faint">
                  {t("notary.records.colBlock")}
                </th>
                <th className="px-2 pb-2 text-left font-mono text-xs font-medium uppercase tracking-wider text-faint">
                  {t("notary.records.colTxHash")}
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.txHash} className="border-t border-border/70">
                  <td className="px-2 py-2 text-faint">{records.length - i}</td>
                  <td className="px-2 py-2 font-mono font-semibold text-accent">
                    {r.data}
                  </td>
                  <td className="px-2 py-2 text-faint">{fmtTime(r.timestamp)}</td>
                  <td className="px-2 py-2 text-faint">
                    #{r.blockNumber.toString()}
                  </td>
                  <td className="px-2 py-2">
                    <a
                      href={`https://testnet.bscscan.com/tx/${r.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-accent hover:underline"
                    >
                      {short(r.txHash)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
