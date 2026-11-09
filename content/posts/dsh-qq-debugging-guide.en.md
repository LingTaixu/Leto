---
title: "dsh-qq Debugging Guide: End-to-End QQ Bot Troubleshooting"
summary: "Troubleshoot a QQ bot from the NapCat protocol layer through the dsh-qqbot plugin to the model gateway, covering missing replies, QR login, GPU crashes, model routing caches, lost session context, log locations, and recovery steps."
date: "2026-11-09"
tags: ["qqbot", "troubleshooting", "operations"]
readMin: 20
---

> This guide records troubleshooting findings and a deployment baseline from November 9, 2026. Service status, supported settings, and failure behavior refer to that environment at the time. Commands, paths, configuration keys, and original log messages are preserved so they can be matched against the deployment.

This guide covers the QQ bot `碎碎的小鱼(1160816904)` running on the host `hcss-ecs-0242`.
All commands in the original manual were tested on that host; the examples show the output format observed there.

---

## 0. Start here: a 30-second diagnosis

When the bot stops replying, investigate **from the bottom up: protocol → plugin → model**. Do not start by assuming the model is at fault.

```bash
# Check all services, the OneBot port, and recent plugin logs
systemctl is-active napcat dsh-qqbot aihub-gateway mihomo
ss -ltnp | grep 3001
tail -3 /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log
```

What a healthy layer looks like:

| Layer | Healthy output | What an abnormal result means |
|---|---|---|
| `napcat` | `active` **and** port 3001 listening | `active` alone is insufficient; see §2 |
| `dsh-qqbot` | `active`, with `已连接 ws://...` in the log | A log stuck at `ECONNREFUSED` means it cannot reach the protocol service |
| `aihub-gateway` | `active`, with `POST 200` in gateway logs | HTTP 4xx/5xx responses point to the model layer |

**The most common failure on this host:** `napcat` reports `active`, but port 3001 is not listening. This accounted for most historical incidents here; go straight to §2.

---

## 1. End-to-end architecture

```text
Mobile QQ ──(QQ protocol)──┐
                          ├─→ NapCat (QQ client + OneBot11 plugin)
                          │        │
                          │        └─ WebSocket 127.0.0.1:3001 (token)
                          │                │
                          │                ▼
                          │        dsh-qqbot (DSH profile: qqbot)
                          │                │  dsh-qq-onebot plugin
                          │                │
                          │                ├─→ aihub-gateway 127.0.0.1:8898 ─→ https://aihub.top
                          │                └─→ Sessions, memory, and stickers saved under
                          │                    /root/dsh/qq-agent/sessions/
                          │
                          └─ WebUI 0.0.0.0:6099 (NapCat's own admin panel;
                             occasionally useful for recovery)
```

Key facts:

- **NapCat does not call any language model.** It translates the QQ protocol into OneBot v11 JSON. All model calls happen in `dsh-qqbot`.
- There are two host processes: `dsh-web` (GUI, `uiOnly: true`) and `dsh-qqbot` (working directory `/root/dsh/qq-agent`). **Only `dsh-qqbot` connects to NapCat.**
- Session directories are isolated by conversation: `sessions/私聊_<QQ-number>/` for private chats and `sessions/群_<group-number>/` for groups.

---

## 2. NapCat: the protocol layer with the most failures

### 2.1 Check whether NapCat is actually healthy

**Do not rely on `systemctl is-active napcat` alone.** The process may linger after the QQ client crashes, so systemd still reports `active`. Check the ports:

```bash
ss -ltnp | grep -E '3001|6099'
```

- **Healthy:** `LISTEN 127.0.0.1:3001 users:(("qq",pid=...))`
- **Only 6099:** the process is alive, but the OneBot plugin has not started; see §2.3.
- **Neither port:** the service has stopped functioning; run `systemctl restart napcat`.

### 2.2 Where to find NapCat logs

```bash
journalctl -u napcat --since '-10min' --no-pager -o cat
```

**Do not use `/root/Napcat/napcat.log` for current diagnostics.** On this host, it stopped receiving writes after November 6, 2026: its log handle did not recover after a Chromium crash. Current logs go only to the journal.

