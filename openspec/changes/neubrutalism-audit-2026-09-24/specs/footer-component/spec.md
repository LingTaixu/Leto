# Footer Component Style Specification

## Overview

Footer 组件需要从深色主题（黑底白字）改造为浅色 neubrutalism 风格，维护视觉一致性。

## Visual Design

### Current (Incorrect)
```
背景色：#000000 (black)
文字色：#ffffff (white)
底部分割线：4px 黑色
链接高亮：黄色 #FFD23F
```

### Target (Neubrutalism)
```
背景色：#ffffff (white) = var(--surface)
文字色：#000000 (black) = var(--text)
底部分割线：4px 黑色 #000000 = var(--border)
链接高亮：黄色 #FFD23F = var(--accent)
```

## Implementation

### Code Changes

**File**: `components/Footer.tsx`

```diff
  export function Footer() {
    const { t } = useI18n();

    return (
-     <footer className="mt-16 border-t-[4px] border-border bg-black text-white">
+     <footer className="mt-16 border-t-[4px] border-border bg-surface text-text">
        <div className="mx-auto flex w-full max-w-[62.5rem] flex-col items-center gap-2 px-6 py-8 text-sm md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Leto · {t("footer.copyright")}</p>
          <div className="flex items-center gap-4">
            <LocaleSwitch />
            <Link
              href="https://github.com/LingTaixu"
              target="_blank"
              rel="noreferrer"
              className="text-accent transition-colors duration-100 hover:bg-accent hover:text-on-accent"
            >
              {t("footer.github")}
            </Link>
            <Link
              href="/rss.xml"
              className="text-accent transition-colors duration-100 hover:bg-accent hover:text-on-accent"
            >
              {t("footer.rss")}
            </Link>
          </div>
        </div>
      </footer>
    );
  }
```

## Validation Criteria

- [ ] Footer 背景为白色
- [ ] Footer 文字为黑色
- [ ] 底部 4px 黑色分割线可见
- [ ] GitHub/RSS 链接在悬停时显示黄色背景 + 黑字
- [ ] `npm run build` 成功
- [ ] 在所有路由底部看到统一的 footer 样式

## Notes

- 保持原有的布局结构不变
- 保持原有的 i18n 文本 key 不变
- accent 颜色 #FFD23F 保持作为黄色高亮