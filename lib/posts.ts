import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Locale } from "@/lib/locales";

export type Article = {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO yyyy-mm-dd
  readMin: number;
  tags: string[];
  /** 是否为置顶文章（首卡 hairline 加粗 + 辉光最强） */
  pinned?: boolean;
  /** 正文 HTML（与 Prose 组件配合渲染） */
  content?: string;
};

const POSTS_DIR = path.join(process.cwd(), "content/posts");

const REQUIRED_FIELDS = ["title", "summary", "date", "tags"] as const;

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

function renderMarkdown(markdown: string): string {
  return processor.processSync(markdown).toString();
}

function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

/** 文件名 "slug.zh.md" -> slug */
function slugFromFile(fileName: string): string {
  return fileName.replace(/\.(?:[a-z]{2}\.md|md)$/, "");
}

/** 传入文件名必须形如 "{slug}.{locale}.md" */
function parsePost(fileName: string): Article {
  const slug = slugFromFile(fileName);
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined) {
      throw new Error(
        `[content/posts/${fileName}] frontmatter 缺少必填字段: ${field}`,
      );
    }
  }
  if (!Array.isArray(data.tags)) {
    throw new Error(
      `[content/posts/${fileName}] frontmatter 字段 "tags" 必须是字符串数组`,
    );
  }

  return {
    slug,
    title: String(data.title),
    summary: String(data.summary),
    date: toDateString(data.date),
    readMin: Number(data.readMin ?? 0),
    tags: data.tags.map(String),
    pinned: data.pinned === true ? true : undefined,
    content: renderMarkdown(content),
  };
}

const cache = new Map<string, Article[]>();

function allPosts(locale: Locale): Article[] {
  const cached = cache.get(locale);
  if (cached) return cached;
  const list = fs
    .readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith(`.${locale}.md`))
    .map(parsePost);
  cache.set(locale, list);
  return list;
}

/** 按日期倒序返回当前 locale 的文章 */
export function getPosts(locale: Locale): Article[] {
  return [...allPosts(locale)].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 通过 slug 查询当前 locale 的单篇 */
export function getPostBySlug(
  slug: string,
  locale: Locale,
): Article | undefined {
  return allPosts(locale).find((p) => p.slug === slug);
}

/** 全部 locale 组合（用于 generateStaticParams） */
export function getAllSlugs(locale: Locale): string[] {
  return allPosts(locale).map((p) => p.slug);
}

/** 格式化日期为中文短格式 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}