Look for QR URLs, successful login, OneBot, WebSocket service, and login-state messages:

```bash
journalctl -u napcat --since '-10min' --no-pager -o cat | grep -E '二维码解码URL|登录成功|OneBot11|WebSocket服务|登录态'
```

### 2.3 Failure 1: stuck waiting for QR login

**Symptoms**

```text
15:06:53 [info] QQ 1160816904 未配置回退密码环境变量，建议优先使用 ACCOUNT + NAPCAT_QUICK_PASSWORD，将使用二维码登录方式
15:06:53 [error] 快速登录错误： 登录态已失效，请重新登录。
15:06:53 [warn] 请扫描下面的二维码，然后在手Q上授权登录：
二维码解码URL: https://txz.qq.com/p?k=xxxx&f=1600001615
二维码已保存到 /root/Napcat/opt/QQ/resources/app/app_launcher/napcat/cache/qrcode.png
```

These messages say that no fallback password is configured, the saved login has expired, and a QR scan must be authorized in mobile QQ. A 64-character hexadecimal string printed every second afterward is the **QR polling heartbeat**, not an error.

**How to show the QR code to the user**

```bash
# 1. Copy it to an accessible location; the original is mode 600
#    and cannot be read by the web GUI
cp -f /root/Napcat/opt/QQ/resources/app/app_launcher/napcat/cache/qrcode.png /root/dsh/qr-login.png
chmod 644 /root/dsh/qr-login.png

# 2. Extract the latest decoded URL, since the code refreshes
journalctl -u napcat --since '-10min' --no-pager -o cat | grep -o 'https://txz.qq.com/p?k=[^ ]*' | tail -1
```

In the original web GUI, embed the image in the response with `![QQ login QR code](/root/dsh/qr-login.png)`.

**Details to remember**

- The QR code refreshes roughly once a minute, overwriting `qrcode.png`. **Copy it immediately before the user scans.**
- The model used in that deployment did not support image input, but the GUI could still display an image embedded in Markdown.
- If the user reports an expired code, run `systemctl restart napcat`, wait approximately 25 seconds for a new code, and copy it again.
- After a successful scan, restarting the bot is faster than waiting for automatic plugin reconnection, which may already have failed; see §3.2.

**Optional lasting fix, requiring user approval:** configure the `NAPCAT_QUICK_PASSWORD` environment variable to avoid scanning on future restarts.

### 2.4 Failure 2: a GPU crash disconnects QQ

**This was the root cause of the 26-hour outage associated with November 8, 2026 on this host.**

The tail of `/root/Napcat/napcat.log` still provides historical evidence even though the file stopped updating:

```text
ERROR:content/browser/gpu/gpu_process_host.cc:997] GPU process launch failed: error_code=1002
FATAL:content/browser/gpu/gpu_data_manager_impl_private.cc:415] GPU process isn't usable. Goodbye.
```

The server has no GPU, but QQ attempts to start a GPU process and exits when that fails. The process may remain present while the login state and OneBot service disappear.

**Lasting fix, requiring user approval because NapCat will restart:** add `--disable-gpu` to `ExecStart` in `/etc/systemd/system/napcat.service`.

**Note:** `--disable-gpu` addresses another GPU crash; it does not restore an already lost login state. Handle login recovery separately.

### 2.5 NapCat configuration

```text
/root/Napcat/opt/QQ/resources/app/app_launcher/napcat/config/onebot11_1160816904.json
```

Inspect these three settings:

```bash
python3 -c "
import json
d=json.load(open('/root/Napcat/opt/QQ/resources/app/app_launcher/napcat/config/onebot11_1160816904.json'))
print(json.dumps(d['network']['websocketServers'], ensure_ascii=False, indent=2))
"
```

- `port` must be `3001`.
- `token` must match `accessToken` in `settings.json`.
- **`messagePostFormat` must be `array`.** With `string`, the plugin receives raw CQ codes and cannot parse messages correctly.

---

## 3. dsh-qqbot: the plugin layer

### 3.1 The log location that contains application activity

```text
/root/dsh/qq-agent/sessions/logs/dsh-qq-<YYYY-MM-DD>.log
```

