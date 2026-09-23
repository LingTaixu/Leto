# Tab Bar Component Style Specification

## Overview

Tab 栏的活跃指示条目前使用圆形（`rounded-full`），建议改为更贴合 neubrutalism风格的方形（`rounded-sm`）。

## Visual Design

### Current
```
指示条样式：圆形 (rounded-full)
背景色：黄色 #FFD23F
边框：2px 黑色 #000000
```

### Target
```
指示条样式：小圆角方块 (rounded-sm)
背景色：黄色 #FFD23F
边框：2px 黑色 #000000
```

## Implementation

### Code Changes

**File**: `components/TabBar.tsx`

```diff
         {/* 黄色滑动指示条：激活时滑动，无匹配 tab 时淡出 */}
         <div
           aria-hidden="true"
-          className="pointer-events-none absolute inset-y-2 left-2 rounded-full border-2 border-border bg-accent transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
+          className="pointer-events-none absolute inset-y-2 left-2 rounded-sm border-2 border-border bg-accent transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
           style={{
             width: "calc((100% - 1rem) / 3)",
             transform: `translateX(${indicatorIndex * 100}%)`,
             opacity: hasActive ? 1 : 0,
           }}
         />
```

## Validation Criteria

- [ ] 活动指示条显示为小圆角方块
- [ ] 指示条在切换时平滑滑动
- [ ] 无活动项时指示条淡出
- [ ] 保持原有的 hover / active 动画
- [ ] `npm run build` 成功

## Notes

- `rounded-full` 改为 `rounded-sm`，更贴合 neubrutalism的「硬边框」美学
- 保持 2px 黑色边框，强调「硬边框」感觉
- 动画效果不变