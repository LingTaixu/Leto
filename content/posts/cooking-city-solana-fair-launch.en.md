---
title: "Cooking.City: A Next.js 15 Full-stack Practice for a Solana Fair Launch Platform"
summary: "Breaking down the Solana fair launch platform Cooking.City: Next.js 15 App Router + next-intl multilingual support, Reown AppKit wallet integration, Anchor program and Meteora DLMM liquidity integration, plus engineering implementations of anti-sniping and the Conviction Pool."
date: "2026-09-12"
tags: ["nextjs","solana","web3"]
readMin: 11
---

## What Problem Does the Platform Solve

Cooking.City is a **fair launch (Fair Launch) platform** built on Solana. It fights against the two most common forms of injustice in token issuance: **sniping (Sniper)** and **unfair token allocation**.

To this end, the platform introduces two core mechanisms: **Conviction Pool** (a conviction pool that provides price protection) and **Referral Mechanism** (a referral mechanism that makes distribution more balanced).

## Tech Stack

| Dimension | Choice |
| --- | --- |
| Framework | Next.js 15.1 App Router + React 19 |
| UI layer | HeroUI + Tailwind CSS 3.4 |
| Internationalization | next-intl (`[locale]` dynamic segment) |
| Wallet | Reown AppKit + Solana Adapter |
| On-chain | @coral-xyz/anchor, SPL Token, Metaplex |
| Liquidity | Meteora DLMM / Dynamic Bonding Curve |
| Market data | @jup-ag/api, klinecharts, echarts |
| Motion | framer-motion / motion, lottie-react |

## Provider Layering: Context Must Not Get Mixed Up

The nesting order of Providers in the root layout is deliberate: `AuthProvider` depends on wallet state, while `PriceProvider` depends on the network request context:

```
<ContextProvider>
  <HeroUIProvider>
    <ToastProvider />
    <PriceProvider>
      <AuthProvider>{children}</AuthProvider>
    </PriceProvider>
  </HeroUIProvider>
</ContextProvider>
```

> Ordering principle: **dependents go on the outside**. Wallet connection lives in `ContextProvider`, and auth state lives in `AuthProvider` — so Auth must be able to read the wallet, but not the other way around.

## Internationalization: `[locale]` Under App Router

Routing is taken over via the `next-intl` plugin, and page components receive `params` as a Promise:

```
export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { locale: string } }>) {
  return <html lang={params.locale} className="dark">{children}</html>;
}
```

Note that `<html lang>` directly consumes the locale, which is necessary for both SEO and accessible reading.

## API Proxying: Consolidate with rewrites

The frontend does not connect directly to multiple backend domains; instead, it uses rewrites in `next.config.ts` to proxy everything, avoiding CORS and key leakage:

```
async rewrites() {
  const apiBaseUrl = process.env.API_BASE_URL || "https://api.cooking.city";
  const v2BaseUrl  = process.env.V2_BASE_URL  || "https://dexapi.gemsgun.com";
  return {
    beforeFiles: [
      { source: "/api/:path*",    destination: `${apiBaseUrl}/api/:path*` },
      { source: "/twitter/:path*", destination: `${apiBaseUrl}/twitter/:path*` },
      { source: "/v2/:path*",     destination: `${v2BaseUrl}/v2/:path*` },
    ],
  };
}
```

## Anti-sniping: Dual Config Design

The platform prepares two sets of on-chain config IDs for normal launches and anti-sniping launches, injected via environment variables:

```
NEXT_PUBLIC_CONFIG_ID: "ALEKAF3Q48Vp6NV1uFEKSopAfFUpGEixJgEdTEdCcHvx"
NEXT_PUBLIC_ANTI_SNIPER_CONFIG_ID: "FQYWAQd6JgLgpbhq1zo4VoCPwLyAwB2uNZqceGPTrvMe"
```

Making "strategy" a config rather than a code branch means no frontend logic changes are needed when adding new launch modes.

## Stability and Performance Trade-offs

-   **Image optimization disabled** (`images.unoptimized = true`): the official comment states this is to avoid memory leaks, at the cost of giving up automatic compression;
-   **Remove console in production builds**: use Terser's `drop_console` to reduce noisy logs in production;
-   **External dependency whitelist**: exclude `pino-pretty`, `lokijs`, and `encoding` from the bundle to resolve WalletConnect-family compatibility issues on the Node side;
-   **Global CORS headers**: opened up uniformly in `headers()` to facilitate DApp embedding and third-party integration.

## Retrospective

Frontend complexity in the Solana ecosystem comes mainly from **fragmented wallet standards** and **on-chain program version evolution**. This project's response was to consolidate all of it into `next.config.ts` and the Provider layer — business components just consume hooks and are oblivious to the underlying differences.