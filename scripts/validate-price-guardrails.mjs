import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mockData = fs.readFileSync(path.join(rootDir, 'src/data/mockData.js'), 'utf8')
const adjustments = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/marketAdjustments.json'), 'utf8')).marketAvg || {}
const sources = ['mikoPriceCeilings.json', 'jyesPriceCeilings.json']
  .map(file => JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data', file), 'utf8')))
  .filter(source => source.meta?.scrapedAt && Date.now() - new Date(source.meta.scrapedAt).getTime() <= 14 * 24 * 60 * 60 * 1000)
  .map(source => source.ceilings || {})

const toHundredFloor = value => Math.floor(value / 100) * 100
const parsePairs = text => Object.fromEntries([...text.matchAll(/'([^']+)':\s*(\d+)/g)].map(([, key, value]) => [key, Number(value)]))
const blocks = [...mockData.matchAll(/\{\s*id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?storages:\s*\[([^\]]*)\][\s\S]*?marketAvg:\s*\{([\s\S]*?)\}\s*,[\s\S]*?tradeInPrice:/g)]

let corrected = 0
const invalidBands = []

for (const [, id, name, storageText, marketText] of blocks) {
  const marketAvg = { ...parsePairs(marketText), ...(adjustments[id] || {}) }
  for (const match of storageText.matchAll(/'([^']+)'/g)) {
    const storage = match[1]
    const newCashPrice = Math.min(...sources.map(source => source[id]?.[storage]).filter(Number.isFinite))
    const rawAverage = marketAvg[storage]
    if (!rawAverage || !Number.isFinite(newCashPrice)) continue

    const average = Math.min(rawAverage, toHundredFloor(newCashPrice * 0.88))
    const high = Math.min(toHundredFloor(average * 1.08), toHundredFloor(newCashPrice * 0.95))
    if (rawAverage !== average) corrected += 1
    if (high <= average) invalidBands.push(`${name} ${storage}`)
  }
}

if (invalidBands.length) {
  throw new Error(`成交區間無法保留偏高價：${invalidBands.join('、')}`)
}

console.log(`[price-guardrails] fresh-sources=${sources.length} corrected=${corrected} invalid-bands=0`)
