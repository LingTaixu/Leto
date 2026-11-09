---
title: "dsh-qq 调试手册：QQ 机器人全链路排障"
summary: "从 NapCat 协议端、dsh-qqbot 插件到模型网关，记录 QQ 机器人不回复、扫码登录、GPU 崩溃、模型路由缓存与会话上下文丢失的排查步骤、日志位置和恢复方法。"
date: "2026-11-09"
tags: ["qqbot", "排障", "运维"]
readMin: 20
---

> 本文记录指定部署环境在 2026-11-09 的排障经验与现场基线；服务状态、配置支持范围和故障表现均以当时环境为准。

面向这台机器（`hcss-ecs-0242`）上跑着的 QQ 机器人 `碎碎的小鱼(1160816904)`。
全部命令都在本机实测过，输出格式就是你会看到的格式。

---

## 0. 先看这里：30 秒定位法

机器人"不说话"时，按这个顺序逐层排查，**从下往上**（协议端 → 插件 → 模型），不要一上来就怀疑模型。

```bash
# 一条命令看全部
systemctl is-active napcat dsh-qqbot aihub-gateway mihomo
ss -ltnp | grep 3001
tail -3 /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log
```

三层各自的"正常长相"：

| 层 | 正常输出 | 不正常说明 |
|---|---|---|
| `napcat` | `active` **且** 3001 有监听 | 只有 active 不代表好，见 §2 |
| `dsh-qqbot` | `active` 且日志有 `已连接 ws://...` | 日志停在 `ECONNREFUSED` = 连不上协议端 |
| `aihub-gateway` | `active` 且网关日志有 `POST 200` | 有 4xx/5xx 才是模型层问题 |

**最常见的情况**：`napcat` 显示 `active`，但 3001 没监听。这种情况占本机历史故障的大头，直接跳 §2。

---

## 1. 全链路架构

```
手Q ──(QQ协议)──┐
                ├─→ NapCat (QQ客户端 + OneBot11 插件)
                │        │
                │        └─ WebSocket 127.0.0.1:3001 (token)
                │                │
                │                ▼
                │        dsh-qqbot (DSH profile: qqbot)
                │                │  dsh-qq-onebot 插件
                │                │
                │                ├─→ aihub-gateway 127.0.0.1:8898 ─→ https://aihub.top
                │                └─→ 会话/记忆/表情包 落盘 /root/dsh/qq-agent/sessions/
                │
                └─ WebUI 0.0.0.0:6099（NapCat 自己的管理面板，偶尔可用来救急）
```

关键事实：

- **NapCat 不调用任何大模型**，它只是把 QQ 协议翻译成 OneBot v11 JSON。模型调用全在 `dsh-qqbot` 里。
- 两个宿主进程：`dsh-web`（GUI，`uiOnly: true`）和 `dsh-qqbot`（workdir `/root/dsh/qq-agent`）。**只有 `dsh-qqbot` 连 NapCat。**
- 会话目录按对端隔离：`sessions/私聊_<QQ号>/`、`sessions/群_<群号>/`。

---

## 2. NapCat 层（协议端）—— 故障率最高

### 2.1 判断 NapCat 是否真的健康

`systemctl is-active napcat` **不可信**。QQ 客户端崩溃后进程可能还挂着，systemd 依然报 `active`。真正的判据是端口：

```bash
ss -ltnp | grep -E '3001|6099'
```

- **健康**：`LISTEN 127.0.0.1:3001 users:(("qq",pid=...))`
- **只有 6099**：进程活着但 OneBot 插件没起来 → 见 2.3
- **两个都没有**：进程彻底死了 → `systemctl restart napcat`

### 2.2 NapCat 日志在哪

```bash
journalctl -u napcat --since '-10min' --no-pager -o cat
```

**不要看 `/root/Napcat/napcat.log`** —— 这个文件在本机是"半死"的：从 2026-11-06 之后就再没写过（Chromium 崩溃后日志句柄没恢复）。真实日志只走 journal。

判断是否登录成功，看这三行：

