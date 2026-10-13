"use client";

import { Tag } from "@/components/Tag";
import { useI18n } from "@/lib/i18n";
import { resolveMessage, resolveRaw } from "@/lib/messages";
import { useWindowManager } from "../WindowManager";

const contact = {
  name: "Leto",
  email: "taixuling@gmail.com",
  telegram: "@leto_lll",
  age: 27,
};

/** 项目关联博客文章（点击打开博客窗口深链） */
const projectSlugs: Record<string, string> = {
  "IP Strategy Web": "ip-strategy-web-tanstack-router",
  "Cooking.City": "cooking-city-solana-fair-launch",
  "IP Strategy Base Service": "ip-strategy-base-service",
  ECHOSYNC: "echosync-hyperliquid-exchange",
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
    <section id={id} className="mt-10">
      <h3 className="mb-5 font-semibold tracking-tight text-text">{title}</h3>
      {children}
    </section>
  );
}

/**
 * 关于窗口：原 /about 页面内容窗口化
 * 项目卡片点击 → 打开博客窗口对应文章（跨窗口导航）
 */
export function AboutApp() {
  const { locale } = useI18n();
  const t = (key: string) => resolveMessage(locale, key);
  const wm = useWindowManager();

  const skills = (
    resolveRaw(locale, "about.skills.list") as string[]
  ).filter((s): s is string => typeof s === "string");
  const advantages = resolveRaw(locale, "about.advantages.list") as Advantage[];
  const jobs = resolveRaw(locale, "about.experience.jobs") as JobItem[];
  const projects = resolveRaw(locale, "about.projects.list") as ProjectItem[];

  return (
    <div className="p-4 lg:p-8">
      {/* 个人头部 */}
      <header>
        <h2 className="font-bold tracking-tight text-text">{contact.name}</h2>
        <p className="mt-2 text-base text-muted">{t("about.subtitle")}</p>
        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-muted sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <dt className="text-faint">{t("about.contact.labels.email")}</dt>
            <dd>
              <a
                href={`mailto:${contact.email}`}
                className="transition-colors duration-150 hover:bg-accent hover:text-on-accent"
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
          <div className="flex items-center gap-2">
            <dt className="text-faint">
              {t("about.contact.labels.telegram")}
            </dt>
            <dd>
              <a
                href={`https://t.me/${contact.telegram.slice(1)}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:bg-accent hover:text-on-accent"
              >
                {contact.telegram}
              </a>
            </dd>
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
              className="border-[3px] border-border bg-surface p-4 shadow-neu-sm"
            >
              <h4 className="text-sm font-semibold text-text">{adv.title}</h4>
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
              <span className="absolute -left-[1.805rem] top-1 size-2.5 bg-accent" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-base font-semibold text-text">
                  {job.company}
                </h4>
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
                    <span className="mt-1.5 size-1 shrink-0 bg-border" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      {/* 项目经历 */}
      <Section id="projects" title={t("about.projects.title")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.name}
              className="flex flex-col border-[3px] border-border bg-surface p-5 shadow-neu transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg"
            >
              <div className="flex items-start justify-between gap-2">
                {projectSlugs[project.name] ? (
                  <h4 className="text-base font-semibold text-text transition-colors duration-150 hover:bg-accent hover:text-on-accent">
                    <button
                      type="button"
                      className="cursor-pointer"
                      onClick={() =>
                        wm.open("blog", { slug: projectSlugs[project.name] })
                      }
                    >
                      {project.name} →
                    </button>
                  </h4>
                ) : (
                  <h4 className="text-base font-semibold text-text">
                    {project.name}
                  </h4>
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
                    <span className="mt-1.5 size-1 shrink-0 bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
