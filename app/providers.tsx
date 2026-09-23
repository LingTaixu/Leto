"use client";

import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/rainbowkit";

const queryClient = new QueryClient();

/**
 * 全局 Provider（neubrutalism 浅色主题）
 * 站点不响应 prefers-color-scheme：RainbowKit 固定 lightTheme，
 * accent 使用 neubrutalism 点缀黄 #FFD23F（黄底黑字）。
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ accentColor: "#FFD23F" })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