```bash
journalctl -u napcat --since '-10min' --no-pager -o cat | grep -E '二维码解码URL|登录成功|OneBot11|WebSocket服务|登录态'
```

### 2.3 故障一：卡在扫码登录

**症状**

```
15:06:53 [info] QQ 1160816904 未配置回退密码环境变量，建议优先使用 ACCOUNT + NAPCAT_QUICK_PASSWORD，将使用二维码登录方式
15:06:53 [error] 快速登录错误： 登录态已失效，请重新登录。
15:06:53 [warn] 请扫描下面的二维码，然后在手Q上授权登录：
二维码解码URL: https://txz.qq.com/p?k=xxxx&f=1600001615
二维码已保存到 /root/Napcat/opt/QQ/resources/app/app_launcher/napcat/cache/qrcode.png
```

之后每秒刷一串 64 位十六进制 —— 那是**等待扫码的轮询心跳**，不是报错。

**怎么把二维码给用户**

```bash
# 1. 复制到可访问路径（原文件是 600，Web GUI 读不到）
cp -f /root/Napcat/opt/QQ/resources/app/app_launcher/napcat/cache/qrcode.png /root/dsh/qr-login.png
chmod 644 /root/dsh/qr-login.png

# 2. 抓最新的解码 URL（码会刷新，journal 里取最后一条）
journalctl -u napcat --since '-10min' --no-pager -o cat | grep -o 'https://txz.qq.com/p?k=[^ ]*' | tail -1
```

然后正文里用 `![QQ登录二维码](/root/dsh/qr-login.png)` 直接贴图。

**要点**

- 二维码约每分钟刷新一次，`qrcode.png` 是原地覆盖的，**必须在扫码前一刻才复制**。
- 图片读不进模型（当前模型不支持图像输入），但可以直接嵌 markdown 给用户看。
- 如果用户等太久说码过期了：`systemctl restart napcat`，约 25 秒后出新码，再复制一次。
- 扫码成功后**不必等插件自动重连**（它可能已经放弃，见 3.2），直接重启机器人更快。

**根治（可选，需用户同意）**：配 `NAPCAT_QUICK_PASSWORD` 环境变量，之后重启免扫码。

### 2.4 故障二：GPU 崩溃导致掉线

**这是本机 2026-11-08 那次 26 小时掉线的根因。**

`/root/Napcat/napcat.log` 尾部（虽然文件已停止写入，但能证明历史）：

```
ERROR:content/browser/gpu/gpu_process_host.cc:997] GPU process launch failed: error_code=1002
FATAL:content/browser/gpu/gpu_data_manager_impl_private.cc:415] GPU process isn't usable. Goodbye.
```

服务器没有 GPU，QQ 硬要启 GPU 进程，失败即 `Goodbye`。表现：进程还在，但登录态丢失、OneBot 消失。

**根治**（需用户同意，会重启 NapCat）：在 `/etc/systemd/system/napcat.service` 的 `ExecStart` 加 `--disable-gpu`。

**注意**：`--disable-gpu` 治的是"再次崩溃"，不能恢复已丢失的登录态。两者要分开做。

### 2.5 NapCat 配置

```
/root/Napcat/opt/QQ/resources/app/app_launcher/napcat/config/onebot11_1160816904.json
```

要确认的三项：

```bash
python3 -c "
import json
d=json.load(open('/root/Napcat/opt/QQ/resources/app/app_launcher/napcat/config/onebot11_1160816904.json'))
print(json.dumps(d['network']['websocketServers'], ensure_ascii=False, indent=2))
"
```

- `port` 必须 = `3001`
- `token` 必须 = `settings.json` 里的 `accessToken`
- **`messagePostFormat` 必须 = `array`**（选 `string` 会收到一堆 CQ 码原文，插件解析全废）

---

## 3. dsh-qqbot 层（插件）

### 3.1 日志在哪 —— 唯一有效的地方

```bash
/root/dsh/qq-agent/sessions/logs/dsh-qq-<YYYY-MM-DD>.log
```

