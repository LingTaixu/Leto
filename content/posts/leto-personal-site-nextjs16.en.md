---
title: "Leto Personal Site: Agent-Driven Next.js 16 Blog with On-Chain Notary"
summary: "From bare bones to polished: building a personal site with Next.js 16 App Router + Tailwind v4 design tokens, a Markdown + frontmatter content layer, and an on-chain notary page powered by RainbowKit / wagmi on BSC."
date: "2026-09-21"
tags: ["nextjs", "web3", "设计"]
readMin: 9
---

## Background & Goals

The goal of this personal site is straightforward: **it is both a portfolio and a real technical validation**. Built from scratch in collaboration with an agent (DeepSeek V4.1 Flash), the project was gradually "finished" into a full site with a design system, a content layer, and on-chain interactions.

Three things had to hold at once:

- **Content-driven**: articles are managed as Markdown files, so writing content never touches code;
- **Consistent design**: light/dark auto-adaptation, with components sharing a single set of design tokens;
- **Real Web3**: not a gimmick - there is a working on-chain notary page that can connect a wallet and send transactions.

## Tech Stack

| Domain | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16.3 App Router + React 19 | Server Components first |
| Styling | Tailwind CSS 4 | `@theme inline` maps CSS variables to utility classes |
| Language | TypeScript 5 (strict) | Full type coverage |
| Content | `gray-matter` + `unified` (remark-gfm) | Markdown → HTML |
| On-chain | RainbowKit 2.2 + wagmi 3.7 + viem 2.x | BSC Testnet notary DApp |
| Runtime | Bun | Install & scripts |

## Design System: From Tokens to Tailwind v4

Visual consistency comes from **two sets of design tokens** (light / dark) in `globals.css`, mapped to directly usable utility classes via Tailwind v4's `@theme inline`:

```css
:root {
  --bg: #fafafa;
  --surface: #ffffff;
  --text: #18181b;
  --accent: #2563eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #09090b;
    --surface: #18181b;
    --text: #fafafa;
    --accent: #60a5fa;
  }
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-text: var(--text);
  --color-accent: var(--accent);
}
```

With this, components only write `bg-surface`, `text-muted`, `border-border` - **theme switching is handled by the token layer**, and components never need to know about themes.

Two deliberate visual details:

- **Liquid Glass capsule**: the mobile bottom nav uses a translucent background + `backdrop-filter` blur + a top highlight edge, paired with a sliding indicator for an iOS-style navigation;
- **Gemini animated border**: article cards use a rotating `conic-gradient` disc as a 1.5px border, with an opaque inner box as a mask so the "border spins but text stays sharp".

## Content Layer: Markdown-Driven Blog

Early posts embedded HTML strings inside TypeScript - metadata and body intertwined, so editing an article meant touching code. Later it was refactored to **one Markdown file per article + YAML frontmatter**:

```
content/posts/echosync-hyperliquid-exchange.md
---
title: "..."
summary: "..."
date: "2026-03-10"
tags: ["nextjs", "web3"]
readMin: 12
---

## Body heading
...
```

The read & render pipeline is a single chain:

```
.md file
  │ gray-matter            → { data: frontmatter, content: markdown }
  │ unified()
  │   .use(remark-parse)
  │   .use(remark-gfm)     → GFM tables / strikethrough / task lists
  │   .use(remark-rehype)
  │   .use(rehype-stringify)
  ▼
HTML string → <Prose> component
```

A few key design choices:

1. **frontmatter contract + fail-fast**: `title`, `summary`, `date`, `tags` are required; missing fields throw with the file and field name, so incomplete articles never go live silently;
2. **slug derived from filename**: `echosync-hyperliquid-exchange.md` → `/blog/echosync-hyperliquid-exchange`, URL stays stable across migration;
3. **typography handled by one component**: `Prose` defines body hierarchy once via Tailwind arbitrary descendant selectors (`[&_h2]:`, `[&_pre]:`), so markdown-generated HTML needs no per-element classes.

> The most important thing about a content system is not fancy rendering - it is **decoupling writing from code entirely**.

## On-Chain Notary: RainbowKit + wagmi

`/web3/notary` is a real, usable notary DApp: connect a browser wallet (e.g. MetaMask), and call the `DataNotary` contract on BSC Testnet to write up to 64 bytes of data into an event log. It lives under the `/web3` lab as one of several on-chain feature cards.

### Provider Structure

wagmi / RainbowKit depend on `window`, so they must be isolated on the client. The config lives in its own file with SSR explicitly disabled:

```ts
export const config = getDefaultConfig({
  appName: "Leto",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "",
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: fallback(RPC_URLS.map((url) => http(url))),
  },
  ssr: false,
});
```

`transports` uses viem's `fallback` over several public RPCs to avoid a single point of rate limiting; the Providers wrap the root layout in `WagmiProvider → QueryClientProvider → RainbowKitProvider` order.

### Write & Read

- **Write**: `useWriteContract` sends `store(bytes)`, `useWaitForTransactionReceipt` awaits the receipt, then shows the txHash and a BSCScan link; empty input, >64 bytes, and wrong network are all rejected off-chain first.
- **Read**: `usePublicClient().getLogs` pulls all `Stored` events from the deploy block, `useWatchContractEvent` prepends new records live - **reading does not require a wallet**.

### Theme Follow

RainbowKit's connect button ships with its own theme. To keep it consistent in both light and dark mode, `useSyncExternalStore` subscribes to `prefers-color-scheme`, switching between `darkTheme` / `lightTheme` dynamically with `accentColor` aligned to the site.

## Responsive: Two Navigations, One Width

- **Desktop**: the top `Navigate` shows full text navigation;
- **Mobile**: the bottom Liquid Glass capsule `TabBar` with a sliding indicator, shown below `lg`.

Content container width is centralized (`max-w-[62.5rem]`), shared by pages, nav, and footer, so widths stay consistent.

## Engineering & Validation

- `bun run lint` + `bunx tsc --noEmit` + `bun run build` as three gates;
- Blog uses **SSG**: `generateStaticParams` walks `content/posts/` and emits all article static pages at build time;
- The on-chain page never touches `window` during build - static prerender passes, then the client hydrates wallet state.

## Retrospective

The biggest lesson from building this site with an agent: **the clearer the architecture boundaries, the more reliably the agent produces**. Once the design tokens, content contract, and Provider structure are defined, adding pages is mostly just filling in the blanks.

Another takeaway is **choosing tools that match the scenario**: for a mostly-static site like a blog, SSG + Markdown is the least-ceremony combo; the on-chain parts are where you need heavy client dependencies like wagmi - and both coexist under the same App Router.