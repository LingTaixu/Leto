# Tasks

## 1. 焦点环颜色统一迁移

- [x] 1.1 更新 `components/Button.tsx`：`focus-visible:outline-accent` → `focus-visible:outline-[var(--border)]`。**验证**：Tab 键可见 3px 黑色焦点环
- [x] 1.2 更新 `components/Pagination.tsx`：同上。**验证**：分页按钮焦点环为黑色
- [x] 1.3 更新 `components/not-found.tsx`：同上。**验证**：404 页面按钮焦点环为黑色
- [x] 1.4 更新 `components/kline/KlineView.tsx`：`focus:outline-accent` → `focus:outline-[var(--border)]`。**验证**：Kline 控件输入框焦点环为黑色
- [x] 1.5 更新 `components/notary/StoreCard.tsx` 输入框：同上。**验证**：StoreCard 输入框焦点环为黑色
- [x] 1.6 更新 `components/BackToTop.tsx` 返回顶部按钮：`focus-visible:ring-accent` → `focus-visible:outline-[var(--border)]`（spec 覆盖所有可聚焦元素，验收阶段发现的遗漏）。**验证**：触屏设备键盘聚焦时黑色焦点环

## 2. 文本颜色合规化

- [x] 2.1 为 success 定义 `success-dark`：`#1b5e20` → Tailwind 颜色变量**验证**：`text-success-dark` 生效
- [x] 2.2 为 error 定义 `error-dark`：`#b71c1c` → Tailwind 颜色变量**验证**：`text-error-dark` 生效
- [x] 2.3 替换 `app/[locale]/web3/transfer/page.tsx` 中的 `text-success` / `text-error` 用例。**验证**：成功/错误消息文本颜色为深绿/深红
- [x] 2.4 替换 `app/[locale]/page.tsx`、`app/[locale]/about/page.tsx` 中滞留的 `text-accent` 文字用例（仅用作装饰）

## 3. 标题尺寸与字体统一

- [x] 3.1 更新 `app/globals.css` 中的标题尺寸变量：h1 3rem、h2 2rem、h3 1.5rem、h4 1.25rem**验证**：浏览器开发者工具中 H1-H4 尺寸相符
- [x] 3.2 更新标题 weight：h1 bold、h2/h3 semibold、h4 medium**验证**：字体粗细层次分明
- [x] 3.3 同步 Syne 字体在副标题中的使用：`font-display` 用于 h2-h6，`font-heading` 用于 h1**验证**：H2 文字使用 Syne，H1 使用 Space Grotesk
- [x] 3.4 查找并 fix 遗漏的标题用例（如 blog slug、kline 等）

## 4. Prose 容器宽度

- [x] 4.1 更新 `components/Prose.tsx`：添加 `max-w-[68ch] mx-auto`**验证**：博客文章正文宽度约 48rem
- [x] 4.2 确认所有使用 Prose 的地方（blog）容器宽度统一**验证**：无多余/冲突宽度类

## 5. 验证与回归

- [x] 5.1 运行 `npm run build` 确认 TypeScript 零错误**验证**：构建成功
- [ ] 5.2 浏览器手动验证 7 条路由：首页、关于、博客列表、博客文章、Web3、K线、存证、转账**验证**：无明显布局错位，焦点环、标题、颜色均符合 spec
- [ ] 5.3 可访问性检查：焦点环可见、文本对比度合规（可用 axe-core 或手工检查）