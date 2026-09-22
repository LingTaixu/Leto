export function CssPulse({ label = "Leto" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-3 animate-pulse rounded-full bg-accent"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
      <span className="font-mono text-sm tracking-wide text-muted">
        {label}
      </span>
    </div>
  );
}