# Spec Delta

## Purpose

在首页顶部展示横向滚动的技能标签列表，采用 neubrutalism 风格的跑马灯效果。该组件用于向访客展示开发技能，增强品牌辨识度。

## ADDED Requirements

### Requirement: 水平滚动技能列表

跑马灯 SHALL 以水平滚动方式展示技能关键词，循环播放且不间断。

#### Scenario: 首次加载跑马灯
- **WHEN** 用户访问首页
- **THEN** 屏幕顶部出现黑底横条，技能列表从右向左循环滚动

#### Scenario: 暂停效果
- **WHEN** 用户将鼠标悬停在跑马灯上方
- **THEN** 动画暂停，保持当前位置

### Requirement: 硬朗视觉风格

跑马灯 SHALL 采用 neubrutalism 的硬朗视觉设计：黑色背景、白色文字、硬边框分割。

#### Scenario: 背景颜色
- **WHEN** 渲染跑马灯组件
- **THEN** 背景为 `#000000`（纯黑），文字为 `#FFFFFF`（纯白）

#### Scenario: 点缀颜色
- **WHEN** 渲染跑马灯中的小圆点
- **THEN** 小圆点填充为黄色 `#FFD23F`

### Requirement: 动画时长

跑马灯 SHALL 在 25 秒内完成一次完整的左右循环。

#### Scenario: 动画周期
- **WHEN** 跑马灯开始滚动
- **THEN** 整个技能列表从可见区域完全移出后，再从右边缘重新进入，循环次数为 25 秒一次

### Requirement: 空格分隔项目

每个技能标签 SHALL 与下一个标签之间保持 2 倍发色分隔。

#### Scenario: 项目间距
- **WHEN** 多个技能标签水平排列
- **THEN** 相邻标签之间有固定的 2rem 间距，并伴随小圆点分隔

### Requirement: 响应式回退

在极宽屏幕下，跑马灯 SHALL 保证所有内容可见且可交互。

#### Scenario: 大屏幕适配
- **WHEN** 用户在宽屏设备上访问
- **THEN** 跑马灯容器宽度自适应，内容水平滚动不被遮挡