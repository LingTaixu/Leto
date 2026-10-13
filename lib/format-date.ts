/** 格式化日期为中文短格式（client-safe，独立于 lib/posts 的 fs 依赖） */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
