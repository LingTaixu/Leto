# Tasks

## 1. 字体引入与 CSS 变量替换

- [x] 1.1 更新 `app/layout.tsx`：引入 Syne、Space Grotesk、Space Mono 字体变量。**验证**：`npm run dev` 启动后，控制台无 404 字体错误，页面加载成功。
- [x] 1.2 重写 `app/globals.css`：替换为 neubrutalism CSS 变量，删除暗黑模式规则。**验证**：`npm run build` 成功编译，`globals.css` 中无 `@media (prefers-color-scheme: dark)` 块。

## 2. 核心组件样式改造

- [x] 2.1 更新 `components/Button.tsx`：改为硬边框 + 硬阴影 + 0 圆角。**验证**：按钮悬停有 2px 上浮 + 阴影放大，点击下压。
- [x] 2.2 更新 `components/ArticleCard.tsx`：移除 Gemini 动画边框，改为纯硬边框。**验证**：卡片无旋转动画，边框为 `3px solid #000`，阴影为 `5px 5px 0 0 #000`。
- [x] 2.3 更新 `components/TabBar.tsx`：改为硬边框胶囊风格（保持圆形，但边框变黑）。**验证**：标签栏背景为白，边框为 3px 黑线，激活态黄色。
- [x] 2.4 更新 `components/Navigate.tsx`：Header 边框加粗，背景改为白。**验证**：顶部导航条有 4px 黑色底边框。
- [x] 2.5 更新 `components/Footer.tsx`：加强视觉层次，边框变粗。**验证**：页脚有 4px 黑色分割线。
- [x] 2.6 更新 `components/Skeleton.tsx`：玻璃糊 → 硬边框骨架屏。**验证**：加载时显示方块灰块，无透明效果。
- [x] 2.7 更新 `components/Tag.tsx`：玻璃泡 → 硬边框标签。**验证**：标签框有 `3px solid #000`，背景白色，圆角保留小圆角。
- [x] 2.8 更新 `components/Pagination.tsx`：分页按钮改为硬边框。**验证**：分页按钮有硬阴影，当前页高亮。

## 3. Web3 页面组件改造

- [x] 3.1 更新 `components/notary/StoreCard.tsx`：卡片改为硬边框 + 硬阴影。**验证**：存储卡片外观像纸质卡片。
- [x] 3.2 更新 `components/notary/Records.tsx`：表格卡片改为硬边框。**验证**：记录表格有粗边框。
- [x] 3.3 更新 `app/[locale]/web3/transfer/page.tsx` 中的 `BalanceCard`、`TransferCard`：表单卡片改为硬边框。**验证**：转账页面所有卡片都有硬边框。
- [x] 3.4 更新 `components/kline/KlineView.tsx`：K 线控件（区间按钮、币种选择）改为硬边框。**验证**：下拉框、区间按钮都有 `3px solid #000`。

## 4. ThreeScene 首屏动画改造

- [x] 4.1 更新 `components/boot/ThreeScene.tsx`：改造为硬朗风格。
  - 背景改为纯黑
  - 文字改为 Space Mono 800，黑字黄描边
  - 粒子颜色改为黄/粉/蓝硬色
  - 阴影从模糊光晕改为硬阴影
- **验证**：首屏加载时看到硬朗的「Leto」黑字白字，粒子呈方块或硬球形。

## 5. RainbowKit 主题配置

- [x] 5.1 更新 `app/providers.tsx`：RainbowKit 改为 `lightTheme` + `accentColor: "#FFD23F"`。**验证**：钱包连接按钮显示为黄色主题。
- [x] 5.2 移除 `components/boot/use-system-theme.ts`（如果仅用于暗黑模式）。**验证**：文件不再被引用。

## 6. 跑马灯组件

- [x] 6.1 创建 `components/Marquee.tsx`：纯 React + CSS 跑马灯组件。**验证**：组件接受 `skills: string[]` prop，渲染水平滚动的技能列表。
- [x] 6.2 添加 CSS 样式：`.marquee`、`.marquee-track`、`.marquee-content`、`.marquee-dot` 动画。**验证**：技能列表左-to-right 循环滚动，暂停停机。
- [x] 6.3 更新 `app/[locale]/page.tsx`：在首页最顶部引入跑马灯。**验证**：刷新首页，首屏出现跑马灯效果。

## 7. 全局检查与优化

- [x] 7.1 检查 Tailwind 配置：确保新字体变量被正确映射。**验证**：`@theme inline` 块包含 `--font-display`、`--font-heading`、`--font-mono`。
- [x] 7.2 移除未使用的暗黑模式样式：确保无 `--glass-*` 变量。**验证**：`globals.css` 无玻璃拟态样式。
- [ ] 7.3 全站测试：手动检查所有路由的视觉效果。**验证**：首页、关于页、博客页、Web3 首页、K 线页、转账页、存证页都显示硬边框 + 硬阴影。
- [ ] 7.4 构建验证：`npm run build` 成功，无警告。**验证**：终端无错误，`.next` 目录生成成功。
