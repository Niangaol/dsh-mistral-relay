// 用插件自己的适配器打真实中继，验证 wire-id 映射与流解析。
// 运行： node test-relay.mjs   （cwd = 本目录，环境需 MISTRAL_API_KEY）
import { MistralProAdapter } from './lib/adapter.js'
import { readConfig } from './lib/config.js'

const apiKey = process.env.MISTRAL_API_KEY
if (!apiKey) {
  console.error('MISTRAL_API_KEY missing')
  process.exit(2)
}

const config = {
  accounts: [{ name: 'mistral', apiKeyEnv: 'MISTRAL_API_KEY', baseURL: '', enabled: true }],
  models: {},
  advanced: { maxTokensCap: 0, modelsRefreshMinutes: 30, cooldownSeconds: 60 },
  usage: {},
}

const ctx = {
  get: () => undefined,
  logger: { warn: (m) => console.error('[warn]', m) },
  effect: () => {},
  emit: () => {},
}

const discovered = { ids: [], models: [] }
const pool = { attemptOrder: (c) => c.accounts, markSuccess() {}, markFailure() {} }

const adapter = new MistralProAdapter({
  ctx,
  readConfig: () => readConfig(config),
  pool,
  discovered,
})

// 故意用内置快照 id（中继并不认识），验证 buildBody 会映射成 live id
const modelId = process.argv[2] ?? 'deepseek-v4-flash-1017'
console.log('requested model id:', modelId)

let text = ''
let reasoning = ''
const events = []
for await (const ev of adapter.stream({
  model: modelId,
  messages: [{ role: 'user', content: [{ type: 'text', text: '用一句话说明什么是质数' }] }],
})) {
  events.push(ev.type)
  if (ev.type === 'text-delta' || ev.type === 'text_delta') text += ev.delta ?? ev.text ?? ''
  if (ev.type === 'reasoning-delta' || ev.type === 'reasoning_delta') reasoning += ev.delta ?? ev.text ?? ''
  if (ev.type === 'error') console.log('ERROR EVENT:', JSON.stringify(ev.error ?? ev).slice(0, 300))
}

console.log('event types:', [...new Set(events)].join(','))
console.log('reasoning chars:', reasoning.length, '|', reasoning.slice(0, 80).replace(/\n/g, ' '))
console.log('text chars:', text.length, '|', text.slice(0, 120).replace(/\n/g, ' '))
