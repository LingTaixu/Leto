---
title: "IP Strategy 后端服务：Express 5 + Sequelize 构建策略铸造 API"
summary: "为 IP 资产代币化平台从零搭建后端：Express 5 + Sequelize + PostgreSQL 数据层、JWT 鉴权与校验中间件链、Solana 链上策略与 NFT 历史记录的完整 CRUD 设计。"
date: "2026-09-16"
tags: ["node","web3","后端"]
readMin: 10
---

## 项目定位

`ip-strategy-base-service` 是 IP Strategy 平台的后端基础服务。它承担三件事：**用户鉴权**、**策略（Strategy）的生命周期管理**，以及 **IP/NFT 交易历史**的记录与查询。

技术选型偏向「稳」而非「新」——用最成熟的 Express + Sequelize 组合，把链上交互的复杂性收敛在服务端。

## 技术栈一览

| 层次 | 选型 | 说明 |
| --- | --- | --- |
| 运行时 | Bun + TypeScript | 直接执行 `.ts`，开发期免编译 |
| Web 框架 | Express 5 | 原生支持 async 错误冒泡，不再需要 try/catch 包装 |
| ORM | Sequelize 6 | 配合 `pg` / `pg-hstore` 连接 PostgreSQL |
| 链上 SDK | @coral-xyz/anchor | Solana 程序交互 |
| 资产查询 | opensea-js + viem | NFT 归属查询与 EVM 读链 |
| 日志 | winston + morgan | 结构化日志 + HTTP 访问日志 |

## 路由设计：按资源域拆分

入口 `src/app.ts` 只做装配，业务路由按资源维度挂载，保持每个 controller 的职责单一：

```
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/upload", uploadRouter);

// strategy
app.post("/api/v1/strategy", jwtChecker, validate(parseCreateStrategyTxReqValidators), strategyController.createStrategy);
app.get("/api/v1/strategy/:id", validate(findStrategyByIdParamValidators), strategyController.findStrategyById);
app.post("/api/v1/strategy/:id/verify", jwtChecker, validate(verifyStrategyValidators), strategyController.verifyStrategy);
app.get("/api/v1/strategies", strategyController.listStrategies);
app.get("/api/v1/self_strategies", jwtChecker, strategyController.listSelfStrategies);
```

注意 `strategies`（公开列表）与 `self_strategies`（我的策略）被拆成两个端点，而不是靠 query 参数区分——这样鉴权中间件可以精确挂载，避免「公开接口里混入私有逻辑」的常见坑。

## 中间件链：鉴权与校验分离

我们把横切关注点拆成三个独立中间件，按需组合：

```
// 1. JWT 鉴权 —— 解析并挂载 req.user
jwtChecker

// 2. 参数校验 —— express-validator，校验失败直接 400
validate(parseCreateStrategyTxReqValidators)

// 3. 统一错误处理 —— 挂在路由最后
app.use(customErrorMiddleware);
```

这种「鉴权 → 校验 → 业务」的线性链条，让 controller 内部可以假定输入一定合法，大幅减少防御性代码。

## 链上交互：求解耦

策略创建的本质是「记录一笔链上交易」：前端在钱包签名后提交交易哈希，后端落库并异步验证。因此数据模型围绕 `txHash` 建立，验证通过后才把策略标记为有效。

> 关键设计：**先落库、后验证**。链上确认存在不确定性，同步等待会拖垮接口响应；把验证做成独立端点（`/strategy/:id/verify`）后，前端可以轮询或由定时任务补偿。

## NFT 历史记录 CRUD

交易历史是高频读写场景，提供增删改查四个动作，其中变更操作全部要求鉴权：

```
POST /api/v1/nft_history            // 新增
POST /api/v1/nft_history/:id/update // 更新
POST /api/v1/nft_history/:id/delete // 删除
GET  /api/v1/nft_histories          // 列表（分页）
```

变更类操作使用 `POST` 而非 `PATCH/DELETE`，是为了兼容部分网关与客户端对非幂等方法的限制——这是实际部署中很常见的妥协。

## 工程化小结

-   **上传**用 multer 独立成 `/upload` 路由，与业务解耦；
-   **数值处理**用 `decimal.js` + `bn.js`，避免浮点误差侵蚀资产计算；
-   **地址编码**用 `bs58`，兼容 Solana 的 Base58 格式；
-   **环境配置**集中在 `src/config.ts`，杜绝散落的 `process.env`。

后端服务的价值不在于用了多少新框架，而在于**把不确定性（链上、网络、第三方 API）收敛在可控的边界内**。这套服务的分层，就是围绕这个目标设计的。
