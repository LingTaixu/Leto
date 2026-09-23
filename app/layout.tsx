import { Providers } from "@/app/providers";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Inter,
  JetBrains_Mono,
  Syne,
  Space_Grotesk,
  Space_Mono,
} from "next/font/google";
import "./globals.css";

// 正文（保留原有）
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// 代码块（保留原有）
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

// neubrutalism 展示字体（Display）
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// neubrutalism 标题字体（Heading）
const spaceGrotesk = Space_Grotesk({
  variable: "--font-spacegrotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// neubrutalism 等宽字体（Mono 标签 / kicker）
const spaceMono = Space_Mono({
  variable: "--font-spacemono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || undefined;
  const base = siteUrl ? { metadataBase: new URL(siteUrl) } : {};
  return {
    ...base,
    title: "Leto · Web3 前端工程师",
    description:
      "6 年 Web3 / 区块链前端工程师，精通 React、Next.js、Vue3，深耕 Hyperliquid、Polymarket、DEX 与 EVM 生态开发。",
    openGraph: {
      siteName: "Leto",
      type: "website",
      locale: "zh_CN",
    },
    twitter: {
      card: "summary",
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${jetbrainsMono.variable} ${syne.variable} ${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}