**为什么不在 journal 里**：宿主 `dsh-qqbot` 用 `/root/.bun/bin/dsh` 启动，插件日志走的是插件自己的文件 logger（`src/index.js:68 makeLogger`）。`journalctl -u dsh-qqbot` 只有 systemd 的启动行和 `[llm-deepseek-api-key]` 噪声，**看不到任何业务日志**。别在那浪费时间。

日志级别三档：

| 级别 | 何时出现 | 用途 |
|---|---|---|
| `[info]` | 连接、会话、收发 | 日常追踪 |
| `[warn]` | 断连、限额、会话异常 | 故障信号 |
| `[debug]` | 仅 `settings.json` 里 `debug: true` 时 | 判定"为什么没理我" |

### 3.2 故障三：机器人连不上 / 不自动重连

**症状**

```
[warn] 与 NapCat 断开，稍后自动重连；后续重试不再逐条报，恢复时会通知
[warn] 与 NapCat 断开已持续约 1560 分钟，累计重试 3126 次，最近一次：connect ECONNREFUSED 127.0.0.1:3001
```

**实测坑**：2026-11-09 修复 NapCat 之后，机器人**没有**自动重连，累计重试到 3846 次仍在每 6 秒空转，日志停在 14:26 再无新行。自动重连不可靠。

**处理**：

```bash
systemctl restart dsh-qqbot
sleep 18
grep -E '已连接|登录账号' /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log | tail -3
```

正常应看到：

```
15:08:44 [info] QQ 互动工具已注册：qq_facts / qq_pin / ... （表情包收藏 N 个）
15:08:44 [info] 已连接 ws://127.0.0.1:3001
15:08:44 [info] 登录账号 碎碎的小鱼 (1160816904)
```

### 3.3 故障四："为什么它没理我"

先在 `settings.json` 打开 `debug`，然后看 `[debug]` 行：

```bash
grep '\[debug\]' /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log | tail -20
```

常见判定原因（原样摘自日志）：

```
[debug] [dsh-qq] 群 148688723 未 @ 且不在保活期，跳过
[debug] [dsh-qq] 群 148688723 保活窗里停太久（>5000ms），窗关掉，跳过
[debug] [dsh-qq] 群 1094505819 @ 的是别人，跳过
[debug] [dsh-qq] 忽略未授权 私聊 xxx
[debug] [dsh-qq] xxx 是同类机器人发言，「和同类聊天」没开，跳过
```

对照 `settings.json`：

| 现象 | 对应配置 |
|---|---|
| 群里不 @ 就不理 | `requireMention` / `groupWakeMs`（保活窗口） |
| 名字被叫了也不应 | `groupWakeNames`、`groupWakeProbability` |
| 私聊不回 | `privateMode` + `privateAllow` |
| 群里完全不响 | `groupMode` + `groupAllow` |
| 回了但内容空 | 模型返回了 `[SILENT]`，属正常沉默 |

**注意** `[SILENT]` 只对正常回复有效。**模型 API 抛的异常会被原样当成消息体发出去**，`[SILENT]` 拦不住。看到聊天里冒出英文报错，别以为是插件 bug，去看网关。

### 3.4 故障五：`Insufficient Balance` / 402

这是 2026-11-07 踩过的大坑，成因和修法都很反直觉，单独写清楚。

**症状**：私聊和群聊都在回 `⚠️ Insufficient Balance (request_id: ...)`，但网关日志里**没有任何请求**，或者请求打到的是 `deepseek-official`。

**根因是三层优先级，只看前两层会白忙**：

1. `settings.json` 里的 `provider`/`model` —— **完全无效**，被 `sanitizeOverrides` 剥掉。改它没有任何作用。
2. `cordis.patch.yml` 里 `dsh-qq` 行的 `config.provider/model` —— **有效**，会传到 `session.js` 的 `agentOptions`（日志里 `DIAG attach ... agentOptions={...}` 可验证）。但**依然会被第 3 层盖掉**。
3. **`session_projcache`** —— 真正的决定者。路径：

```
/root/.dsh/storages/session_projcache/sessions/<session-id>.json
```

