---
title: "IP Strategy Backend Service: Building the Strategy Minting API with Express 5 + Sequelize"
summary: "Building the backend from scratch for an IP asset tokenization platform: Express 5 + Sequelize + PostgreSQL data layer, JWT auth and validation middleware chain, and complete CRUD design for on-chain strategies and NFT history records."
date: "2026-09-16"
tags: ["node","web3","后端"]
readMin: 10
---

## Project Positioning

`ip-strategy-base-service` is the foundational backend service of the IP Strategy platform. It is responsible for three things: **user authentication**, **lifecycle management of strategies**, and **recording and querying IP/NFT transaction history**.

The technology choices lean toward "stability" rather than "novelty" — using the most mature Express + Sequelize combination to contain the complexity of on-chain interaction on the server side.

## Tech Stack Overview

| Layer | Choice | Description |
| --- | --- | --- |
| Runtime | Bun + TypeScript | Executes `.ts` directly, no compilation needed during development |
| Web framework | Express 5 | Native support for async error bubbling, no more try/catch wrappers |
| ORM | Sequelize 6 | Connects to PostgreSQL via `pg` / `pg-hstore` |
| On-chain SDK | @coral-xyz/anchor | Solana program interaction |
| Asset query | opensea-js + viem | NFT ownership queries and EVM read-chain |
| Logging | winston + morgan | Structured logging + HTTP access logs |

## Route Design: Split by Resource Domain

The entry point `src/app.ts` only does assembly; business routes are mounted by resource dimension, keeping each controller's responsibility single:

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

Note that `strategies` (public list) and `self_strategies` (my strategies) are split into two endpoints rather than distinguished by query parameters — this allows the auth middleware to be mounted precisely, avoiding the common pitfall of "private logic mixed into a public interface."

## Middleware Chain: Separate Auth from Validation

We split cross-cutting concerns into three independent middlewares, composed as needed:

```
// 1. JWT auth — parse and attach req.user
jwtChecker

// 2. Parameter validation — express-validator, direct 400 on failure
validate(parseCreateStrategyTxReqValidators)

// 3. Unified error handling — mounted at the end of the route
app.use(customErrorMiddleware);
```

This linear chain of "auth → validation → business" lets controllers assume the input is always valid, greatly reducing defensive code.

## On-chain Interaction: Decouple for Solvability

The essence of strategy creation is "recording an on-chain transaction": the frontend signs with the wallet and submits the transaction hash, then the backend persists it and verifies asynchronously. The data model is therefore built around `txHash`, and the strategy is only marked valid after verification passes.

> Key design: **persist first, verify later**. On-chain confirmation is inherently uncertain, and synchronous waiting would drag down API response times; by making verification a separate endpoint (`/strategy/:id/verify`), the frontend can poll or rely on scheduled tasks for compensation.

## NFT History CRUD

Transaction history is a high-frequency read/write scenario, providing four actions — create, read, update, delete — where all mutation operations require authentication:

```
POST /api/v1/nft_history            // create
POST /api/v1/nft_history/:id/update // update
POST /api/v1/nft_history/:id/delete // delete
GET  /api/v1/nft_histories          // list (paginated)
```

Mutation operations use `POST` instead of `PATCH/DELETE`, to accommodate restrictions some gateways and clients place on non-idempotent methods — a very common compromise in real deployments.

## Engineering Notes

-   **Uploads** use multer in a standalone `/upload` route, decoupled from business logic;
-   **Numeric handling** uses `decimal.js` + `bn.js` to keep floating-point errors from eroding asset calculations;
-   **Address encoding** uses `bs58`, compatible with Solana's Base58 format;
-   **Environment config** is centralized in `src/config.ts`, eliminating scattered `process.env` usage.

The value of a backend service lies not in how many new frameworks it uses, but in **containing uncertainty (on-chain, network, third-party APIs) within controllable boundaries**. The layering of this service is designed precisely around that goal.