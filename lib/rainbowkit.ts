import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { fallback } from "viem";
import { http } from "wagmi";
import { bscTestnet } from "wagmi/chains";

export const RPC_URLS = [
  "https://bsc-testnet-rpc.publicnode.com",
  "https://data-seed-prebsc-1-s1.binance.org:8545/",
  "https://data-seed-prebsc-2-s2.binance.org:8545/",
];

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "Test";

export const config = getDefaultConfig({
  appName: "Leto",
  projectId,
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: fallback(RPC_URLS.map((url) => http(url))),
  },
  ssr: false,
});
