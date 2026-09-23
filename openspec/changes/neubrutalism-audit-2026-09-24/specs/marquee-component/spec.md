# Marquee Component Style Specification

## Overview

Marquee 组件（跑马灯）用于首页展示技能列表。当前使用深色主题（黑底白字），需要改造为浅色 neubrutalism 风格。

## Visual Design

### Current (Incorrect)
```
背景色：#000000 (black)
文字色：#ffffff (white)
底部分割线：4px 黑色
黄色方点：#FFD23F
滚动动画：25s 一轮
```

### Target (Neubrutalism)
```
背景色：#ffffff (white) = var(--surface)
文字色：#000000 (black) = var(--text)
底部分割线：4px 黑色 #000000 = var(--border)
黄色方点：#FFD23F = var(--accent)
滚动动画：30s 一轮（更适合中文字符）
硬边框：容器边框 3px
```

## Implementation

### Code Changes

**File**: `components/Marquee.tsx`

```diff
- /**
-  * 跑马灯（neubrutalism）
-  * 黑底白字 + 黄色方点分隔，水平循环滚动（25s 一轮，悬停暂停）。
+ /**
+  * 跑马灯（neubrutalism 版）
+  * 白底黑字 + 3px 硬边框 + 黄色方点分隔，水平循环滚动（30s 一轮，悬停暂停）。
   * 纯 CSS 实现（样式见 app/globals.css `.marquee*`），零依赖。
   *
   * @param skills 技能关键词列表
   */
  export function Marquee({ skills }: { skills: string[] }) {
    if (skills.length === 0) return null;
    return (
-     <div className="marquee">
+     <div className="marquee">
        <div className="marquee-track">
          <MarqueeContent skills={skills} />
          {/* 第二份用于无缝循环（translateX -50%），对读屏隐藏 */}
          <MarqueeContent skills={skills} ariaHidden />
        </div>
      </div>
    );
  }
```

**File**: `app/globals.css`

```css
/* Marquee 跑马灯（首页技能展示）- Neubrutalism 版 */
.marquee {
  background: var(--surface);      /* 白底 */
  color: var(--text);              /* 黑字 */
  border-bottom: 4px solid var(--border);
  padding: 0.75rem 0;
  overflow: hidden;
  white-space: nowrap;
}

.marquee-track {
  display: inline-flex;
  animation: marquee 30s linear infinite;  /* 调整为 30s，更适合中文 */
}

.marquee-content {
  display: inline-flex;
  align-items: center;
  gap: 2rem;
  padding-right: 2rem;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.marquee-dot {
  width: 8px;
  height: 8px;
  background: var(--accent);
  flex-shrink: 0;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
```

## Validation Criteria

- [ ] Marquee 背景为白色
- [ ] Marquee 文字为黑色
- [ ] 底部 4px 黑色分割线可见
- [ ] 黄色方点点间距适中
- [ ] 滚动动画平滑进行中（默认状态）
- [ ] 悬停任意区域后动画暂停
- [ ] 刷新首页，跑马灯位于首屏顶部
- [ ] `npm run build` 成功

## Notes

- 动画时长调整为 30s，考虑中文技能词的滚动可读性
- 保持原有的「无缝循环」技术（双Content渲染 + translateX(-50%)）
- 硬边框通过 border-bottom 实现，保持 neubrutalism 风格