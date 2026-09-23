---
title: "Leto Personal Site: Agent-Driven Next.js 16 Bilingual Blog and Web3 Feature Lab"
summary: "From bare bones to polished: a Neubrutalism-styled zh/en bilingual personal site built with Next.js 16 App Router + Tailwind v4 design tokens, a Markdown + frontmatter content layer, and a Web3 feature lab powered by RainbowKit / wagmi and a Hyperliquid K-line chart for on-chain notary, transfers, and live market data."
date: "2026-09-24"
tags: ["nextjs", "web3", "设计"]
readMin: 12
---

## Background & Goals

The goal of this personal site is straightforward: **it is both a portfolio and a real technical validation**. Built from scratch in collaboration with an agent (DeepSeek V4.1 Flash), the project was gradually "finished" into a full site with a design system, a content layer, internationalization, and on-chain interactions.

Four things had to hold at once:

- **Content-driven**: articles are managed as Markdown files, so writing content never touches code;
- **Bilingual**: `zh` / `en` routed versions, auto-distributed based on the visitor's language;
- **Consistent design**: a single set of Neubrutalism design tokens shared across the site;
- **Real Web3**: not a gimmick - a working feature lab that can connect a wallet, send transactions, and watch live market data.

## Tech Stack

| Domain | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16.3 App Router + React 19 | Server Components first |
| Styling | Tailwind CSS 4 | `@theme inline` maps CSS variables to utility classes |
| Language | TypeScript 5 (strict) | Full type coverage; target ES2020 (BigInt literals) |
| i18n | Custom ( `[locale]` routing + middleware) | `zh` / `en` message files |
| Content | `gray-matter` + `unified` (remark-gfm) | Markdown → HTML, per-locale files |
| On-chain | RainbowKit 2.2 + wagmi 3.7 + viem 2.x | BSC Testnet notary & transfer DApps |
| Market data | `@nktkas/hyperliquid` + `lightweight-charts` | Hyperliquid K-line (REST snapshot + WSS live) |
| Motion | Three.js | Boot splash particle animation |
| Analytics | `@vercel/analytics` v2 | Web Analytics |
| Runtime | Bun | Install & scripts |

## Design System: Neubrutalism Tokens

Visual consistency comes from a **single light-theme token set** in `globals.css`, mapped to directly usable utility classes via Tailwind v4's `@theme inline`. The style is Neubrutalism: **hard borders, hard shadows, zero border radius, flat color** - and it does not respond to `prefers-color-scheme` (one light theme).

```css
:root {
  --bg: #fffdf5;          /* Off-White background */
  --surface: #ffffff;     /* Cards / panels */
  --border: #000000;      /* Structural black */
  --text: #000000;        /* Body text */
  --text-muted: #333333;  /* Secondary text (AA 4.5:1) */
  --accent: #ffd23f;      /* Bold Yellow, background fill only */
  --on-accent: #000000;   /* Black on yellow */
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-text: var(--text);
  --color-accent: var(--accent);
  --shadow-neu-sm: 3px 3px 0 0 #000;
  --shadow-neu: 5px 5px 0 0 #000;
  --shadow-neu-lg: 8px 8px 0 0 #000;
}
```

Components only write `bg-surface`, `text-muted`, `border-border`, `shadow-neu` - **the theme is passed through by the token layer**. Four font roles: Inter (body), JetBrains Mono (code), Space Grotesk (h1 / heading), Syne (h2 and below / display). Headings scale by 1.25x (h1 3rem / h2 2rem / h3 1.5rem / h4 1.25rem), shrinking proportionally on small screens (<480px).

Accessibility is part of the design system:

