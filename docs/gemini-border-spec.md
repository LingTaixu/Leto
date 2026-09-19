# Gemini 动态流光边框设计技术文档 (Gemini Border-Only Rotation Spec)

> **设计目标**：实现仅卡片边框（Border）进行七彩渐变旋转动画，而卡片内部的背景、文字及交互元素保持绝对静止，避免背景色“漏光”或视觉晃动，提供极致精致的科技感。

---

## 1. 痛点分析与视觉原理

### 1.1 传统方案痛点 (Leakage Problem)
如果将旋转的 `conic-gradient` 放在卡片的伪元素 `::before`（`inset: -2px`）上，且卡片自身使用半透明毛玻璃背景（如 `bg-surface/75 backdrop-blur`）：
*   **漏光现象**：旋转的七彩光带会透过半透明的卡片背景，导致整个卡片内部“群魔乱舞”，文字可读性极差。
*   **不规则裁剪**：在部分浏览器中，由于 `inset` 与 `border-radius` 的缩放比例微差，边框粗细会随旋转发生抖动。

### 1.2 正确的“遮罩与裁剪”原理 (Border-Only Masking)
为了让**仅有 1.5px/2px 的边框旋转**，我们采用“三层套娃”或“反向遮罩”结构：

```
┌────────────────────────────────────────────────────────┐
│  1. 外部裁剪框 (overflow-hidden, relative, rounded-2xl)│
│  ┌──────────────────────────────────────────────────┐  │
│  │  2. 极光旋转盘 (conic-gradient, rotate animation)│  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  3. 内部静止底盒 (bg-surface, rounded-2xl)  │  │  │
│  │  │     └─► 所有的文字、标签、正文内容 (静态)    │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

1.  **最外层 (Outer Container)**：控制卡片尺寸与圆角（如 `rounded-2xl`），开启 `overflow-hidden`。
2.  **流光旋转盘 (Animated Orbit)**：尺寸扩展至最外层的 `inset-[-100%]`（防止旋转时四个角露出空白），使用 `conic-gradient` 渲染 Gemini 彩虹流光，并进行 **360° 无限循环旋转**。
3.  **内层静态容器 (Inner Content Box)**：绝对定位或 Padding 撑开，背景使用**不透明或高度不透明的 `var(--surface)`**，设置比外层稍小的圆角。它像一个“盖子”盖在旋转盘中央，只露出一圈 `1.5px` 的外边缘。由于它完全静止且不透光，流光便**被完美锁在 1.5px 的边框线内**。

---

## 2. Design Tokens 与动画配置

### 2.1 旋转动画帧 (Hardware-Accelerated Spin)
为了消除 CPU 渲染抖动，必须使用 `transform: rotate` 强制启用 GPU 加速。

```css
@keyframes gemini-border-spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
```
> *注：使用 `translate(-50%, -50%)` 是因为旋转圆盘采用绝对定位 `top-1/2 left-50%` 以确保其旋转轴心与卡片几何中心完美重合。*

### 2.2 旋转速度定义
*   **常态 (Default)**：`8s` 匀速旋转，提供呼吸感而不显刺眼。
*   **悬停 (Hover)**：`4s` 匀速旋转，流光加速闪烁，传达饱满的物理响应。

---

## 3. 极简现代的 HTML/CSS 结构实现

### 3.1 纯 CSS 类定义 (Utility Classes)

在 `app/globals.css` 中增加以下专用规则：

```css
/* 外层：负责卡片的大小、圆角、遮罩 */
.gemini-border-container {
  position: relative;
  border-radius: 1rem; /* 16px */
  padding: 1.5px;      /* 这就是边框的粗细！极其精准 */
  overflow: hidden;
  background: var(--border); /* 兜底静态边框色 */
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* 旋转流光盘：隐藏在内盒之下，只有 1.5px 边缘可见 */
.gemini-border-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300%; /* 大于对角线，防止四个角露白 */
  height: 300%;
  background: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    var(--gemini-1) 45deg,
    var(--gemini-2) 90deg,
    transparent 135deg,
    var(--gemini-3) 180deg,
    var(--gemini-4) 225deg,
    transparent 270deg,
    var(--gemini-5) 315deg,
    transparent 360deg
  );
  transform: translate(-50%, -50%) rotate(0deg);
  animation: gemini-border-spin 8s linear infinite;
  pointer-events: none;
  z-index: 1;
}

/* 内盒：承载文字，覆盖在流光盘之上 */
.gemini-border-content {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--surface); /* 纯色不透明盖板，确保中间不漏光 */
  border-radius: calc(1rem - 1.5px); /* 圆角补偿公式，确保圆角平行 */
  z-index: 2;
  transition: background-color 0.3s ease;
}

/* 悬停微调 */
.gemini-border-container:hover {
  transform: translateY(-2px);
}

.gemini-border-container:hover .gemini-border-orbit {
  animation-duration: 4s; /* 悬停时流速加快 */
}
```

---

## 4. Standalone React 组件应用

重构后的 React 组件代码示范：

```tsx
export function ArticleCard({ article }) {
  return (
    <div className="gemini-border-container group">
      {/* 1. 旋转的流光盘（只提供边框背景） */}
      <div className="gemini-border-orbit" aria-hidden="true" />
      
      {/* 2. 静态的内盒（所有的内容保持静止） */}
      <div className="gemini-border-content p-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.tags.map(tag => (
            <span key={tag} className="text-xs">#{tag}</span>
          ))}
        </div>
        <h3 className="mt-3 text-lg font-bold">
          <Link href={`/blog/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="mt-2 text-muted">{article.summary}</p>
      </div>
    </div>
  );
}
```

---

## 5. 验收标准与测试保障 (DoD)

1.  **卡片文字/背景完全静止**：在任何角度下，卡片内部的 `background-color` 与文本内容绝对不会产生扭曲或颜色漏出。
2.  **不透光检查**：使用截图或屏幕放大镜，放大卡片内部 100px×100px 区域，检查其 RGB 色值。其色值必须是纯净的 `var(--surface)`，不能有任何受底层流光影响的杂色。
3.  **减弱动态效果适配**：开启 `prefers-reduced-motion` 后，`gemini-border-orbit` 的 `animation` 必须被停止，转为静态的彩色边框。
