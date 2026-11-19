import { readConfig } from './lib/config.js'
import { resolveModelInfo } from './lib/catalog.js'

const cfg = { accounts: [{ name: 'a', apiKeyEnv: 'X', baseURL: '', enabled: true }], models: {}, advanced: {}, usage: {} }
const config = readConfig(cfg)

for (const id of ['deepseek-v4-1-flash-1017', 'deepseek-v4-flash-1017', 'zai-glm-5-3']) {
  const noListing = resolveModelInfo(id, config, [])
  console.log(`${id.padEnd(26)} no-listing input=${JSON.stringify(noListing.inputModalities)}`)
}
const listing = [{ id: 'deepseek-v4-1-flash-1017', vision: true }, { id: 'zai-glm-5-3', vision: false }]
for (const id of ['deepseek-v4-1-flash-1017', 'deepseek-v4-flash-1017']) {
  const withListing = resolveModelInfo(id, config, listing)
  console.log(`${id.padEnd(26)} with-listing input=${JSON.stringify(withListing.inputModalities)}`)
}
