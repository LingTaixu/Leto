# Tasks

## 1. Footer 样式改造 (浅色主题)

- [ ] 1.1 更新 `components/Footer.tsx`：从 `bg-black text-white` 改为 `bg-surface text-text`。**验证**：页脚背景为白色，文字为黑色。
- [ ] 1.2 验证 GitHub/RSS 链接在悬停时的黄色高亮效果。**验证**：链接颜色从 `text-accent` 悬停到 `bg-accent text-on-accent`。

## 2. Marquee 样式改造 (浅色主题)

- [ ] 2.1 更新 `app/globals.css`：从黑底白字改为白底黑字 + 4px 硬边框。**验证**：`.marquee` 背景为 `var(--surface)`，文字为 `var(--text)`。
- [ ] 2.2 调整动画时长：从 25s 改为 30s（更适合中文技能词）。**验证**：动画更平稳，不会太快。
- [ ] 2.3 验证跑马灯在首页顶部正确显示。**验证**：刷新首页，跑马灯位于首屏顶部。

## 3. TabBar 指示条风格优化

- [ ] 3.1 更新 `components/TabBar.tsx`：将活跃指示条从 `rounded-full` 改为 `rounded-sm`。**验证**：指示条显示为小圆角方块。

## 4. Tag 组件 hover 动画增强

- [ ] 4.1 更新 `components/Tag.tsx`：添加 hover 上浮 + 阴影放大的动画效果。**验证**：标签悬停时有 2px 上浮 + 阴影放大效果。
- [ ] 4.2 添加 active 下压动画。**验证**：点击标签时有下压消影效果。

## 5. 全局检查与构建验证

- [ ] 5.1 检查 Tailwind 配置：确保 `--border`、`--surface`、`--text` 变量正确映射。**验证**：`globals.css` 中 `@theme inline` 块完整。
- [ ] 5.2 全站测试：手动检查所有路由的视觉效果。**验证**：首页、关于页、博客页、Web3 首页、K 线页、转账页、存证页、页脚、跑马灯都显示一致的浅色 neubrutalism 风格。
- [ ] 5.3 构建验证：`npm run build` 成功，无错误。**验证**：终端无 TypeScript 警告，`.next` 目录生成成功。