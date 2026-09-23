import Link from "next/link";

export type Crumb = {
  label: string;
  href?: string;
};

/**
 * 面包屑（design-system §3.7）
 * Home / 分类 / 当前页，当前页用 aria-current="page"
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav aria-label="面包屑" className="text-sm text-faint">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((item, i) => {
          const isLast = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="leading-none">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span aria-current="page" className="text-text">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors duration-150 hover:bg-accent hover:text-on-accent"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}