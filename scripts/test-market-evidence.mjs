import assert from 'node:assert/strict'
import { analyzeMarketEvidence, publicationCutoff } from '../src/lib/marketEvidence.js'

const now = Date.parse('2026-10-03T12:00:00+08:00')
const row = (price, i, changes = {}) => ({
  price, source: 'report', model: 'Test', storage: '256G',
  created_at: '2026-09-18T12:00:00+08:00', price_reviewed_at: '2026-09-19T12:00:00+08:00',
  price_review_status: 'approved', spec_verified: true, reporter_key: `person-${i}`,
  condition: '正常無拆修', has_damage: false, ...changes,
})
const rows = [39000, 40000, 41000, 42000, 43000].map(row)
const result = analyzeMarketEvidence(rows, now)
assert.equal(result.basis, 'confirmed_sales')
assert.equal(result.avg, 41000)
assert.deepEqual(result.range, { low: 39400, high: 42600 })
assert.equal(analyzeMarketEvidence(rows.slice(0, 2), now).avg, null)
assert.equal(analyzeMarketEvidence(rows.map(r => ({ ...r, reporter_key: 'same-person' })), now).avg, null)
assert.equal(analyzeMarketEvidence(rows.map(r => ({ ...r, price_review_status: 'pending' })), now).avg, null)
assert.equal(analyzeMarketEvidence(rows.map(r => ({ ...r, spec_verified: false })), now).avg, null)
assert.equal(analyzeMarketEvidence(rows.map(r => ({ ...r, has_damage: true })), now).avg, null)
assert.equal(analyzeMarketEvidence(rows.map(r => ({ ...r, condition: '曾維修／更換零件' })), now).avg, null)
assert.equal(analyzeMarketEvidence(rows.map(r => ({ ...r, price_reviewed_at: '2026-09-30' })), now).avg, null)
assert.equal(analyzeMarketEvidence(rows.map(r => ({ ...r, created_at: '2026-06-01' })), now).avg, null)
assert.equal(analyzeMarketEvidence(rows.map(r => ({ ...r, price_reviewed_at: null })), now).avg, null)
assert.equal(analyzeMarketEvidence(rows.map(r => ({ ...r, price: NaN })), now).avg, null)
const listings = rows.map(r => ({ ...r, source: 'post', price: r.price + 10000 }))
assert.equal(analyzeMarketEvidence([...rows, ...listings], now).avg, 41000, 'listing prices must not change sales')
assert.equal(analyzeMarketEvidence([...rows.slice(0, 2), ...listings], now).basis, 'asking_prices')
assert.equal(analyzeMarketEvidence([...rows, row(100000, 99)], now).anomalyCount, 1)
assert.equal(analyzeMarketEvidence(Array.from({ length: 5 }, (_, i) => row(39000, i)), now).avg, 39000)
assert.equal(publicationCutoff(now), publicationCutoff(now - 3 * 86400000), 'weekly publication is stable')
assert.equal(analyzeMarketEvidence(rows, now).publicationAt, '2026-09-27T16:00:00.000Z')
console.log('Market evidence passed: independence, review, weekly delay, source separation, robust statistics, freshness.')
