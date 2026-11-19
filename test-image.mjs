// 验证插件的图片链路：image block → attachments.readImage → data URI → 中继视觉。
import { readFileSync } from 'node:fs'
import { MistralProAdapter } from './lib/adapter.js'
import { readConfig } from './lib/config.js'

const apiKey = process.env.MISTRAL_API_KEY
if (!apiKey) { console.error('MISTRAL_API_KEY missing'); process.exit(2) }

const png = readFileSync(process.argv[2] ?? './test7788.png')

const config = {
  accounts: [{ name: 'mistral', apiKeyEnv: 'MISTRAL_API_KEY', baseURL: '', enabled: true }],
  models: {},
  advanced: { maxTokensCap: 0, modelsRefreshMinutes: 30, cooldownSeconds: 60 },
  usage: {},
}

const attachments = {
  async readImage() {
    return { data: png, ref: { mediaType: 'image/png' } }
  },
}

const ctx = {
  get: (name) => (name === 'attachments' ? attachments : undefined),
  logger: { warn: (m) => console.error('[warn]', m) },
  effect: () => {},
  emit: () => {},
}

const discovered = { ids: [], models: [] }
const pool = { attemptOrder: (c) => c.accounts, markSuccess() {}, markFailure() {} }
const adapter = new MistralProAdapter({ ctx, readConfig: () => readConfig(config), pool, discovered })

const modelId = process.argv[3] ?? 'deepseek-v4-flash-1017'
console.log('model id on selection:', modelId, '| image bytes:', png.length)

let text = ''
for await (const ev of adapter.stream({
  model: modelId,
  reasoningEffort: 'off',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What number is written in this image? Answer with the digits only.' },
        { type: 'image', attachment: { id: 'test7788', mediaType: 'image/png' } },
      ],
    },
  ],
})) {
  if (ev.type === 'text-delta') text += ev.text ?? ''
  if (ev.type === 'error') console.log('ERROR:', JSON.stringify(ev.error ?? ev).slice(0, 300))
}

console.log('answer:', JSON.stringify(text.trim()))
console.log('vision ok:', /7788/.test(text))