其中 `record.model.rows.modelSelection.val = {"lastUsed": {"provider": ..., "model": ...}, "pending": null}`。
`model.current()` 返回 `pending ?? lastUsed`，**永远不回退到 `agentOptions`**；而 `model.select()` 发现和已记录的一致就 no-op，所以改配置也纠正不过来。

**关键误解**：直接改会话文件 `session.v4.jsonl.zstd` 里的 `request/header`（甚至改写 `request/context`）**没用**。projcache 是独立派生的，改了源文件它不知道。

**正确修法**：

```bash
systemctl stop dsh-qqbot

# 备份后删除
BK=/root/.dsh/storages/session_projcache.bak.$(date +%H%M)
mkdir -p "$BK"
cp -p /root/.dsh/storages/session_projcache/sessions/<id>.json "$BK"/
rm -f /root/.dsh/storages/session_projcache/sessions/<id>.json

systemctl start dsh-qqbot
```

**验证**：日志出现 `DIAG attach ... agentOptions={"provider":"aihub","model":"deepseek-v4.1-flash-1017"}`，紧接着网关日志出现 `POST /v1/chat/completions 200`。

### 3.5 故障六：会话"残留且恢复不了"

**症状**

```
[warn] [dsh-qq] 会话 356e5d63 残留且恢复不了（session "356e5d63-...-rmw5pxwzy" already exists），改用新 id 356e5d63-...-rmw8xab9t
```

**含义**：插件尝试 resume 老会话时，宿主报"already exists"（同一 id 被占），于是新建一个带 `-r<base36时间戳>` 后缀的会话顶上。

**后果**：会话链被切断成多段，**上下文丢失**。本机实测同一个私聊被切成三段：

```bash
# 看某对端有几代会话
find /root/.dsh/sessions -maxdepth 2 -type d -name '356e5d63*'
```

```
356e5d63-...-rmw5pxwzy-rmw8xab9t   18 条事件   ← 当前在用（几乎空）
356e5d63-...-rmw5pxwzy            473 条事件   ← 中间代
356e5d63-...                       334 条事件   ← 原始
```

**查账本**：

```bash
python3 -m json.tool /root/.dsh/dsh-qq/session-state.json
```

内容形如：

```json
{"gens": {}, "sessions": {
  "qq:1160816904:private:1950648905@iso": "356e5d63-...-rmw8xab9t",
  "qq:1160816904:group:1094770001@iso": "9efd82d9-...-rmw5oe6o6"
}}
```

**处理**：想恢复旧上下文，把 `sessions` 里的值改成目标代的 id（改成存在的、且事件多的那个），重启 `dsh-qqbot`。不想恢复就让新会话自然长起来。

**根治**：这个 `-r` 后缀增殖通常和上一次崩溃/强制 kill 有关。确认没有残留进程占着旧 id：

```bash
ps aux | grep 'dsh --profile qqbot' | grep -v grep
```

多余进程杀掉后再重启，能减少复发。

### 3.6 配置改动生效方式

| 改哪里 | 怎么生效 |
|---|---|
| `/root/.dsh/dsh-qq/settings.json` | **热生效**，不用重启 |
| `/root/.dsh/profiles/qqbot/cordis.patch.yml` | **必须** `systemctl restart dsh-qqbot` |
| `settings.json` 的 `debug` / `provider` / `model` | debug 热生效；后两个**改了也没用**（见 3.4） |

改 `cordis.patch.yml` 前先校验 YAML，否则机器人起不来：

```bash
python3 -c "import yaml;yaml.safe_load(open('/root/.dsh/profiles/qqbot/cordis.patch.yml'))" && echo "YAML OK"
```

**注意**：patch 行是**整段替换 `config`**，不是合并。写漏的字段会丢。

### 3.7 `settings.json` 里哪些键真的认

`src/settings.js` 有白名单，写进去不在名单里的键会被忽略（`debug: true` 时才打印 `设置里有不认识的键，忽略: ...`）。白名单含上方列出的配置项，但**不含** `cwd`、`groupWakeNames`、`groupWakeProbability`、`provider`、`model` 等——这些是历史遗留或走别的通道，别指望它们从设置页生效。

