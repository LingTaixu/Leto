import Link from "next/link";
import { web3Features } from "./features";

export default function Web3Page() {
  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      <header className="mb-8">
        <p className="font-mono text-sm text-accent">{"// WEB3 LAB"}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">
          Web3 功能实验室
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          一系列可交互的链上功能。每个卡片对应一个独立实验，
          只需连接浏览器钱包即可体验。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {web3Features.map((feature) => (
          <Link
            key={feature.slug}
            href={`/web3/${feature.slug}`}
            className="group flex flex-col rounded-lg border border-border/70 bg-surface/50 p-5 transition-shadow duration-200 hover:shadow-glow-sm"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-xs font-semibold text-accent">
                {feature.badge}
              </span>
              <span
                aria-hidden="true"
                className="text-faint transition-colors duration-200 group-hover:text-accent"
              >
                →
              </span>
            </div>
            <h2 className="mt-4 text-lg font-bold tracking-tight text-text transition-colors duration-150 group-hover:text-accent">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}