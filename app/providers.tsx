"use client";

import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/rainbowkit";

const queryClient = new QueryClient();

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSnapshot() {
  return false;
}

function usePrefersDark() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function Providers({ children }: { children: ReactNode }) {
  const dark = usePrefersDark();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={
            dark
              ? darkTheme({ accentColor: "#60a5fa" })
              : lightTheme({ accentColor: "#2563eb" })
          }
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