---

## 4. 模型层（网关）

### 4.1 健康检查

```bash
curl -s http://127.0.0.1:8898/__health
curl -s http://127.0.0.1:8899/__health     # linuxhub
```

### 4.2 看真实请求

```bash
journalctl -u aihub-gateway --since '-10min' --no-pager -o short-iso | grep POST | tail -5
```

- `POST /v1/chat/completions HTTP/1.1 200` = 模型层通
- `402` = 余额/路由问题（回看 §3.4）
- `403` = 可能 UA 被 WAF 拦，`GW_USER_AGENT=node` 已在服务里设好
- **完全没有 POST** = 请求根本没走到网关，问题在 §3.4 那三层

### 4.3 网关拓扑

| 网关 | 端口 | 上游 | 别名文件 |
|---|---|---|---|
| `aihub-gateway` | 8898 | `https://aihub.top` | `/etc/hub-gateway/aihub-aliases.json` |
| `hub-gateway` | 8899 | `https://hub.linux.do` | `/etc/hub-gateway/model-aliases.json` |

模型 id **大小写敏感**，已在网关侧做归一化。当前用 `aihub/deepseek-v4.1-flash-1017`。

---

## 5. 端到端验证一次完整回合

改完任何东西，用这条链路确认真的通：

```bash
# 1) 机器人连上了吗
grep -E '已连接|登录账号' /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log | tail -2

# 2) 发一条消息给机器人，然后看这三处
tail -5 /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log
journalctl -u aihub-gateway --since '-2min' --no-pager | grep POST | tail -2
tail -4 "/root/dsh/qq-agent/sessions/私聊_1950648905/聊天记录/$(date +%F).md"
```

一次干净回合的日志长相（本机 15:11 实测）：

```
15:11:22 [info] [dsh-qq] DIAG attach 356e5d63 agentOptions={"provider":"aihub","model":"deepseek-v4.1-flash-1017"} cfgProvider=aihub cfgModel=deepseek-v4.1-flash-1017
15:11:22 [info] [dsh-qq] 会话就绪 私聊 陈碎碎(1950648905) → 356e5d63-...-rmw8xab9t
15:11:22 [info] [dsh-qq] ← 私聊 陈碎碎(1950648905): 测试
15:11:31 [info] → 私聊 陈碎碎(1950648905): 测试收到了
```

网关侧对应：

```
15:11:30 "POST /v1/chat/completions HTTP/1.1" 200
```

聊天记录文件对应：

```
- 15:11:22 · 陈碎碎(1950648905)：测试 #msg=593584732
- 15:11:31 · 碎碎的小鱼(1160816904)：测试收到了 ⏎ 老板这是试我活没活着？
```

---

## 6. 现场数据在哪

| 东西 | 路径 |
|---|---|
| 插件日志 | `/root/dsh/qq-agent/sessions/logs/dsh-qq-<date>.log` |
| 聊天记录 | `/root/dsh/qq-agent/sessions/<私聊_QQ号 \| 群_群号>/聊天记录/<date>.md` |
| 记忆区 | `.../记忆区/{压缩记忆,大纲,收藏}/` |
| 图片缓存 | `.../图片缓存/` |
| 表情包收藏 | `/root/dsh/qq-agent/sessions/表情包收藏.json` |
| 设置 | `/root/.dsh/dsh-qq/settings.json` |
| 会话代数账本 | `/root/.dsh/dsh-qq/session-state.json` |
| 宿主会话 | `/root/.dsh/sessions/<编码cwd>/<session-uuid>/session.v4.jsonl.zstd` |
| 投影缓存 | `/root/.dsh/storages/session_projcache/sessions/<id>.json` |
| 凭据 | `/root/.dsh/.credentials.yaml` |
| 服务环境变量 | `/etc/dsh-qq.env`（`chmod 600`） |

**日志不轮转**，按天一个文件，永远不删。目前 4 天 892K。跑久了要手动清理：