**Why these logs are absent from the journal:** the host service launches through `/root/.bun/bin/dsh`, while the plugin uses its own file logger (`makeLogger` at `src/index.js:68`). `journalctl -u dsh-qqbot` contains systemd startup messages and `[llm-deepseek-api-key]` noise, but **no application activity**.

There are three log levels:

| Level | When it appears | Purpose |
|---|---|---|
| `[info]` | Connections, sessions, incoming/outgoing messages | Routine tracing |
| `[warn]` | Disconnections, limits, session exceptions | Failure signals |
| `[debug]` | Only when `debug: true` in `settings.json` | Explain why a message received no reply |

### 3.2 Failure 3: the bot cannot connect or reconnect

**Symptoms**

```text
[warn] 与 NapCat 断开，稍后自动重连；后续重试不再逐条报，恢复时会通知
[warn] 与 NapCat 断开已持续约 1560 分钟，累计重试 3126 次，最近一次：connect ECONNREFUSED 127.0.0.1:3001
```

The warnings report a disconnection and repeated connection refusals. **Observed on November 9, 2026:** after NapCat was repaired, the bot did **not** reconnect automatically. It reached 3,846 retries, continued looping every six seconds, and produced no new log lines after 14:26. Automatic reconnection was unreliable in this deployment.

**Recovery**

```bash
systemctl restart dsh-qqbot
sleep 18
grep -E '已连接|登录账号' /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log | tail -3
```

Expected output:

```text
15:08:44 [info] QQ 互动工具已注册：qq_facts / qq_pin / ... （表情包收藏 N 个）
15:08:44 [info] 已连接 ws://127.0.0.1:3001
15:08:44 [info] 登录账号 碎碎的小鱼 (1160816904)
```

These lines confirm tool registration, a WebSocket connection, and the logged-in account.

### 3.3 Failure 4: why did the bot ignore a message?

Enable `debug` in `settings.json`, then inspect the `[debug]` lines:

```bash
grep '\[debug\]' /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log | tail -20
```

Common reasons, copied verbatim from the logs:

```text
[debug] [dsh-qq] 群 148688723 未 @ 且不在保活期，跳过
[debug] [dsh-qq] 群 148688723 保活窗里停太久（>5000ms），窗关掉，跳过
[debug] [dsh-qq] 群 1094505819 @ 的是别人，跳过
[debug] [dsh-qq] 忽略未授权 私聊 xxx
[debug] [dsh-qq] xxx 是同类机器人发言，「和同类聊天」没开，跳过
```

These correspond to: no mention outside the active reply window; an expired reply window; a mention targeting someone else; an unauthorized private chat; and another bot speaking while bot-to-bot chat is disabled.

Configuration references from the original manual:

| Behavior | Related settings or explanation |
|---|---|
| No group reply without a mention | `requireMention` / `groupWakeMs` (active reply window) |
| No response when called by name | `groupWakeNames`, `groupWakeProbability` |
| No private reply | `privateMode` + `privateAllow` |
| No group activity at all | `groupMode` + `groupAllow` |
| A reply has no content | The model returned `[SILENT]`; intentional silence |

See §3.7 for the settings whitelist: some names listed above are historical or configured through another channel and are not accepted in `settings.json`.

**Note:** `[SILENT]` applies only to normal replies. **Exceptions thrown by the model API are sent verbatim as message content**, and `[SILENT]` cannot suppress them. If English error text appears in chat, inspect the gateway before assuming a plugin defect.

### 3.4 Failure 5: `Insufficient Balance` / HTTP 402

This incident occurred on November 7, 2026. Its cause and fix were sufficiently counterintuitive to document separately.

**Symptoms:** both private and group chats reply with `⚠️ Insufficient Balance (request_id: ...)`, but gateway logs contain **no requests**, or requests are routed to `deepseek-official`.

**The root cause involves three precedence layers. Checking only the first two is insufficient:**

1. `provider` / `model` in `settings.json`: **ineffective**, stripped by `sanitizeOverrides`. Changing them has no effect.
2. `config.provider/model` on the `dsh-qq` entry in `cordis.patch.yml`: **effective**, passed to `agentOptions` in `session.js`. Confirm this with `DIAG attach ... agentOptions={...}` in the log. However, the third layer still overrides it.
3. **`session_projcache`: the deciding layer.** Its files live at:

