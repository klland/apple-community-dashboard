import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const data = path.join(root, 'src/data')
const read = file => JSON.parse(fs.readFileSync(path.join(data, file), 'utf8'))
const text = fs.readFileSync(path.join(data, 'mockData.js'), 'utf8')
const catalogCode = text.slice(text.indexOf('const PRODUCT_CATALOG'), text.indexOf('const PRODUCT_MAX_AGE_YEARS'))
const context = {}
vm.createContext(context)
vm.runInContext(catalogCode + ';this.products=PRODUCT_CATALOG;', context)
const adjustments = read('marketAdjustments.json')
const changes = []
const sources = ['mikoPriceCeilings.json', 'jyesPriceCeilings.json', 'costcoPriceCeilings.json'].map(read).filter(source => {
  const age = Date.now() - new Date(source.meta.scrapedAt).getTime()
  return age >= 0 && age <= 14 * 86400000
})

function hasExactSpecification(product, storage, source) {
  if (!['iPad', 'Apple Watch', 'Mac', 'MacBook'].includes(product.category)) return true
  const spec = source.specifications?.[product.id]?.[storage]
  if (!spec) return false
  if (product.category === 'iPad') {
    const chip = product.id.match(/-(m\d+)-/)?.[1]?.toUpperCase()
    const capacity = storage.match(/(\d+)(?:G|T)/)?.[1]
    const storageGB = storage.endsWith('T') ? Number(capacity) * 1024 : Number(capacity)
    const memoryGB = product.id.includes('pro') && storageGB >= 1024 ? 16 : 12
    return spec.connectivity === 'Wi-Fi' && spec.chip === chip &&
      spec.storageGB === storageGB && spec.memoryGB === memoryGB
  }
  if (product.category === 'Apple Watch') {
    const ultra = product.id.includes('ultra')
    return spec.size === (ultra ? '49mm' : storage) &&
      spec.case === (ultra ? 'titanium' : 'aluminum') &&
      spec.connectivity === (ultra ? 'GPS+Cellular' : 'GPS')
  }
  const match = storage.match(/(\d+)G\/(\d+)(G|T)/)
  const cpu = Number(product.specLabel?.match(/(\d+)\s*核心 CPU/i)?.[1])
  const gpu = Number(product.specLabel?.match(/(\d+)\s*核心 GPU/i)?.[1])
  const storageGB = Number(match?.[2]) * (match?.[3] === 'T' ? 1024 : 1)
  return Boolean(match && product.specLabel?.includes(spec.chip) &&
    Number(match[1]) === spec.memoryGB && storageGB === spec.storageGB &&
    cpu === spec.cpuCores && gpu === spec.gpuCores)
}
// Materialize reductions as dated reference prices, so expiry cannot undo them.
for (const p of context.products) {
  for (const storage of p.storages) {
    const prices = sources
      .filter(s => hasExactSpecification(p, storage, s))
      .map(s => s.ceilings[p.id]?.[storage])
      .filter(n => Number.isFinite(n) && n > 0)
    if (!prices.length) continue
    const previous = adjustments.marketAvg[p.id]?.[storage] ?? p.marketAvg[storage]
    const next = Math.min(previous, Math.floor(Math.min(...prices) * 0.88 / 100) * 100)
    if (next === previous) continue
    adjustments.marketAvg[p.id] ??= {}
    adjustments.marketAvg[p.id][storage] = next
    changes.push({ id: p.id, storage, previous, next })
  }
}
if (changes.length) {
  adjustments.meta.referenceReview = { checkedAt: new Date().toISOString(), sources: sources.map(s => ({source:s.meta.source, checkedAt:s.meta.scrapedAt})), changes }
  fs.writeFileSync(path.join(data, 'marketAdjustments.json'), JSON.stringify(adjustments, null, 2) + '\n')
}
console.log(JSON.stringify({persistedReductions:changes.length, changes}, null, 2))