```bash
find /root/dsh/qq-agent/sessions/logs -name 'dsh-qq-*.log' -mtime +30 -delete
```

**读会话文件**（zstd 压缩的 JSONL）：

```bash
f=/root/.dsh/sessions/<dir>/<session-id>/session.v4.jsonl.zstd
zstd -dc "$f" | python3 -c "
import sys,json
for line in sys.stdin:
    e=json.loads(line)
    if e.get('type')=='request/header':
        print(e['data']['header'].get('config'))
"
```

---

## 7. 排查决策树

```
机器人不说话
├─ ss -ltnp | grep 3001 无输出？
│  ├─ 是 → NapCat 层问题
│  │     ├─ journal 有二维码 → 给用户扫码（§2.3）
│  │     ├─ journal 有 GPU FATAL → 掉线，重启+考虑 --disable-gpu（§2.4）
│  │     └─ journal 空 → systemctl restart napcat，再看
│  └─ 否 ↓
├─ 日志有「ECONNREFUSED」或「已持续约 N 分钟」？
│  └─ 是 → systemctl restart dsh-qqbot（§3.2，自动重连不可靠）
├─ 日志无任何新行？
│  └─ 是 → systemctl restart dsh-qqbot
├─ 有「← 私聊/群 xxx」但没「→」？
│  ├─ 有「本轮出错」→ 看网关日志（§4）
│  ├─ 有「残留且恢复不了」→ 会话切换了，查账本（§3.5）
│  └─ 模型回了 [SILENT] → 正常沉默
├─ 连「←」都没有？
│  └─ 开 debug，看 [debug] 行判定为什么被过滤（§3.3）
└─ 回复是 ⚠️ Insufficient Balance？
   └─ 删 session_projcache（§3.4，别改 settings.json）
```

---

## 8. 已知坑速查

| 坑 | 表现 | 正确做法 |
|---|---|---|
| `napcat` 报 active 但其实坏了 | 3001 无监听 | 只看端口，不看 is-active |
| `/root/Napcat/napcat.log` 不更新 | 文件停在 11-06 | 只看 journalctl |
| 插件日志不在 journal | journalctl 只有启动行 | 看 `sessions/logs/dsh-qq-*.log` |
| 机器人不自动重连 | 重试几千次不恢复 | 手动 restart |
| `settings.json` 的 provider/model 无效 | 改了没反应 | 见 §3.4 三层优先级 |
| 改会话文件无效 | 改完还是 402 | 必须删 projcache |
| 改 `cordis.patch.yml` 不重启 | 没生效 | 必须 restart |
| patch 行覆盖而非合并 | 写漏字段就丢 | 整段写全 |
| `[SILENT]` 拦不住报错 | 聊天里冒出英文异常 | 那是模型层的错，去查网关 |
| 二维码给用户拿到旧码 | 提示过期 | 扫码前一刻才复制 |
| `qrcode.png` 是 600 权限 | Web GUI 显示不出来 | `chmod 644` |
| 会话被切成多段 | 上下文丢失 | 查 `session-state.json`（§3.5） |

---

## 9. 当前基线（2026-11-09 15:11）

出问题时对照这里，快速判断"是不是一直这样"。

```
napcat        active，已登录 碎碎的小鱼(1160816904)，3001 监听中
dsh-qqbot     active，已连接 ws://127.0.0.1:3001
aihub-gateway active，POST /v1/chat/completions 200
模型          aihub / deepseek-v4.1-flash-1017
群            allowlist: 1094505819, 1094770001, 148688723
私聊          allowlist: 1950648905
表情包收藏    1 个
```

**遗留待办**（未做，需用户同意）：

- `napcat.service` 加 `--disable-gpu` 防再次崩溃
- 清理 `session.js:238` 的 DIAG 诊断行（`/root/.dsh/profiles/qqbot/node_modules/dsh-qq-onebot/src/session.js`）
- `settings.json` 里 `debug` 关掉、无效的 `provider`/`model` 删掉
- 私聊会话被切成 3 段，上下文丢失，按 §3.5 决定是否合并
