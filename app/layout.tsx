import { Navigate } from "@/components/Navigate";
import { TabBar } from "@/components/TabBar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BootSplash } from "@/components/boot/BootSplash";
import { Providers } from "@/app/providers";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leto · Web3 前端工程师",
  description:
    "6 年 Web3 / 区块链前端工程师，精通 React、Next.js、Vue3，深耕 Hyperliquid、Polymarket、DEX 与 EVM 生态开发。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <BootSplash />
          <Navigate />
          {children}
          <Footer />
          <BackToTop />
          <TabBar />
        </Providers>
      </body>
    </html>
  );
}