```text
/root/.dsh/storages/session_projcache/sessions/<session-id>.json
```

The relevant value is `record.model.rows.modelSelection.val = {"lastUsed": {"provider": ..., "model": ...}, "pending": null}`.
`model.current()` returns `pending ?? lastUsed` and **never falls back to `agentOptions`**. `model.select()` is a no-op when the selection matches the recorded value, so editing configuration alone cannot correct this state.

**A common misconception:** directly editing `request/header`, or even `request/context`, in `session.v4.jsonl.zstd` **does not work**. The projection cache is derived independently and does not notice those source-file edits.

**Correct recovery procedure**

```bash
systemctl stop dsh-qqbot

# Back up the affected cache file, then remove it
BK=/root/.dsh/storages/session_projcache.bak.$(date +%H%M)
mkdir -p "$BK"
cp -p /root/.dsh/storages/session_projcache/sessions/<id>.json "$BK"/
rm -f /root/.dsh/storages/session_projcache/sessions/<id>.json

systemctl start dsh-qqbot
```

**Verify:** the plugin log should show `DIAG attach ... agentOptions={"provider":"aihub","model":"deepseek-v4.1-flash-1017"}`, immediately followed by `POST /v1/chat/completions 200` in the gateway log.

### 3.5 Failure 6: a leftover session cannot be resumed

**Symptoms**

```text
[warn] [dsh-qq] 会话 356e5d63 残留且恢复不了（session "356e5d63-...-rmw5pxwzy" already exists），改用新 id 356e5d63-...-rmw8xab9t
```

**Meaning:** when the plugin tries to resume an older session, the host reports `already exists`: that ID is occupied. The plugin creates a replacement session with a `-r<base36-timestamp>` suffix.

**Consequence:** the session chain splits into generations, causing **context loss**. On this host, one private conversation was split into three:

```bash
# Find the session generations for a conversation
find /root/.dsh/sessions -maxdepth 2 -type d -name '356e5d63*'
```

```text
356e5d63-...-rmw5pxwzy-rmw8xab9t   18 events    ← current, almost empty
356e5d63-...-rmw5pxwzy            473 events   ← intermediate generation
356e5d63-...                       334 events   ← original
```

**Inspect the session ledger**

```bash
python3 -m json.tool /root/.dsh/dsh-qq/session-state.json
```

Example contents:

```json
{"gens": {}, "sessions": {
  "qq:1160816904:private:1950648905@iso": "356e5d63-...-rmw8xab9t",
  "qq:1160816904:group:1094770001@iso": "9efd82d9-...-rmw5oe6o6"
}}
```

**Recovery:** to restore older context, change the corresponding value in `sessions` to the desired generation's ID: choose an existing session with the relevant event history. Restart `dsh-qqbot`. Otherwise, allow the new session to accumulate context naturally.

**Prevent recurrence:** proliferating `-r` suffixes usually follow a crash or forced kill. Check for leftover processes holding an older ID:

```bash
ps aux | grep 'dsh --profile qqbot' | grep -v grep
```

Terminating surplus processes before restarting can reduce recurrence.

### 3.6 How configuration changes take effect

| Configuration location | How changes take effect |
|---|---|
| `/root/.dsh/dsh-qq/settings.json` | **Hot-reloaded**, no restart needed |
| `/root/.dsh/profiles/qqbot/cordis.patch.yml` | **Requires** `systemctl restart dsh-qqbot` |
| `debug` / `provider` / `model` in `settings.json` | `debug` is hot-reloaded; changing the other two **has no effect**; see §3.4 |

Validate YAML before changing `cordis.patch.yml`; invalid syntax prevents the bot from starting:

```bash
python3 -c "import yaml;yaml.safe_load(open('/root/.dsh/profiles/qqbot/cordis.patch.yml'))" && echo "YAML OK"
```

**Note:** a patch entry **replaces the entire `config` object** instead of merging it. Omitted fields are lost.

### 3.7 Which keys does `settings.json` actually accept?

