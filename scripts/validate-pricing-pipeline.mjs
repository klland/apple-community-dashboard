import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const data = new URL('../src/data/', import.meta.url)
const source = fs.readFileSync(new URL('mockData.js', data), 'utf8')
const code = source.replace(/^import (\w+) from ['"](.+?)['"]\s*;?$/gm,
  (_, name, file) => `const ${name} = ${fs.readFileSync(new URL(file, data), 'utf8')};`)
  .replace(/\bexport /g, '')
const overrides = JSON.parse(fs.readFileSync(new URL('marketAdjustments.json', data))).marketAvg

function evaluate(at) {
  class TestDate extends Date {
    constructor(...args) { super(...(args.length ? args : [at])) }
    static now() { return new Date(at).getTime() }
  }
  const context = vm.createContext({ Date: TestDate })
  vm.runInContext(code + ';this.products = APPLE_PRODUCTS;', context)
  return context.products
}

function validate(products) {
  let variants = 0
  for (const product of products) {
    let previous = 0
    for (const storage of product.storages) {
      const price = product.marketAvg[storage]
      const label = `${product.id}/${storage}`
      assert(Number.isFinite(price) && price > 0, `${label}: invalid price ${price}`)
      assert.equal(price % 100, 0, `${label}: not NT$100 units`)
      if (['iPhone', 'iPad'].includes(product.category)) {
        assert(price >= previous, `${label}: capacity inversion`)
      }
      const input = overrides[product.id]?.[storage]
      if (Number.isFinite(input)) assert(price <= input, `${label}: override raised`)
      const ceiling = product.newProductPriceCeiling?.[storage]
      if (ceiling) assert(price <= ceiling, `${label}: exceeds new-price ceiling`)
      previous = price
      variants++
    }
  }
  return variants
}

// Evaluate the complete application module, including ordering and all guardrails.
const now = evaluate(new Date().toISOString())
const beforeExpiry = evaluate('2026-09-07T12:00:00+08:00')
const afterExpiry = evaluate('2026-09-16T12:00:00+08:00')
const variants = validate(now)
validate(beforeExpiry)
validate(afterExpiry)
for (const product of beforeExpiry) {
  const future = afterExpiry.find(p => p.id === product.id)
  if (!future) continue
  for (const storage of product.storages) {
    assert(future.marketAvg[storage] <= product.marketAvg[storage],
      `${product.id}/${storage}: source expiry raises price`)
  }
}
const standard13 = beforeExpiry.find(p => p.name === 'iPhone 13')
assert(standard13.marketAvg['256G'] > 3600, 'SE must not cap iPhone 13')
const septemberReleases = {
  'iphone-18-pro': { '256G': 44900, '512G': 51900, '1T': 66900, '2T': 88900 },
  'iphone-18-pro-max': { '256G': 49900, '512G': 56900, '1T': 71900, '2T': 93900 },
  'apple-watch-s12': { '42mm': 13900, '46mm': 15400 },
  'apple-watch-ultra-4': { '鈦金屬': 27900 },
  'airpods-5': { 'USB-C 充電盒': 4490, '無線充電盒': 5190 },
  'mac-mini-m6': { '16G/256G': 29900 },
  'mac-mini-m5-pro': { '24G/512G': 59900 },
  'mac-studio-m5-max': { '36G/512G': 84900 },
  'mac-studio-m5-ultra': { '96G/1T': 199900 },
}
const released = evaluate('2026-10-03T12:00:00+08:00')
assert.equal(new Set(released.map(p => p.id)).size, released.length, 'duplicate product IDs')
for (const [id, prices] of Object.entries(septemberReleases)) {
  const product = released.find(p => p.id === id)
  assert(product, `${id}: missing release`)
  assert.equal(product.referenceStatus, 'new_product_estimate')
  assert(product.sourceUrl.startsWith('https://www.apple.com/tw/'))
  assert.deepEqual(JSON.parse(JSON.stringify(product.launchPrice)), prices)
  assert.equal(product.storages.length, Object.keys(prices).length)
  for (const storage of product.storages) {
    assert(product.marketAvg[storage] < prices[storage], `${id}: estimate must be below new price`)
  }
  assert(!beforeExpiry.some(p => p.id === id), `${id}: shown before release`)
}
validate(released)
console.log(`Pricing pipeline passed: ${now.length} models, ${variants} variants; expiry regression passed.`)
