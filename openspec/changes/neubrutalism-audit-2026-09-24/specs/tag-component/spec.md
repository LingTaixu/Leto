# Tag Component Style Specification

## Overview

Tag 组件目前已符合 neubrutalism 风格，但可以进一步优化 hover 动画效果，添加「硬阴影上浮」效果。

## Visual Design

### Current
```
边框：3px 黑色 #000000
背景：白色 #ffffff
圆角：0.25rem (rounded-sm)
字体：monospace, 12px, 粗体
Hover：背景变黄 #FFD23F，文字变黑
阴影：hover 时 3px 硬阴影
```

### Target (Optimization)
```
边框：3px 黑色 #000000
背景：白色 #ffffff
圆角：0.25rem (rounded-sm)
字体：monospace, 12px, 粗体
Hover：背景变黄 #FFD23F，文字变黑 + 2px 上浮 + 阴影放大
Active：下压消影
```

## Implementation

### Code Changes

**File**: `components/Tag.tsx`

```diff
   const base =
-    "inline-flex items-center border-[3px] border-border bg-surface px-2.5 py-1 rounded-sm font-mono text-xs font-bold text-text transition-all duration-100 hover:bg-accent hover:text-on-accent hover:shadow-neu-sm";
+    "inline-flex items-center border-[3px] border-border bg-surface px-2.5 py-1 rounded-sm font-mono text-xs font-bold text-text transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-neu-sm";
```

## Validation Criteria

- [ ] Tag 默认状态：白底黑字，3px 黑边
- [ ] 悬停时：黄底黑字，缓慢上浮，阴影放大
- [ ] 点击时：下压消失
- [ ] 保持 monospace 字体风格
- [ ] `npm run build` 成功