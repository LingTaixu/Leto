/**
 * 文章正文排版（design-system §3.3）
 * 用 Tailwind `[&_el]:` 任意后代选择器排版 HTML 博客正文。
 * 不依赖 @tailwindcss/typography 插件 —— 语义化类名直接作用于正文元素。
 *
 * 正文宽度由外层容器限制（max-w-[68ch]），此处负责内部排版层级。
 */
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="
        [&_p]:mt-6 [&_p:first-child]:mt-0
        [&_p]:text-base [&_p]:leading-[1.75] [&_p]:text-text

        [&_h2]:mt-12 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-8
        [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-text
        [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text

        [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2
        [&_a]:transition-colors [&_a]:duration-150
        [&_a:hover]:text-accent-hover

        [&_code]:border [&_code]:border-border
        [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5
        [&_code]:font-mono [&_code]:text-[0.875em]

        [&_pre]:mt-6 [&_pre]:overflow-x-auto
        [&_pre]:border-[3px] [&_pre]:border-border [&_pre]:bg-[#0a0a0a]
        [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-[1.7] [&_pre]:text-zinc-100

        [&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0

        [&_blockquote]:mt-6 [&_blockquote]:border-l-4 [&_blockquote]:border-accent
        [&_blockquote]:pl-4 [&_blockquote]:text-muted [&_blockquote]:italic

        [&_ul]:mt-6 [&_ul]:list-disc [&_ul]:pl-6
        [&_ol]:mt-6 [&_ol]:list-decimal [&_ol]:pl-6
        [&_li]:mt-2 [&_li]:leading-relaxed

        [&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
        [&_th]:border-b [&_th]:border-border [&_th]:px-3 [&_th]:py-2
        [&_th]:text-left [&_th]:font-semibold [&_th]:text-text
        [&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-muted

        [&_img]:mt-6 [&_img]:w-full [&_img]:border-[3px] [&_img]:border-border

        [&_hr]:mt-12 [&_hr]:border-border
      "
      // 正文为项目内静态内容，非用户输入，安全性可控
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}