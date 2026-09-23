import Link from "next/link";
import type { Metadata } from "next";
import { Tag } from "@/components/Tag";
import { type Locale } from "@/lib/locales";
import { resolveMessage, resolveRaw } from "@/lib/messages";

const contact = {
  name: "Leto",
  email: "taixuling@gmail.com",
  age: 27,
};

/** 项目关联博客文章链接（内容由 lib/posts 按 locale 提供，链接本身不翻译） */
const projectHrefs: Record<string, string> = {
  "IP Strategy Web": "/blog/ip-strategy-web-tanstack-router",
  "Cooking.City": "/blog/cooking-city-solana-fair-launch",
  "IP Strategy Base Service": "/blog/ip-strategy-base-service",
  ECHOSYNC: "/blog/echosync-hyperliquid-exchange",
};

interface Advantage {
  title: string;
  desc: string;
}

interface JobItem {
  company: string;
  range: string;
  role: string;
  points: string[];
}

interface ProjectItem {
  name: string;
  range: string;
  points: string[];
}

/** 区块标题 */
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-text">
        {title}
      </h2>
      {children}
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const name = resolveMessage(locale as Locale, "about.title");
  return { title: `${name} · ${contact.name}` };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = (key: string) => resolveMessage(locale as Locale, key);

  const skills = (
    resolveRaw(locale as Locale, "about.skills.list") as string[]
  ).filter((s): s is string => typeof s === "string");
  const advantages = resolveRaw(
    locale as Locale,
    "about.advantages.list",
  ) as Advantage[];
  const jobs = resolveRaw(
    locale as Locale,
    "about.experience.jobs",
  ) as JobItem[];
  const projects = resolveRaw(
    locale as Locale,
    "about.projects.list",
  ) as ProjectItem[];

  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-32 lg:pb-10">
      {/* 个人头部 */}
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-text">
          {contact.name}
        </h1>
        <p className="mt-2 text-lg text-muted">{t("about.subtitle")}</p>
        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-muted sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <dt className="text-faint">{t("about.contact.labels.email")}</dt>
            <dd>
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-accent transition-colors duration-150"
              >
                {contact.email}
              </a>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-faint">{t("about.contact.labels.gender")}</dt>
            <dd>{t("about.contact.genderValue")}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-faint">{t("about.contact.labels.age")}</dt>
            <dd>{contact.age}</dd>
          </div>
        </dl>
      </header>

      {/* 相关技能 */}
      <Section id="skills" title={t("about.skills.title")}>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Tag key={skill} name={skill} className="px-3 py-1.5 text-sm" />
          ))}
        </div>
      </Section>

      {/* 个人优势 */}
      <Section id="advantages" title={t("about.advantages.title")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {advantages.map((adv) => (
            <div
              key={adv.title}
              className="rounded-lg border border-border/70 bg-surface/50 p-4"
            >
              <h3 className="text-sm font-semibold text-text">{adv.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {adv.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 工作经历 */}
      <Section id="experience" title={t("about.experience.title")}>
        <ol className="relative space-y-8 border-l border-border pl-6">
          {jobs.map((job) => (
            <li key={job.company} className="relative">
              <span className="absolute -left-[1.805rem] top-1 size-2.5 rounded-full bg-accent" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-text">
                  {job.company}
                </h3>
                <span className="font-mono text-xs text-faint">
                  {job.range}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-faint">{job.role}</p>
              <ul className="mt-3 space-y-1.5">
                {job.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-muted"
                  >
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-border" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      {/* 项目经历（多张 Card） */}
      <Section id="projects" title={t("about.projects.title")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.name}
              className="flex flex-col rounded-lg border border-border/70 bg-surface/50 p-5 transition-shadow duration-200 hover:shadow-glow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                {projectHrefs[project.name] ? (
                  <h3 className="text-base font-semibold text-text transition-colors duration-150 hover:text-accent">
                    <Link href={projectHrefs[project.name]}>
                      {project.name} →
                    </Link>
                  </h3>
                ) : (
                  <h3 className="text-base font-semibold text-text">
                    {project.name}
                  </h3>
                )}
                <span className="shrink-0 font-mono text-xs text-faint">
                  {project.range}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {project.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-muted"
                  >
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent/60" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}