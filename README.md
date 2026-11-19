# dsh-mistral-relay

DeepSeek Harness（dsh）的 **Mistral 兼容中继** provider 插件。基于
[dsh-mistral-pro](https://github.com/01NGVI-QINGYI/dsh-mistral-pro) 分叉，修正了它在
"端点只认自己 live 模型列表" 时会 400 的问题，并重写了设置界面。

> A Mistral-compatible relay provider for DeepSeek Harness.
> Fork of `dsh-mistral-pro` that maps selections to the ids the endpoint actually
> serves, and replaces the settings page with a modern, theme-aware UI.

---

## 它解决什么问题

中继端点（很多 Mistral 兼容网关是这样）只回答它 `/v1/models` 里列出的 id。而插件在
live 目录还没拉到时会先展示**内置快照**的 id，两者不总是同一个字符串：

```
插件内置快照 id : deepseek-v4-flash-1017
端点 live  id   : deepseek-v4-1-flash-1017      ← 端点只认这个
```

选中内置 id 时，请求体里的 `model` 就是那个端点不认识的名字，于是：

```json
400 {"object":"error","message":"Invalid model: deepseek-v4-flash-1017","type":"invalid_model"}
```

本插件在发请求前做一次映射（`lib/catalog.js` 的 `wireModelId`）：live 列表里有就原样用；
是别名就用别名指向的 id；都不是就用内置 id → live id 的反查表兜底。
同时 `resolveModelInfo` 也按 live id 取事实，`input: ["text","image"]` 这类能力直接来自端点的
`capabilities`，所以看图能力不会因为快照过期而丢失。

## 特性

- **多账号故障转移** — 按顺序尝试，第一个成功应答的账号承担本次请求；失败账号进入冷却
- **实时模型目录** — 从端点的 `/v1/models` 拉取，支持搜索、逐个启用、覆盖上下文/输出上限/默认思考档
- **真实订阅额度** — 读 Mistral 公开计费接口（普通 API Key 即可，无需 Admin API / Enterprise）：
  - `GET /v1/billing/subscription` → `plan_name` 等
  - `GET /v1/billing/budget` → `vibe_budget` / `api_budget`（`initial_budget`、`usage_percentage`、`reset_at`）
  - 设置页与输入框药丸都显示百分比、已用/总额、重置倒计时
- **现代设置页** — 账号 / 模型 / 额度 / 高级 四个分区；样式由主题色推导（`color-mix` + `currentColor`），
  自动跟随明暗主题，自带 `prefers-reduced-motion` 降级
- **思考链路可用** — 该类端点常把思考放在 `delta.content` 的数组里
  （`[{"type":"thinking","thinking":[{"type":"text","text":"…"}]}]`）；插件按 part 拆分后
  正常显示思考，不会出现 `[object Object]`
- **零运行时依赖** — 纯 ESM，只用 Node 内建模块与宿主服务

## 安装

```sh
# 从本地检出
dsh plugin --profile desktop add /path/to/dsh-mistral-relay

# 或从本仓库
dsh plugin --profile desktop add github:Niangaol/dsh-mistral-relay
```

然后在 profile 的 `cordis.patch.yml` 里把默认模型指过去：

```yaml
- id: agent-default-model
  config:
    provider: mistral-relay
    model: deepseek-v4-1-flash-1017
```

## 配置

插件的 bundle patch 会插入一个 `mistral-relay` 行；参数在 profile 的 `cordis.patch.yml` 里覆盖
（patch 会**整体替换** `config`，要保留的键需重复写出）：

```yaml
- id: mistral-relay
  name: dsh-mistral-relay
  config:
    baseURL: https://api.mistral.ai/v1   # 端点根
    accounts:
      - name: default
        apiKeyEnv: MISTRAL_API_KEY       # 凭据服务里的引用名
        baseURL: ""                      # 留空用上面的 baseURL
        enabled: true
    usage:
      display: auto                      # auto | always | off
      refreshSeconds: 60
      adminCookieEnv: MISTRAL_ADMIN_COOKIE   # 仅管理站点的额外额度需要
      showCredits: true
    advanced:
      modelsRefreshMinutes: 30
      cooldownSeconds: 60
      maxTokensCap: 0                    # 0 = 不注入输出上限
      requestTimeoutMs: 600000
      streamIdleTimeoutMs: 300000
      failover: true
      promptCacheKey: auto
    models:                              # 逐个模型的覆盖
      mistral-large-4:
        visible: false
      deepseek-v4-1-flash-1017:
        contextWindow: 1000000
        maxTokens: 128000
```

## 与 billion-context（bili）共存

bili 的 strict-echo 会在**请求体模型名包含 `deepseek`** 时，给每条带 `tool_calls` 的 assistant
消息补一个空串 `reasoning_content`。本类中继会以 `422 extra_forbidden` 拒收该字段，整轮失败。

插件的 bundle patch 用条件表达式停用 `bili-native`（并**保留** `bili-compaction-gate`——
bili 自己的文档要求它常驻，禁用会让 preset 等待的服务缺失），没装 bili 的 profile 不受影响。

因为 bundle patch 按 `dsh.profile.bundles` 的**顺序**应用，本插件必须排在该列表**最后**
（至少要在 `billion-context` 之后），否则禁用行执行时 `bili-native` 还没被插入，等于没写：

```jsonc
// ~/.dsh/profiles/<profile>/package.json
"dsh": { "profile": { "bundles": [ "...", "billion-context", "dsh-mistral-relay" ] } }
```

需要保留 bili 的 strict-echo 时，删掉 `cordis.patch.yml` 末尾那两行即可。

## 已知限制

- 该类端点通常只接受 `reasoning_effort`，不接受 `thinking` / `reasoning` / `enable_thinking`
  （会 422 `extra_forbidden`）；思考档位也不一定有 `medium`。选了不支持的档位会被端点 400。
- 计费接口需要 Key 具备 `see_org_inference_usage` 权限；没有权限时套餐仍可读，额度会回退为空。
- 管理站点（`admin.mistral.ai`）的额外额度需要浏览器 Cookie，不是所有账号都提供。

## 目录

| 文件 | 作用 |
| --- | --- |
| `index.js` | 宿主半：注册 provider、目录刷新、HTTP 路由、usage 服务 |
| `lib/adapter.js` | LLM 适配器：请求构造、流解析、账号故障转移 |
| `lib/catalog.js` | 内置快照 + live 目录合并、`wireModelId` 映射 |
| `lib/config.js` | 配置 schema 与规范化 |
| `lib/accounts.js` | 凭据解析、账号池 |
| `lib/usage.js` | 计费接口与额度归一化 |
| `client.js` | 浏览器半：设置页、额度药丸、样式 |
| `test-relay.mjs` / `test-image.mjs` | 不启动 GUI 直接验证适配器的脚本 |

## 验证脚本

```sh
# 需要 MISTRAL_API_KEY；用 shim 目录模拟宿主依赖时可直接跑适配器
node test-relay.mjs deepseek-v4-flash-1017 high
node test-image.mjs ./path/to/image.png
```

## 许可

MIT。原始版权归 [01NGVI-QINGYI](https://github.com/01NGVI-QINGYI/dsh-mistral-pro)，
本分叉的修改部分同样以 MIT 发布。
