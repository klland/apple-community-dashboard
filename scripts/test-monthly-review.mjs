import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = new URL('../', import.meta.url)
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'apple-monthly-review-'))
try {
  for (const file of ['scripts/monthly-price-update.mjs', 'src/data/mockData.js', 'src/data/marketAdjustments.json']) {
    const target = path.join(temp, file)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.copyFileSync(new URL(file, root), target)
  }
  const adjustments = path.join(temp, 'src/data/marketAdjustments.json')
  const before = fs.readFileSync(adjustments, 'utf8')
  execFileSync(process.execPath, [path.join(temp, 'scripts/monthly-price-update.mjs'), '--only=iphone-17', '--force'])
  assert.equal(fs.readFileSync(adjustments, 'utf8'), before, 'proposal changed live prices')
  const folder = path.join(temp, 'data/monthly-price-changelog')
  const proposal = JSON.parse(fs.readFileSync(path.join(folder, fs.readdirSync(folder)[0])))
  assert.equal(proposal.status, 'pending_review')
  const old = JSON.parse(before).marketAvg
  for (const [id, prices] of Object.entries(old)) {
    if (id !== 'iphone-17') assert.deepEqual(proposal.proposed.marketAvg[id], prices, `${id} lost in --only`)
  }
  execFileSync(process.execPath, [path.join(temp, 'scripts/monthly-price-update.mjs'), '--force'])
  assert.equal(fs.readFileSync(adjustments, 'utf8'), before, 'full review changed live prices')
  console.log('Monthly review passed: single/full proposals preserve live prices and unrelated models.')
} finally {
  fs.rmSync(temp, { recursive: true, force: true })
}