`src/settings.js` defines a whitelist. Keys outside it are ignored; the message `设置里有不认识的键，忽略: ...` is logged only when `debug: true`.

The whitelist includes supported settings discussed above, but **excludes** `cwd`, `groupWakeNames`, `groupWakeProbability`, `provider`, and `model`, among others. Those keys are historical or use a different configuration channel; do not expect them to take effect through the settings page.

---

## 4. The model layer: gateways

### 4.1 Health checks

```bash
curl -s http://127.0.0.1:8898/__health
curl -s http://127.0.0.1:8899/__health     # linuxhub
```

### 4.2 Inspect actual requests

```bash
journalctl -u aihub-gateway --since '-10min' --no-pager -o short-iso | grep POST | tail -5
```

- `POST /v1/chat/completions HTTP/1.1 200`: the model layer is reachable.
- `402`: a balance or routing issue; revisit §3.4.
- `403`: the WAF may have blocked the User-Agent. The service already sets `GW_USER_AGENT=node`.
- **No POST requests at all:** requests never reached the gateway; investigate the three layers in §3.4.

### 4.3 Gateway topology

| Gateway | Port | Upstream | Alias file |
|---|---|---|---|
| `aihub-gateway` | 8898 | `https://aihub.top` | `/etc/hub-gateway/aihub-aliases.json` |
| `hub-gateway` | 8899 | `https://hub.linux.do` | `/etc/hub-gateway/model-aliases.json` |

Model IDs are **case-sensitive**; normalization was configured in the gateway. The model at the recorded baseline was `aihub/deepseek-v4.1-flash-1017`.

---

## 5. Verify one complete round trip

After making a change, confirm that the entire path works:

```bash
# 1. Has the bot connected?
grep -E '已连接|登录账号' /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log | tail -2

# 2. Send a message to the bot, then inspect all three locations
tail -5 /root/dsh/qq-agent/sessions/logs/dsh-qq-$(date +%F).log
journalctl -u aihub-gateway --since '-2min' --no-pager | grep POST | tail -2
tail -4 "/root/dsh/qq-agent/sessions/私聊_1950648905/聊天记录/$(date +%F).md"
```

A successful exchange recorded on this host at 15:11:

```text
15:11:22 [info] [dsh-qq] DIAG attach 356e5d63 agentOptions={"provider":"aihub","model":"deepseek-v4.1-flash-1017"} cfgProvider=aihub cfgModel=deepseek-v4.1-flash-1017
15:11:22 [info] [dsh-qq] 会话就绪 私聊 陈碎碎(1950648905) → 356e5d63-...-rmw8xab9t
15:11:22 [info] [dsh-qq] ← 私聊 陈碎碎(1950648905): 测试
15:11:31 [info] → 私聊 陈碎碎(1950648905): 测试收到了
```

The session becomes ready, receives a private message saying “test,” and sends an acknowledgment. The corresponding gateway entry:

```text
15:11:30 "POST /v1/chat/completions HTTP/1.1" 200
```

The corresponding chat history:

```text
- 15:11:22 · 陈碎碎(1950648905)：测试 #msg=593584732
- 15:11:31 · 碎碎的小鱼(1160816904)：测试收到了 ⏎ 老板这是试我活没活着？
```

---

## 6. Where deployment data lives

| Data | Path |
|---|---|
| Plugin logs | `/root/dsh/qq-agent/sessions/logs/dsh-qq-<date>.log` |
| Chat history | `/root/dsh/qq-agent/sessions/<私聊_QQ号 \| 群_群号>/聊天记录/<date>.md` |
| Memory | `.../记忆区/{压缩记忆,大纲,收藏}/` |
| Image cache | `.../图片缓存/` |
| Saved stickers | `/root/dsh/qq-agent/sessions/表情包收藏.json` |
| Settings | `/root/.dsh/dsh-qq/settings.json` |
| Session generation ledger | `/root/.dsh/dsh-qq/session-state.json` |
| Host sessions | `/root/.dsh/sessions/<encoded-cwd>/<session-uuid>/session.v4.jsonl.zstd` |
| Projection cache | `/root/.dsh/storages/session_projcache/sessions/<id>.json` |
| Credentials | `/root/.dsh/.credentials.yaml` |
| Service environment variables | `/etc/dsh-qq.env` (`chmod 600`) |

