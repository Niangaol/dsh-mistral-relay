/**
 * dsh-mistral-relay — browser half.
 *
 * A modern settings surface for the relay provider (accounts, live model
 * catalog, usage, transport) plus a compact composer usage pill. Only `react`
 * is required: the styling ships as one injected stylesheet built on the
 * theme's own colours, so it follows light/dark without touching host tokens.
 */
window.__ModuleLoader__.load({
  id: 'dsh-mistral-relay',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useCallback, useMemo, useRef } = React

    const NS = 'mistral-relay'
    const API = '/plugins/dsh-mistral-relay'

    // ── copy ────────────────────────────────────────────────────────────────
    const ZH = {
      sectionTitle: 'Mistral 中继',
      tagline: '账号、模型与额度',
      subtitle: '多账号故障转移 · 实时模型目录 · 订阅额度',
      tabAccounts: '账号',
      tabModels: '模型',
      tabUsage: '额度',
      tabAdvanced: '高级',
      accounts: '账号',
      accountsHint: '按顺序尝试，第一个成功的账号承担本次请求。',
      addAccount: '添加账号',
      remove: '删除',
      moveUp: '上移',
      moveDown: '下移',
      enabled: '启用',
      disabled: '停用',
      keyReady: '已配置 Key',
      keyMissing: '缺少 Key',
      setKey: '设置 Key',
      keyPlaceholder: '粘贴 API Key（仅存于凭据库）',
      saveKey: '保存',
      clearKey: '清除 Key',
      test: '测试',
      testing: '测试中…',
      testOk: '连通正常',
      testFail: '连接失败',
      name: '名称',
      apiKeyEnv: '凭据变量',
      baseURL: '端点覆盖',
      baseURLHint: '留空则用默认端点',
      models: '模型',
      modelsHint: '目录来自端点实时列表，可按需隐藏或覆盖容量。',
      refresh: '从 Mistral 刷新',
      refreshing: '刷新中…',
      search: '搜索模型',
      onlyEnabled: '只看已启用',
      displayName: '名称',
      displayNameHint: '在选择器和输入框里显示的名称',
      visionOn: '可识图',
      visionOff: '纯文本',
      visionHint: '关掉后该模型不再声明图片输入，read_image 会拒绝，但请求体更小',
      context: '上下文',
      maxTokens: '输出上限',
      effort: '默认思考档',
      vision: '视觉',
      reasoning: '推理',
      enabledState: '已启用',
      usage: '额度',
      usageHint: '订阅额度来自 Mistral 管理站点。',
      plan: '套餐',
      spend: '本月花费',
      credits: '剩余额度',
      renews: '下次重置',
      fetched: '更新于',
      noUsage: '尚未获取额度',
      noAllowance: '套餐未返回额度信息',
      usageSource: '数据来自 Mistral 计费接口（普通 API Key 即可读取）。',
      display: '显示方式',
      displayAuto: '自动',
      displayAlways: '始终显示',
      displayOff: '隐藏',
      refreshSeconds: '额度刷新间隔（秒）',
      adminCookie: '管理站点 Cookie 凭据变量',
      advanced: '传输',
      advancedHint: '一般无需改动。',
      cooldownSeconds: '账号冷却（秒）',
      maxTokensCap: '输出上限上限（0 = 不限制）',
      modelsRefreshMinutes: '模型目录刷新（分钟）',
      requestTimeoutMs: '请求超时（毫秒）',
      streamIdleTimeoutMs: '流空闲超时（毫秒）',
      promptCacheKey: '提示缓存键',
      proxy: '代理',
      compaction: '自动压缩',
      compactionHint: '对话超出上下文窗口时，把中段摘要成一条消息，最近的内容原样保留',
      compactThreshold: '触发阈值（占窗口比例）',
      compactKeepTokens: '保留最近 tokens',
      compactSummaryMaxTokens: '摘要输出上限',
      failover: '故障转移',
      save: '保存',
      saved: '已保存',
      saveFailed: '保存失败：{message}',
      loadFailed: '加载失败：{message}',
      none: '—',
      pillTitle: 'Mistral 订阅额度',
      percentOfPlan: '已用 {percent}%',
    }
    const EN = {
      sectionTitle: 'Mistral relay',
      tagline: 'Accounts, models and allowance',
      subtitle: 'Multi-account failover · live catalog · subscription allowance',
      tabAccounts: 'Accounts',
      tabModels: 'Models',
      tabUsage: 'Allowance',
      tabAdvanced: 'Transport',
      accounts: 'Accounts',
      accountsHint: 'Tried in order; the first account that answers serves the request.',
      addAccount: 'Add account',
      remove: 'Remove',
      moveUp: 'Up',
      moveDown: 'Down',
      enabled: 'Enabled',
      disabled: 'Disabled',
      keyReady: 'Key stored',
      keyMissing: 'No key',
      setKey: 'Set key',
      keyPlaceholder: 'Paste the API key (stored in the credential store)',
      saveKey: 'Save',
      clearKey: 'Clear key',
      test: 'Test',
      testing: 'Testing…',
      testOk: 'Reachable',
      testFail: 'Unreachable',
      name: 'Name',
      apiKeyEnv: 'Credential ref',
      baseURL: 'Endpoint override',
      baseURLHint: 'Leave empty for the default endpoint',
      models: 'Models',
      modelsHint: 'The catalog is the endpoint’s live listing; hide or override as needed.',
      refresh: 'Refresh from Mistral',
      refreshing: 'Refreshing…',
      search: 'Search models',
      onlyEnabled: 'Enabled only',
      displayName: 'Name',
      displayNameHint: 'Shown in the selector and composer',
      visionOn: 'Reads images',
      visionOff: 'Text only',
      visionHint: 'Off: the model stops declaring image input; read_image refuses and requests stay smaller',
      context: 'Context',
      maxTokens: 'Max output',
      effort: 'Default effort',
      vision: 'Vision',
      reasoning: 'Reasoning',
      enabledState: 'Enabled',
      usage: 'Allowance',
      usageHint: 'Allowance comes from the Mistral admin site.',
      plan: 'Plan',
      spend: 'Spend',
      credits: 'Credits left',
      renews: 'Renews',
      fetched: 'Updated',
      noUsage: 'Not fetched yet',
      noAllowance: 'The plan reports no allowance',
      usageSource: 'Figures come from Mistral’s billing API (an ordinary API key is enough).',
      display: 'Display',
      displayAuto: 'Auto',
      displayAlways: 'Always',
      displayOff: 'Hidden',
      refreshSeconds: 'Allowance refresh (s)',
      adminCookie: 'Admin cookie credential ref',
      advanced: 'Transport',
      advancedHint: 'Defaults are fine for most setups.',
      cooldownSeconds: 'Account cooldown (s)',
      maxTokensCap: 'Output cap ceiling (0 = none)',
      modelsRefreshMinutes: 'Catalog refresh (min)',
      requestTimeoutMs: 'Request timeout (ms)',
      streamIdleTimeoutMs: 'Stream idle timeout (ms)',
      promptCacheKey: 'Prompt cache key',
      proxy: 'Proxy',
      compaction: 'Auto-compaction',
      compactionHint: 'When the transcript outgrows the window, the middle becomes one summary and the recent tail stays verbatim',
      compactThreshold: 'Trigger threshold (share of window)',
      compactKeepTokens: 'Recent tokens kept',
      compactSummaryMaxTokens: 'Summary output cap',
      failover: 'Failover',
      save: 'Save',
      saved: 'Saved',
      saveFailed: 'Save failed: {message}',
      loadFailed: 'Load failed: {message}',
      none: '—',
      pillTitle: 'Mistral allowance',
      percentOfPlan: '{percent}% of plan used',
    }

    // ── stylesheet ──────────────────────────────────────────────────────────
    const STYLE_ID = 'dsh-mistral-relay-style-v2'
    const CSS = `
.mrel{
  --mrel-fg:inherit;
  --mrel-soft:color-mix(in oklab,currentColor 58%,transparent);
  --mrel-faint:color-mix(in oklab,currentColor 38%,transparent);
  --mrel-line:color-mix(in oklab,currentColor 12%,transparent);
  --mrel-line-strong:color-mix(in oklab,currentColor 20%,transparent);
  --mrel-surface:color-mix(in oklab,currentColor 4%,transparent);
  --mrel-surface-2:color-mix(in oklab,currentColor 8%,transparent);
  --mrel-accent:#7c9cff;--mrel-ok:#3ecf8e;--mrel-warn:#f0b429;--mrel-bad:#ef5f5f;
  --mrel-r:12px;
  display:flex;flex-direction:column;gap:20px;color:var(--mrel-fg);
  font-size:13px;line-height:1.55;letter-spacing:.005em;
  -webkit-font-smoothing:antialiased}
.mrel *{box-sizing:border-box}

/* ── 页头 ─────────────────────────────────────────────── */
.mrel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.mrel-title{font-size:18px;font-weight:660;letter-spacing:-.015em}
.mrel-sub{color:var(--mrel-soft);font-size:12px;margin-top:4px;max-width:52ch}
.mrel-chips{display:flex;gap:6px;flex-wrap:wrap}
.mrel-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;
  background:var(--mrel-surface);border:1px solid var(--mrel-line);font-size:11.5px;
  color:var(--mrel-soft);transition:border-color .2s,background .2s}
.mrel-chip:hover{border-color:var(--mrel-line-strong);background:var(--mrel-surface-2)}
.mrel-chip b{color:var(--mrel-fg);font-weight:600;font-variant-numeric:tabular-nums}
.mrel-dot{width:6px;height:6px;border-radius:50%;background:var(--mrel-soft);flex:0 0 auto}

/* ── 分节：逐段上浮 ───────────────────────────────────── */
.mrel-section{margin-top:4px;animation:mrel-rise .42s cubic-bezier(.22,.68,.24,1) both}
.mrel-section-title{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;
  color:var(--mrel-faint);margin-bottom:12px;display:flex;align-items:center;gap:10px}
.mrel-section-title::after{content:"";flex:1 1 auto;height:1px;background:var(--mrel-line)}

/* ── 通用排版 ─────────────────────────────────────────── */
.mrel-panel{display:flex;flex-direction:column;gap:14px}
.mrel-hint{color:var(--mrel-soft);font-size:12px}
.mrel-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:var(--mrel-soft)}
.mrel-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.mrel-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}

/* ── 卡片：悬停轻微上浮 ───────────────────────────────── */
.mrel-card{border:1px solid var(--mrel-line);border-radius:var(--mrel-r);
  background:var(--mrel-surface);padding:14px;
  transition:border-color .2s,background .2s,transform .2s cubic-bezier(.22,.68,.24,1)}
.mrel-card:hover{border-color:var(--mrel-line-strong);background:var(--mrel-surface-2);transform:translateY(-1px)}
.mrel-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
.mrel-card-name{font-weight:600;letter-spacing:-.005em}

/* ── 按钮 ─────────────────────────────────────────────── */
.mrel-btn{appearance:none;border:1px solid var(--mrel-line);background:var(--mrel-surface-2);
  color:var(--mrel-fg);font:inherit;font-size:12px;padding:6px 12px;border-radius:9px;cursor:pointer;
  transition:border-color .18s,background .18s,transform .12s,filter .18s}
.mrel-btn:hover{border-color:var(--mrel-line-strong);filter:brightness(1.06)}
.mrel-btn:active{transform:scale(.97)}
.mrel-btn:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--mrel-accent) 26%,transparent)}
.mrel-btn:disabled{opacity:.45;cursor:default;transform:none;filter:none}
.mrel-btn-primary{background:var(--mrel-accent);border-color:transparent;color:#0b1020;font-weight:600}
.mrel-btn-primary:hover{filter:brightness(1.06);box-shadow:0 4px 14px color-mix(in oklab,var(--mrel-accent) 30%,transparent)}
.mrel-btn-danger:hover{border-color:var(--mrel-bad);color:var(--mrel-bad)}

/* ── 表单 ─────────────────────────────────────────────── */
.mrel-input{appearance:none;width:100%;font:inherit;font-size:12.5px;color:var(--mrel-fg);
  background:var(--mrel-surface-2);border:1px solid var(--mrel-line);border-radius:9px;
  padding:7px 10px;outline:none;transition:border-color .18s,box-shadow .18s,background .18s}
.mrel-input:hover{border-color:var(--mrel-line-strong)}
.mrel-input:focus{border-color:var(--mrel-accent);background:var(--mrel-surface);
  box-shadow:0 0 0 3px color-mix(in oklab,var(--mrel-accent) 20%,transparent)}
.mrel-label{display:block;font-size:11.5px;color:var(--mrel-soft);margin-bottom:5px;letter-spacing:.01em}

/* ── 开关 ─────────────────────────────────────────────── */
.mrel-switch{position:relative;display:inline-flex;align-items:center;gap:8px;cursor:pointer;user-select:none}
.mrel-switch input{position:absolute;opacity:0;width:0;height:0}
.mrel-track{width:34px;height:20px;border-radius:999px;position:relative;
  background:color-mix(in oklab,currentColor 18%,transparent);
  transition:background .22s cubic-bezier(.22,.68,.24,1)}
.mrel-knob{position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#fff;
  transition:transform .22s cubic-bezier(.22,.68,.24,1);box-shadow:0 1px 2px rgba(0,0,0,.35)}
.mrel-switch input:checked + .mrel-track{background:var(--mrel-ok)}
.mrel-switch input:checked + .mrel-track .mrel-knob{transform:translateX(14px)}
.mrel-switch input:focus-visible + .mrel-track{box-shadow:0 0 0 3px color-mix(in oklab,var(--mrel-ok) 24%,transparent)}

/* ── 标签 / 提示 ──────────────────────────────────────── */
.mrel-tag{display:inline-flex;align-items:center;gap:5px;font-size:11px;padding:2px 8px;border-radius:7px;
  background:color-mix(in oklab,currentColor 8%,transparent);color:var(--mrel-soft)}
.mrel-tag-ok{color:var(--mrel-ok);background:color-mix(in oklab,var(--mrel-ok) 14%,transparent)}
.mrel-tag-bad{color:var(--mrel-bad);background:color-mix(in oklab,var(--mrel-bad) 14%,transparent)}
.mrel-notice{font-size:12px;padding:8px 12px;border-radius:10px;border:1px solid var(--mrel-line);
  animation:mrel-rise .3s ease both}
.mrel-notice-ok{color:var(--mrel-ok);border-color:color-mix(in oklab,var(--mrel-ok) 32%,transparent);
  background:color-mix(in oklab,var(--mrel-ok) 9%,transparent)}
.mrel-notice-bad{color:var(--mrel-bad);border-color:color-mix(in oklab,var(--mrel-bad) 32%,transparent);
  background:color-mix(in oklab,var(--mrel-bad) 9%,transparent)}

/* ── 模型列表 ─────────────────────────────────────────── */
.mrel-models{display:flex;flex-direction:column;border:1px solid var(--mrel-line);
  border-radius:var(--mrel-r);overflow:hidden;background:var(--mrel-surface)}
.mrel-model{display:flex;align-items:center;gap:12px;padding:11px 14px;
  border-bottom:1px solid var(--mrel-line);transition:background .18s}
.mrel-model:last-child{border-bottom:0}
.mrel-model:hover{background:var(--mrel-surface-2)}
.mrel-model-main{flex:1 1 auto;min-width:0}
.mrel-model-name{font-weight:600;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.mrel-model-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--mrel-faint)}
.mrel-model-desc{font-size:11.5px;color:var(--mrel-soft);margin-top:2px;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.mrel-model-over{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
  padding:0 14px 14px;background:var(--mrel-surface);animation:mrel-rise .26s ease both}

/* ── 进度条：填充带动画 ───────────────────────────────── */
.mrel-meter{height:6px;border-radius:999px;background:color-mix(in oklab,currentColor 11%,transparent);
  overflow:hidden}
.mrel-meter i{display:block;height:100%;border-radius:999px;background:var(--mrel-accent);
  transition:width .55s cubic-bezier(.22,.68,.24,1)}
.mrel-meter-ok i{background:var(--mrel-ok)}
.mrel-meter-warn i{background:var(--mrel-warn)}
.mrel-meter-bad i{background:var(--mrel-bad)}

/* ── 统计卡 ───────────────────────────────────────────── */
.mrel-stats{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
.mrel-stat{background:var(--mrel-surface);border:1px solid var(--mrel-line);
  border-radius:var(--mrel-r);padding:12px 14px;transition:border-color .2s,background .2s}
.mrel-stat:hover{border-color:var(--mrel-line-strong);background:var(--mrel-surface-2)}
.mrel-stat-k{font-size:11px;color:var(--mrel-faint);letter-spacing:.04em;text-transform:uppercase}
.mrel-stat-v{font-size:19px;font-weight:660;margin-top:4px;letter-spacing:-.02em;
  font-variant-numeric:tabular-nums}

/* ── 空态 / 加载 ──────────────────────────────────────── */
.mrel-empty{padding:22px;text-align:center;color:var(--mrel-soft);font-size:12px;
  animation:mrel-pulse 1.6s ease-in-out infinite}

@keyframes mrel-rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes mrel-pulse{0%,100%{opacity:.5}50%{opacity:1}}

@media (prefers-reduced-motion:reduce){
  .mrel *,.mrel{animation:none!important;transition:none!important}
}
`

    function ensureStyle() {
      if (typeof document === 'undefined') return
      if (document.getElementById(STYLE_ID) !== null) return
      const el = document.createElement('style')
      el.id = STYLE_ID
      el.textContent = CSS
      document.head.appendChild(el)
    }

    // ── data layer ──────────────────────────────────────────────────────────
    async function getJSON(path) {
      const response = await fetch(`${API}${path}`, {
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json()
    }

    async function callRemote(ctx, namespace, method, ...args) {
      const result = await ctx.remote[namespace][method](...args)
      if (result === null || typeof result !== 'object' || result.ok !== true) {
        const failure = result?.error
        throw new Error(failure?.message ?? `${namespace}.${method} failed`)
      }
      return result.value
    }

    function fill(template, params) {
      return String(template).replace(/\{(\w+)\}/g, (_, key) => String(params?.[key] ?? ''))
    }

    function money(value, unit) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
      const symbol = unit === undefined || unit === 'USD' ? '$' : unit === 'EUR' ? '€' : ''
      return symbol === '' ? `${value.toFixed(2)} ${unit}` : `${symbol}${value.toFixed(2)}`
    }

    function whenText(iso, t) {
      if (typeof iso !== 'string' || iso === '') return t('none')
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return t('none')
      const days = Math.round((date.getTime() - Date.now()) / 86400000)
      if (days > 1) return `${days} d`
      const hours = Math.round((date.getTime() - Date.now()) / 3600000)
      return hours >= 1 ? `${hours} h` : '< 1 h'
    }

    function minutesAgo(ts, t) {
      if (typeof ts !== 'number') return ''
      const minutes = Math.max(0, Math.round((Date.now() - ts) / 60000))
      return minutes <= 0 ? 'just now' : `${minutes} min`
    }

    // ── atoms ───────────────────────────────────────────────────────────────
    function Chip({ children, tone }) {
      const cls = tone === 'ok' ? 'mrel-chip mrel-tag mrel-tag-ok' : tone === 'bad' ? 'mrel-chip mrel-tag mrel-tag-bad' : 'mrel-chip'
      return h('span', { className: cls }, children)
    }

    function Switch({ checked, onChange, label, disabled }) {
      return h(
        'label',
        { className: 'mrel-switch', title: label },
        h('input', { type: 'checkbox', checked: !!checked, disabled: !!disabled, onChange: (e) => onChange(e.target.checked) }),
        h('span', { className: 'mrel-track' }, h('span', { className: 'mrel-knob' })),
        label ? h('span', { className: 'mrel-hint' }, label) : null,
      )
    }

    function Field({ label, hint, children }) {
      return h('div', null, h('span', { className: 'mrel-label' }, label), children, hint ? h('div', { className: 'mrel-hint', style: { marginTop: 4 } }, hint) : null)
    }

    function Notice({ notice, t }) {
      if (!notice) return null
      const cls = notice.kind === 'error' ? 'mrel-notice mrel-notice-bad' : 'mrel-notice mrel-notice-ok'
      return h('div', { className: cls, role: 'status' }, notice.text)
    }

    function Meter({ percent, tone }) {
      const clamped = Math.max(0, Math.min(100, typeof percent === 'number' && Number.isFinite(percent) ? percent : 0))
      return h('div', { className: `mrel-meter${tone ? ` mrel-meter-${tone}` : ''}` }, h('i', { style: { width: `${clamped}%` } }))
    }

    // ── settings surface ────────────────────────────────────────────────────
    /** 单页设置里的一段：标题 + 内容。 */
    function Section({ title, children, index = 0 }) {
      return h('section', {
        className: 'mrel-section',
        style: { animationDelay: `${index * 60}ms` },
      },
        h('div', { className: 'mrel-section-title' }, title),
        children,
      )
    }

    function SettingsSurface({ ctx, t }) {
      ensureStyle()
      const [load, setLoad] = useState({ status: 'loading', meta: null, value: {}, revision: undefined, creds: {}, models: [], error: null })
      const [draft, setDraft] = useState(null)
      const [notice, setNotice] = useState(null)
      const [busy, setBusy] = useState(false)
      const [keyDraft, setKeyDraft] = useState({})
      const [testing, setTesting] = useState({})
      const [query, setQuery] = useState('')
      const [onlyEnabled, setOnlyEnabled] = useState(false)
      const [openModel, setOpenModel] = useState(null)
      const [refreshing, setRefreshing] = useState(false)

      const reload = useCallback(async () => {
        try {
          const meta = await getJSON('/meta')
          const described = await callRemote(ctx, 'settings', 'describe')
          const view = described.namespaces.find((entry) => entry.ns === meta.settingsNs)
          const value = view?.value ?? {}
          const refs = new Set([meta.usage.adminCookieEnv, 'MISTRAL_API_KEY'])
          for (const account of value.accounts ?? []) if (account?.apiKeyEnv) refs.add(account.apiKeyEnv)
          const creds = await callRemote(ctx, 'credentials', 'describe', Array.from(refs))
          const models = ((await getJSON('/models')).models ?? []).map((model) => ({
            ...model,
            originalContextWindow: model.contextWindow,
            originalMaxTokens: model.maxTokens,
            reasoningEffort: model.defaultReasoning ?? '',
          }))
          setLoad({ status: 'ready', meta, value, revision: view?.revision, creds, models, error: null })
          setDraft({
            accounts: (value.accounts?.length > 0 ? value.accounts : [{ name: 'default', apiKeyEnv: 'MISTRAL_API_KEY', baseURL: '', enabled: true }]).map((account) => ({
              name: account.name ?? '',
              apiKeyEnv: account.apiKeyEnv ?? 'MISTRAL_API_KEY',
              baseURL: account.baseURL && account.baseURL !== meta.baseURL ? account.baseURL : '',
              enabled: account.enabled !== false,
            })),
            usage: {
              display: value.usage?.display ?? meta.usage?.display ?? 'auto',
              refreshSeconds: value.usage?.refreshSeconds ?? meta.usage?.refreshSeconds ?? 60,
              adminCookieEnv: value.usage?.adminCookieEnv ?? meta.usage?.adminCookieEnv ?? 'MISTRAL_ADMIN_COOKIE',
              showCredits: value.usage?.showCredits !== false,
            },
            advanced: { ...(meta.advanced ?? {}), ...(value.advanced ?? {}) },
          })
        } catch (error) {
          setLoad((current) => ({ ...current, status: 'error', error: String(error?.message ?? error) }))
        }
      }, [ctx])

      useEffect(() => { void reload() }, [reload])

      const patch = useCallback(async (next, okText) => {
        if (!load.meta) return
        setBusy(true)
        setNotice(null)
        try {
          await callRemote(ctx, 'settings', 'update', load.meta.settingsNs, next, load.revision)
          setNotice({ kind: 'ok', text: okText ?? t('saved') })
          await reload()
        } catch (error) {
          setNotice({ kind: 'error', text: fill(t('saveFailed'), { message: String(error?.message ?? error) }) })
        } finally {
          setBusy(false)
        }
      }, [ctx, load.meta, load.revision, reload, t])

      const serializeAccounts = (accounts) => accounts.map((account) => ({
        name: account.name.trim() === '' ? 'default' : account.name.trim(),
        apiKeyEnv: account.apiKeyEnv.trim() === '' ? 'MISTRAL_API_KEY' : account.apiKeyEnv.trim(),
        baseURL: account.baseURL?.trim() ?? '',
        enabled: account.enabled !== false,
      }))

      const moveAccount = (index, delta) => {
        const next = [...draft.accounts]
        const target = index + delta
        if (target < 0 || target >= next.length) return
        ;[next[index], next[target]] = [next[target], next[index]]
        setDraft({ ...draft, accounts: next })
        void patch({ accounts: serializeAccounts(next) })
      }

      const saveKey = async (ref, accounts) => {
        const value = (keyDraft[ref] ?? '').trim()
        if (value === '' || accounts === undefined) return
        setBusy(true)
        setNotice(null)
        try {
          await callRemote(ctx, 'credentials', 'set', ref, value)
          setKeyDraft((current) => ({ ...current, [ref]: '' }))
          setNotice({ kind: 'ok', text: t('saved') })
          await patch({ accounts: serializeAccounts(accounts) })
        } catch (error) {
          setNotice({ kind: 'error', text: fill(t('saveFailed'), { message: String(error?.message ?? error) }) })
        } finally {
          setBusy(false)
        }
      }

      const testAccount = async (name) => {
        setTesting((current) => ({ ...current, [name]: true }))
        setNotice(null)
        try {
          const result = await getJSON(`/test?account=${encodeURIComponent(name)}`)
          setNotice(result.ok === true
            ? { kind: 'ok', text: `${name}: ${t('testOk')}` }
            : { kind: 'error', text: `${name}: ${t('testFail')} — ${result.error?.message ?? result.error?.code ?? ''}` })
        } catch (error) {
          setNotice({ kind: 'error', text: `${name}: ${t('testFail')} — ${String(error?.message ?? error)}` })
        } finally {
          setTesting((current) => ({ ...current, [name]: false }))
        }
      }

      const refreshModels = async () => {
        setRefreshing(true)
        setNotice(null)
        try {
          const result = await getJSON('/refresh')
          await reload()
          setNotice({ kind: 'ok', text: `${t('refresh')}: ${result.discovered ?? 0}` })
        } catch (error) {
          setNotice({ kind: 'error', text: fill(t('saveFailed'), { message: String(error?.message ?? error) }) })
        } finally {
          setRefreshing(false)
        }
      }

      const saveModel = (id, override) => {
        const current = { ...(value.models ?? {}) }
        current[id] = { ...(current[id] ?? {}), ...override }
        void patch({ models: current })
      }

      const keyState = (ref) => {
        const entry = load.creds?.[ref]
        const configured = Array.isArray(entry) ? entry.length > 0 : entry !== undefined && entry !== null && entry !== false
        return configured
      }

      const value = load.value ?? {}
      const accounts = draft?.accounts ?? []
      const accountCount = accounts.filter((a) => a.enabled !== false).length
      const models = load.models ?? []
      const visibleModels = models.filter((m) => m.visible !== false).length
      const filtered = models.filter((model) => {
        if (onlyEnabled && model.visible === false) return false
        if (query.trim() === '') return true
        const needle = query.trim().toLowerCase()
        return String(model.id).toLowerCase().includes(needle) || String(model.name ?? '').toLowerCase().includes(needle)
      })

      if (load.status === 'loading') return h('div', { className: 'mrel' }, h('div', { className: 'mrel-empty' }, '…'))
      if (load.status === 'error') {
        return h('div', { className: 'mrel' }, h(Notice, { notice: { kind: 'error', text: fill(t('loadFailed'), { message: load.error }) }, t }))
      }

      const accountsPanel = h(
        'div',
        { className: 'mrel-panel' },
        h('div', { className: 'mrel-hint' }, t('accountsHint')),
        h(
          'div',
          { className: 'mrel-grid' },
          accounts.map((account, index) =>
            h(
              'div',
              { className: 'mrel-card', key: `${account.name}-${index}` },
              h(
                'div',
                { className: 'mrel-card-head' },
                h('div', null,
                  h('div', { className: 'mrel-card-name' }, account.name || `account-${index + 1}`),
                  h('div', { className: 'mrel-mono' }, account.apiKeyEnv),
                ),
                h(Switch, {
                  checked: account.enabled !== false,
                  label: account.enabled !== false ? t('enabled') : t('disabled'),
                  onChange: (next) => {
                    const copy = accounts.map((entry, i) => (i === index ? { ...entry, enabled: next } : entry))
                    setDraft({ ...draft, accounts: copy })
                    void patch({ accounts: serializeAccounts(copy) })
                  },
                }),
              ),
              h('div', { style: { marginTop: 10 } },
                h(Chip, { tone: keyState(account.apiKeyEnv) ? 'ok' : undefined },
                  h('span', { className: 'mrel-dot', style: { background: keyState(account.apiKeyEnv) ? 'var(--mrel-ok)' : 'var(--mrel-warn)' } }),
                  keyState(account.apiKeyEnv) ? t('keyReady') : t('keyMissing'),
                ),
              ),
              h('div', { style: { marginTop: 12 } },
                h('input', {
                  className: 'mrel-input',
                  type: 'password',
                  placeholder: t('keyPlaceholder'),
                  value: keyDraft[account.apiKeyEnv] ?? '',
                  onChange: (e) => setKeyDraft({ ...keyDraft, [account.apiKeyEnv]: e.target.value }),
                }),
              ),
              h('div', { className: 'mrel-row', style: { marginTop: 10 } },
                h('button', {
                  className: 'mrel-btn mrel-btn-primary',
                  disabled: busy || (keyDraft[account.apiKeyEnv] ?? '').trim() === '',
                  onClick: () => void saveKey(account.apiKeyEnv, accounts),
                }, t('saveKey')),
                h('button', {
                  className: 'mrel-btn',
                  disabled: testing[account.name] === true,
                  onClick: () => void testAccount(account.name),
                }, testing[account.name] ? t('testing') : t('test')),
                keyState(account.apiKeyEnv)
                  ? h('button', {
                      className: 'mrel-btn',
                      disabled: busy,
                      onClick: async () => {
                        setBusy(true)
                        try {
                          await callRemote(ctx, 'credentials', 'unset', account.apiKeyEnv)
                          await reload()
                        } catch (error) {
                          setNotice({ kind: 'error', text: fill(t('saveFailed'), { message: String(error?.message ?? error) }) })
                        } finally { setBusy(false) }
                      },
                    }, t('clearKey'))
                  : null,
                h('button', { className: 'mrel-btn', disabled: index === 0 || busy, onClick: () => moveAccount(index, -1) }, t('moveUp')),
                h('button', { className: 'mrel-btn', disabled: index === accounts.length - 1 || busy, onClick: () => moveAccount(index, 1) }, t('moveDown')),
                h('button', {
                  className: 'mrel-btn mrel-btn-danger',
                  disabled: busy || accounts.length <= 1,
                  onClick: () => {
                    const copy = accounts.filter((_, i) => i !== index)
                    setDraft({ ...draft, accounts: copy })
                    void patch({ accounts: serializeAccounts(copy) })
                  },
                }, t('remove')),
              ),
            ),
          ),
          h('button', {
            className: 'mrel-card',
            style: { cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' },
            onClick: () => {
              const copy = [...accounts, { name: `account-${accounts.length + 1}`, apiKeyEnv: 'MISTRAL_API_KEY', baseURL: '', enabled: true }]
              setDraft({ ...draft, accounts: copy })
              void patch({ accounts: serializeAccounts(copy) })
            },
          }, h('div', { className: 'mrel-card-name' }, `+ ${t('addAccount')}`)),
        ),
      )

      const modelsPanel = h(
        'div',
        { className: 'mrel-panel' },
        h(Notice, { notice, t }),
        h('div', { className: 'mrel-hint' }, t('modelsHint')),
        h(
          'div',
          { className: 'mrel-row' },
          h('input', {
            className: 'mrel-input',
            style: { maxWidth: 260 },
            placeholder: t('search'),
            value: query,
            onChange: (e) => setQuery(e.target.value),
          }),
          h(Switch, { checked: onlyEnabled, label: t('onlyEnabled'), onChange: setOnlyEnabled }),
          h('div', { style: { flex: '1 1 auto' } }),
          h('button', { className: 'mrel-btn', disabled: refreshing, onClick: () => void refreshModels() },
            refreshing ? t('refreshing') : t('refresh')),
        ),
        h(
          'div',
          { className: 'mrel-models' },
          filtered.length === 0
            ? h('div', { className: 'mrel-empty' }, t('none'))
            : filtered.map((model) =>
                h(
                  'div',
                  { key: model.id },
                  h(
                    'div',
                    { className: 'mrel-model' },
                    h('div', { className: 'mrel-model-main' },
                      h('div', { className: 'mrel-model-name' },
                        model.name ?? model.id,
                        Array.isArray(model.input) && model.input.includes('image') ? h('span', { className: 'mrel-tag' }, t('vision')) : null,
                        model.reasoningEfforts?.length > 0 ? h('span', { className: 'mrel-tag' }, t('reasoning')) : null,
                      ),
                      h('div', { className: 'mrel-model-id' }, model.id),
                      model.description ? h('div', { className: 'mrel-model-desc' }, model.description) : null,
                    ),
                    h('span', { className: 'mrel-mono' }, `${Math.round((model.contextWindow ?? 0) / 1000)}k`),
                    h(Switch, {
                      checked: model.visible !== false,
                      onChange: (next) => {
                        saveModel(model.id, { visible: next })
                      },
                    }),
                    h('button', {
                      className: 'mrel-btn',
                      onClick: () => setOpenModel(openModel === model.id ? null : model.id),
                    }, openModel === model.id ? '−' : '⋯'),
                  ),
                  openModel === model.id
                    ? h('div', { className: 'mrel-model-over' },
                        h(Field, { label: t('displayName'), hint: t('displayNameHint') },
                          h('input', {
                            className: 'mrel-input',
                            defaultValue: model.name ?? '',
                            onBlur: (e) => {
                              const next = e.target.value.trim()
                              if (next === '' || next === model.name) return
                              saveModel(model.id, { name: next })
                            },
                          }),
                        ),
                        h(Field, { label: t('vision'), hint: t('visionHint') },
                          h(Switch, {
                            checked: Array.isArray(model.input) && model.input.includes('image'),
                            label: Array.isArray(model.input) && model.input.includes('image') ? t('visionOn') : t('visionOff'),
                            onChange: (next) => saveModel(model.id, { input: next ? ['text', 'image'] : ['text'] }),
                          }),
                        ),
                        h(Field, { label: t('context') },
                          h('input', {
                            className: 'mrel-input',
                            type: 'number',
                            defaultValue: model.contextWindow ?? '',
                            onBlur: (e) => {
                              const next = Number(e.target.value)
                              if (!Number.isFinite(next) || next <= 0 || next === model.originalContextWindow) return
                              saveModel(model.id, { contextWindow: next })
                            },
                          }),
                        ),
                        h(Field, { label: t('maxTokens') },
                          h('input', {
                            className: 'mrel-input',
                            type: 'number',
                            defaultValue: model.maxTokens ?? '',
                            onBlur: (e) => {
                              const next = Number(e.target.value)
                              if (!Number.isFinite(next) || next <= 0 || next === model.originalMaxTokens) return
                              saveModel(model.id, { maxTokens: next })
                            },
                          }),
                        ),
                        h(Field, { label: t('effort') },
                          h('select', {
                            className: 'mrel-input',
                            value: model.reasoningEffort ?? '',
                            onChange: (e) => saveModel(model.id, { reasoningEffort: e.target.value || undefined }),
                          },
                            h('option', { value: '' }, t('none')),
                            (model.reasoningEfforts ?? []).map((effort) => h('option', { key: effort?.id ?? effort, value: effort?.id ?? effort }, effort?.name ?? effort?.id ?? effort)),
                          ),
                        ),
                      )
                    : null,
                ),
              ),
        ),
      )

      const usagePanel = h(UsageTab, { ctx, t, meta: load.meta, value, accounts })

      const advancedPanel = draft === null ? null : h(
        'div',
        { className: 'mrel-panel' },
        h(Notice, { notice, t }),
        h('div', { className: 'mrel-hint' }, t('advancedHint')),
        h(
          'div',
          { className: 'mrel-card' },
          h('div', { className: 'mrel-grid' },
            h(Field, { label: t('display'), hint: t('usageHint') },
              h('select', {
                className: 'mrel-input',
                value: draft.usage.display,
                onChange: (e) => setDraft({ ...draft, usage: { ...draft.usage, display: e.target.value } }),
              },
                h('option', { value: 'auto' }, t('displayAuto')),
                h('option', { value: 'always' }, t('displayAlways')),
                h('option', { value: 'off' }, t('displayOff')),
              ),
            ),
            h(Field, { label: t('refreshSeconds') },
              h('input', {
                className: 'mrel-input', type: 'number', min: 15, max: 3600,
                value: draft.usage.refreshSeconds,
                onChange: (e) => setDraft({ ...draft, usage: { ...draft.usage, refreshSeconds: Number(e.target.value) } }),
              }),
            ),
            h(Field, { label: t('adminCookie') },
              h('input', {
                className: 'mrel-input',
                value: draft.usage.adminCookieEnv,
                onChange: (e) => setDraft({ ...draft, usage: { ...draft.usage, adminCookieEnv: e.target.value } }),
              }),
            ),
            h(Field, { label: t('cooldownSeconds') },
              h('input', {
                className: 'mrel-input', type: 'number', min: 0,
                value: draft.advanced.cooldownSeconds ?? 0,
                onChange: (e) => setDraft({ ...draft, advanced: { ...draft.advanced, cooldownSeconds: Number(e.target.value) } }),
              }),
            ),
            h(Field, { label: t('maxTokensCap'), hint: '0 = ' + t('none') },
              h('input', {
                className: 'mrel-input', type: 'number', min: 0,
                value: draft.advanced.maxTokensCap ?? 0,
                onChange: (e) => setDraft({ ...draft, advanced: { ...draft.advanced, maxTokensCap: Number(e.target.value) } }),
              }),
            ),
            h(Field, { label: t('modelsRefreshMinutes') },
              h('input', {
                className: 'mrel-input', type: 'number', min: 1,
                value: draft.advanced.modelsRefreshMinutes ?? 30,
                onChange: (e) => setDraft({ ...draft, advanced: { ...draft.advanced, modelsRefreshMinutes: Number(e.target.value) } }),
              }),
            ),
            h(Field, { label: t('requestTimeoutMs') },
              h('input', {
                className: 'mrel-input', type: 'number', min: 1000,
                value: draft.advanced.requestTimeoutMs ?? '',
                onChange: (e) => setDraft({ ...draft, advanced: { ...draft.advanced, requestTimeoutMs: Number(e.target.value) } }),
              }),
            ),
            h(Field, { label: t('streamIdleTimeoutMs') },
              h('input', {
                className: 'mrel-input', type: 'number', min: 1000,
                value: draft.advanced.streamIdleTimeoutMs ?? '',
                onChange: (e) => setDraft({ ...draft, advanced: { ...draft.advanced, streamIdleTimeoutMs: Number(e.target.value) } }),
              }),
            ),
            h(Field, { label: t('promptCacheKey') },
              h('select', {
                className: 'mrel-input',
                value: draft.advanced.promptCacheKey ?? 'auto',
                onChange: (e) => setDraft({ ...draft, advanced: { ...draft.advanced, promptCacheKey: e.target.value } }),
              },
                h('option', { value: 'auto' }, t('displayAuto')),
                h('option', { value: 'off' }, t('displayOff')),
              ),
            ),
            h(Field, { label: t('compaction'), hint: t('compactionHint') },
              h(Switch, {
                checked: draft.advanced.compaction !== false,
                label: draft.advanced.compaction !== false ? t('enabled') : t('disabled'),
                onChange: (next) => setDraft({ ...draft, advanced: { ...draft.advanced, compaction: next } }),
              }),
            ),
            h(Field, { label: t('compactThreshold') },
              h('input', {
                className: 'mrel-input', type: 'number', min: 0.3, max: 0.98, step: 0.05,
                value: draft.advanced.compactThreshold ?? 0.75,
                onChange: (e) => setDraft({ ...draft, advanced: { ...draft.advanced, compactThreshold: Number(e.target.value) } }),
              }),
            ),
            h(Field, { label: t('compactKeepTokens') },
              h('input', {
                className: 'mrel-input', type: 'number', min: 2000,
                value: draft.advanced.compactKeepTokens ?? 24000,
                onChange: (e) => setDraft({ ...draft, advanced: { ...draft.advanced, compactKeepTokens: Number(e.target.value) } }),
              }),
            ),
            h(Field, { label: t('compactSummaryMaxTokens') },
              h('input', {
                className: 'mrel-input', type: 'number', min: 200, max: 8000,
                value: draft.advanced.compactSummaryMaxTokens ?? 1500,
                onChange: (e) => setDraft({ ...draft, advanced: { ...draft.advanced, compactSummaryMaxTokens: Number(e.target.value) } }),
              }),
            ),
            h(Field, { label: t('failover') },
              h(Switch, {
                checked: draft.advanced.failover !== false,
                label: draft.advanced.failover !== false ? t('enabled') : t('disabled'),
                onChange: (next) => setDraft({ ...draft, advanced: { ...draft.advanced, failover: next } }),
              }),
            ),
          ),
          h('div', { className: 'mrel-row', style: { marginTop: 14 } },
            h('button', {
              className: 'mrel-btn mrel-btn-primary',
              disabled: busy,
              onClick: () => void patch({ usage: draft.usage, advanced: draft.advanced }),
            }, t('save')),
          ),
        ),
      )

      return h(
        'div',
        { className: 'mrel' },
        h('div', { className: 'mrel-head' },
          h('div', null,
            h('div', { className: 'mrel-title' }, t('sectionTitle')),
            h('div', { className: 'mrel-sub' }, t('subtitle')),
          ),
          h('div', { className: 'mrel-chips' },
            h(Chip, null, h('b', null, accountCount), ` ${t('accounts')}`),
            h(Chip, null, h('b', null, visibleModels), ` ${t('models')}`),
            h(Chip, { tone: models.length > 0 ? 'ok' : undefined }, h('span', { className: 'mrel-dot', style: { background: models.length > 0 ? 'var(--mrel-ok)' : 'var(--mrel-warn)' } }), load.meta?.provider ?? NS),
          ),
        ),
        h(Notice, { notice, t }),
        h(Section, { title: t('tabUsage'), index: 0 }, usagePanel),
        h(Section, { title: t('tabAccounts'), index: 1 }, accountsPanel),
        h(Section, { title: t('tabModels'), index: 2 }, modelsPanel),
        h(Section, { title: t('tabAdvanced'), index: 3 }, advancedPanel),
      )
    }

    // ── allowance ───────────────────────────────────────────────────────────
    function useUsage(ctx, meta, account) {
      const [state, setState] = useState({ status: 'idle', usage: null, error: null })
      const load = useCallback(async (force) => {
        setState((current) => ({ ...current, status: 'loading' }))
        try {
          const result = await getJSON(`/usage?force=${force ? 1 : 0}${account ? `&account=${encodeURIComponent(account)}` : ''}`)
          setState({ status: 'ready', usage: result, error: result?.ok === false ? result.error?.message ?? 'failed' : null })
        } catch (error) {
          setState({ status: 'ready', usage: null, error: String(error?.message ?? error) })
        }
      }, [account])
      useEffect(() => {
        if (meta?.usage?.display === 'off') return undefined
        void load(false)
        return undefined
      }, [load, meta])
      return { ...state, refresh: () => load(true) }
    }

    function usagePercent(usage) {
      const plan = usage?.plan?.total ?? usage?.plan?.credits
      const used = usage?.plan?.used ?? usage?.spend?.amount
      if (typeof plan !== 'number' || plan <= 0 || typeof used !== 'number') return undefined
      return Math.round((used / plan) * 100)
    }

    function windowOf(usage, prefer) {
      const windows = Array.isArray(usage?.windows) ? usage.windows : []
      return windows.find((w) => w.id === prefer) ?? windows[0]
    }

    function money2(value, unit) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
      const symbol = !unit || unit === 'USD' ? '$' : unit === 'EUR' ? '€' : ''
      return symbol === '' ? `${value.toFixed(2)} ${unit}` : `${symbol}${value.toFixed(2)}`
    }

    function toneOf(percent) {
      if (typeof percent !== 'number') return undefined
      return percent >= 95 ? 'bad' : percent >= 75 ? 'warn' : 'ok'
    }

    function UsageTab({ ctx, t, meta, value, accounts }) {
      const [account, setAccount] = useState(undefined)
      const { status, usage, error, refresh } = useUsage(ctx, meta, account)
      const windows = Array.isArray(usage?.windows) ? usage.windows : []
      return h(
        'div',
        { className: 'mrel-panel' },
        h('div', { className: 'mrel-row' },
          accounts.length > 1
            ? h('select', {
                className: 'mrel-input',
                style: { maxWidth: 220 },
                value: account ?? '',
                onChange: (e) => setAccount(e.target.value === '' ? undefined : e.target.value),
              },
                h('option', { value: '' }, t('none')),
                accounts.map((entry) => h('option', { key: entry.name, value: entry.name }, entry.name)),
              )
            : null,
          h('div', { className: 'mrel-row', style: { gap: 8 } },
            usage?.plan ? h(Chip, { tone: 'ok' }, usage.plan) : null,
            windows[0]?.unit ? h(Chip, null, windows[0].unit) : null,
          ),
          h('div', { style: { flex: '1 1 auto' } }),
          h('button', { className: 'mrel-btn', disabled: status === 'loading', onClick: () => void refresh() },
            status === 'loading' ? t('refreshing') : t('refresh')),
        ),
        error ? h(Notice, { notice: { kind: 'error', text: error }, t }) : null,
        windows.length === 0
          ? h('div', { className: 'mrel-card' },
              h('div', { className: 'mrel-hint' }, usage === null ? t('noUsage') : t('noAllowance')),
              usage?.error?.message ? h('div', { className: 'mrel-hint', style: { marginTop: 6 } }, usage.error.message) : null,
            )
          : h('div', { className: 'mrel-grid' },
              windows.map((win) =>
                h('div', { className: 'mrel-card', key: win.id ?? win.label },
                  h('div', { className: 'mrel-row', style: { justifyContent: 'space-between' } },
                    h('span', { className: 'mrel-card-name' }, win.label ?? win.id ?? t('usage')),
                    h('span', { className: 'mrel-mono' }, typeof win.percent === 'number' ? `${win.percent.toFixed(2)}%` : '—'),
                  ),
                  h('div', { style: { marginTop: 10 } },
                    h(Meter, { percent: win.percent, tone: toneOf(win.percent) }),
                  ),
                  h('div', { className: 'mrel-row', style: { justifyContent: 'space-between', marginTop: 8 } },
                    h('span', { className: 'mrel-hint' }, `${money2(win.used, win.unit)} / ${money2(win.total, win.unit)}`),
                    h('span', { className: 'mrel-hint' }, win.resetsAt ? `${t('renews')} ${whenText(win.resetsAt, t)}` : ''),
                  ),
                ),
              ),
            ),
        h('div', { className: 'mrel-hint' },
          usage?.fetchedAt ? `${t('fetched')}: ${minutesAgo(usage.fetchedAt, t)}` : ''),
        h('div', { className: 'mrel-hint' }, t('usageSource')),
      )
    }

    // ── plugin wiring ───────────────────────────────────────────────────────
    return {
      inject: ['slots', 'locale', 'remote', 'remote.settings', 'remote.credentials'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH))
        ctx.effect(() => ctx.locale.register(NS, 'en', EN))
        const t = ctx.locale.bind(NS)

        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            { name: 'settings.section', id: NS, order: 22, label: () => t('sectionTitle') },
            (props) => h(SettingsSurface, { ...props, ctx, t }),
          ),
        )

      },
    }
  },
})