- **Focus rings**: keyboard focus uses a black `outline-[var(--border)]` with a 4px offset, never shown on mouse clicks;
- **Contrast**: body, muted (#333), success-dark `#1b5e20`, and error-dark `#b71c1c` all meet WCAG 2.1 AA; yellow is never used as text color.

Three distinctive visual details:

- **Homepage marquee**: a black bar with white text and yellow square separators, CSS-driven 25s seamless loop, pauses on hover;
- **Boot splash**: a Three.js particle nebula with a centered "Leto" label that holds at least 2 seconds after the page is ready, then fades out; deduplicated per session, degrading to a CSS pulse under `prefers-reduced-motion`;
- **Hard-shadow interaction**: buttons shift and cast a hard shadow on hover, then "push down" (`translate(3px,3px)`, shadow gone) on click.

## Internationalization: Locale Routing + Middleware + Messages

All routes live under a `[locale]` dynamic segment (`/zh/…`, `/en/…`), coordinated by three layers:

1. **`middleware.ts`**: requests without a locale prefix are detected via `Accept-Language` and redirected with a 302; a manually chosen cookie takes priority; unrecognized languages fall back to `zh`; static assets (`/_next`, etc.) are skipped;
2. **Message layer**: `messages/zh/*.json` and `messages/en/*.json` split by namespace (`home`, `blog`, `web3`, `notary`, `transfer`, `kline`…), with `resolveMessage` resolving per locale and falling back to `zh` on a missing key;
3. **Switcher**: `LocaleSwitch` writes a cookie and swaps the first pathname segment via `useI18n`, navigating without losing route state.

The locale type is an open union (`"zh" | "en" | (string & {})`), so adding a language only requires a new prefix and message files - no structural changes.

## Content Layer: Markdown-Driven Bilingual Blog

Early posts embedded HTML strings inside TypeScript - metadata and body intertwined, so editing an article meant touching code. Later it was refactored to **one Markdown file per article per language**: `{slug}.{locale}.md`, with `title` and `summary` in that locale's frontmatter:

```
content/posts/echosync-hyperliquid-exchange.zh.md
content/posts/echosync-hyperliquid-exchange.en.md
---
title: "…"
summary: "…"
date: "2026-03-10"
tags: ["nextjs", "web3"]
readMin: 12
---

## Body heading
…
```

The read & render pipeline is a single chain:

```
{slug}.{locale}.md
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
2. **slug derived from filename**: `echosync-hyperliquid-exchange.zh.md` → `/zh/blog/echosync-hyperliquid-exchange`, URL stays stable across languages;
3. **typography handled by one component**: `Prose` defines body hierarchy once via Tailwind arbitrary descendant selectors (`[&_h2]:`, `[&_pre]:`), so markdown-generated HTML needs no per-element classes;
4. **two-dimensional SSG**: `generateStaticParams` walks `locale × slug` and emits all bilingual static pages at build time.

> The most important thing about a content system is not fancy rendering - it is **decoupling writing from code entirely**.

## Web3 Feature Lab: /web3

`/web3` is a "feature lab" landing page: three Neubrutalism cards (badge + title + description), each pointing to a standalone experiment. The feature list is driven by `features.ts` and auto-covered by the sitemap.

### Data Notary

Connect a browser wallet (e.g. MetaMask) and call the `DataNotary` contract on BSC Testnet (chainId 97) to write up to 64 bytes of data into an event log - the hash is the proof. On the read side it pulls all `Stored` events from the deploy block in reverse block order, with `useWatchContractEvent` prepending new records live - **reading does not require a wallet**.

### Native Token Transfer

A two-card layout: **balance query** takes any address (or one-click use of the connected wallet) and looks up BNB balance on BSC Testnet; **transfer** validates address / amount / balance and the network (chainId 97), sends via `useSendTransaction`, waits for 1 confirmation, and shows the txHash with a BSCScan link. Empty input, invalid addresses, and insufficient balance are all rejected off-chain first.

### Hyperliquid Realtime K-line

`/web3/kline` is a purely browser-side market-data experiment with a dual-channel data flow:

- **REST snapshot**: `InfoClient.candleSnapshot` pulls the last 30 days of candles (default `ETH`/`1h`), with the coin list from `allMids` perps;
- **WSS live**: `SubscriptionClient.candle({coin, interval})` subscribes to the current period; events are validated by `s`/`i`, late messages from old subscriptions are dropped, and switching does `unsubscribe` - the whole page reuses a single connection;
- **Rendering**: `lightweight-charts` candlestick main pane + volume sub-pane + crosshair OHLC legend; snapshots use `setData`, live single candles flow straight to `series.update`, and **data changes never rebuild the chart**, so zoom position survives;
- **Lazy history loading**: scrolling to the history edge fetches an earlier batch prepended to the view, deduplicated by timestamp and kept in strict ascending order; hitting the oldest boundary shows "Earliest data reached", guarded by a concurrency lock;
- **URL as single source of truth**: `coin`/`interval` sync to `?coin=&interval=`, so refresh and sharing never lose state.

## Responsive: Two Navigations, One Width

- **Desktop**: the top `Navigate` shows full text navigation plus the language switcher, visible from `md` up;
- **Mobile**: a Neubrutalism capsule `TabBar` at the bottom with a yellow sliding indicator tracking the active tab, rendered below `lg`.

Content container width is centralized (`max-w-[62.5rem]`, widened to `max-w-[90rem]` on the K-line page), shared by pages, nav, and footer, so widths stay consistent.

## Analytics: Vercel Web Analytics

The root layout includes `<Analytics />` from `@vercel/analytics/next` (v2 package). With Web Analytics enabled in the Vercel dashboard, page views are reported automatically and can be inspected there after deployment; v2 needs no extra config - just place the component inside `<body>`.

## SEO: sitemap / robots / hreflang

- `app/sitemap.ts`: covers every static route (both `zh` and `en` locales in full) plus every post URL;
- `app/robots.ts`: allows full crawling and points to the sitemap;
- per-page `generateMetadata`: each page provides `title` / `description`, and the root layout provides `metadataBase`, `openGraph`, and `twitter`;
- `localeAlternates`: emits `canonical` plus `zh` / `en` / `x-default` `hreflang` alternates, with absolute URLs from `NEXT_PUBLIC_SITE_URL`.

## Engineering & Validation

- `bun run lint` + `bunx tsc --noEmit` + `bun run build` as three gates;
- Blog uses **SSG**: `generateStaticParams` over `locale × slug` emits all bilingual static pages at build time;
- The on-chain and K-line pages never touch `window` during build: client components are marked `"use client"`, Three.js is loaded via `dynamic(…, { ssr: false })`, static prerender passes, then the client hydrates wallet state and the chart.

## Retrospective

The biggest lesson from building this site with an agent: **the clearer the architecture boundaries, the more reliably the agent produces**. Once the design tokens, frontmatter contract, i18n message keys, and Provider structure are defined, adding pages is mostly just filling in the blanks.

Another takeaway is **choosing tools that match the scenario**: for a mostly-static site like a blog, SSG + Markdown is the least-ceremony combo; on-chain interactions are where you need heavy client dependencies like wagmi; and live market data proves that "REST snapshot as a base + WSS increments" can run directly in the browser without rebuilding the chart or losing zoom position - all three coexist under the same App Router.