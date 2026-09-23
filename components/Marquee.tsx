function MarqueeContent({
  skills,
  ariaHidden = false,
}: {
  skills: string[];
  ariaHidden?: boolean;
}) {
  return (
    <div className="marquee-content" aria-hidden={ariaHidden || undefined}>
      {skills.map((skill) => (
        <span key={skill} className="inline-flex items-center gap-8">
          <span>{skill}</span>
          <span className="marquee-dot" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

/**
 * 跑马灯（neubrutalism）
 * 黑底白字 + 黄色方点分隔，水平循环滚动（25s 一轮，悬停暂停）。
 * 纯 CSS 实现（样式见 app/globals.css `.marquee*`），零依赖。
 *
 * @param skills 技能关键词列表
 */
export function Marquee({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <div className="marquee">
      <div className="marquee-track">
        <MarqueeContent skills={skills} />
        {/* 第二份用于无缝循环（translateX -50%），对读屏隐藏 */}
        <MarqueeContent skills={skills} ariaHidden />
      </div>
    </div>
  );
}