The memory subdirectories store compressed memory, outlines, and saved items. Chinese directory names above are literal filesystem names.

**Logs do not rotate:** a new file is created each day, and old files are never deleted automatically. At the recorded baseline, four days occupied 892K. Manual cleanup after extended operation:

```bash
find /root/dsh/qq-agent/sessions/logs -name 'dsh-qq-*.log' -mtime +30 -delete
```

**Read a session file** containing zstd-compressed JSONL:

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

## 7. Troubleshooting decision tree

```text
The bot is not replying
├─ Does ss -ltnp | grep 3001 produce no output?
│  ├─ Yes → NapCat layer
│  │     ├─ QR code in journal → ask the user to scan (§2.3)
│  │     ├─ GPU FATAL in journal → restart and consider --disable-gpu (§2.4)
│  │     └─ Empty journal → systemctl restart napcat, then inspect again
│  └─ No ↓
├─ Does the plugin log show ECONNREFUSED or a prolonged disconnection?
│  └─ Yes → systemctl restart dsh-qqbot (§3.2; reconnection is unreliable)
├─ No new plugin log lines at all?
│  └─ Yes → systemctl restart dsh-qqbot
├─ Incoming message (← 私聊/群 xxx), but no outgoing reply (→)?
│  ├─ 本轮出错 (round failed) → inspect gateway logs (§4)
│  ├─ 残留且恢复不了 (cannot resume) → check the session ledger (§3.5)
│  └─ Model returned [SILENT] → intentional silence
├─ No incoming-message marker (←) either?
│  └─ Enable debug and inspect filtering decisions (§3.3)
└─ Reply says ⚠️ Insufficient Balance?
   └─ Remove the affected session_projcache file after backup (§3.4)
```

---

## 8. Known pitfalls at a glance

| Pitfall | Symptom | Correct approach |
|---|---|---|
| `napcat` reports active while broken | Port 3001 is not listening | Verify the listening port, not just `is-active` |
| `/root/Napcat/napcat.log` is stale | File stops at November 6, 2026 | Use `journalctl` |
| Plugin activity is absent from journal | Only startup entries appear | Read `sessions/logs/dsh-qq-*.log` |
| Bot does not reconnect | Thousands of retries without recovery | Restart it manually |
| `provider/model` in `settings.json` are ineffective | Edits change nothing | Check the three precedence layers in §3.4 |
| Editing a session file has no effect | HTTP 402 persists | Remove the affected projection cache after backup |
| `cordis.patch.yml` changed without a restart | Configuration is not applied | Restart the bot |
| Patch entries replace rather than merge | Omitted fields disappear | Supply the full configuration object |
| `[SILENT]` cannot suppress exceptions | English error text appears in chat | Investigate the model gateway |
| An old QR code is shown | User sees an expired code | Copy it immediately before scanning |
| `qrcode.png` has mode 600 | Web GUI cannot display it | Set the accessible copy to `chmod 644` |
| Session split across generations | Context is lost | Inspect `session-state.json`; see §3.5 |

---

## 9. Recorded baseline: November 9, 2026, 15:11

Compare an incident against this snapshot to distinguish a new failure from pre-existing behavior.

```text
napcat        active; logged in as 碎碎的小鱼(1160816904); port 3001 listening
dsh-qqbot     active; connected to ws://127.0.0.1:3001
aihub-gateway active; POST /v1/chat/completions 200
Model         aihub / deepseek-v4.1-flash-1017
Groups        allowlist: 1094505819, 1094770001, 148688723
Private chats allowlist: 1950648905
Saved stickers: 1
```

**Outstanding tasks at the time of the original manual, not yet performed and requiring user approval:**

- Add `--disable-gpu` to `napcat.service` to prevent another GPU crash.
- Remove the `DIAG` diagnostic line at `session.js:238` in `/root/.dsh/profiles/qqbot/node_modules/dsh-qq-onebot/src/session.js`.
- Turn off `debug` in `settings.json` and remove the ineffective `provider` / `model` keys.
- The private conversation was split into three sessions with lost context; use §3.5 to decide whether to consolidate them.
