import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

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

function parsePost(fileName: string): Article {
  const slug = fileName.replace(/\.md$/, "");
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

let cache: Article[] | null = null;

function allPosts(): Article[] {
  if (cache === null) {
    cache = fs
      .readdirSync(POSTS_DIR)
      .filter((name) => name.endsWith(".md"))
      .map(parsePost);
  }
  return cache;
}

/** 按日期倒序返回文章 */
export function getPosts(): Article[] {
  return [...allPosts()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 通过 slug 查询单篇 */
export function getPostBySlug(slug: string): Article | undefined {
  return allPosts().find((p) => p.slug === slug);
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
