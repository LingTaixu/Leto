/**
 * 站点部署域名（绝对 URL 基准），用于 sitemap / canonical / metadataBase
 */
export function getSiteUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SITE_URL || undefined;
}