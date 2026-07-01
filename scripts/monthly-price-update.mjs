import fs from 'node:fs'
import path from 'node:path'

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const mockDataPath = path.join(rootDir, 'src', 'data', 'mockData.js')
const adjustmentsPath = path.join(rootDir, 'src', 'data', 'marketAdjustments.json')
const realSignalsPath = path.join(rootDir, 'data', 'real-price-signals.json')
const changelogDir = path.join(rootDir, 'data', 'monthly-price-changelog')
const dryRun = process.argv.includes('--dry-run')

const categoryDrift = {
  iPhone: { min: -0.060, max: -0.010 },
  MacBook: { min: -0.045, max: -0.008 },
  iPad: { min: -0.042, max: -0.008 },
  'Apple Watch': { min: -0.055, max: -0.010 },
  AirPods: { min: -0.050, max: -0.012 },
  Mac: { min: -0.040, max: -0.006 },
  '其他': { min: -0.045, max: -0.006 },
}

function safeReadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function hashCode(input) {
  let h = 0
  for (let i = 0; i < input.length; i += 1) h = ((h << 5) - h + input.charCodeAt(i)) | 0
  return Math.abs(h)
}

function parseKvObject(objectLiteralText) {
  const out = {}
  const pairRe = /'([^']+)':\s*(\d+)/g
  let pair = pairRe.exec(objectLiteralText)
  while (pair) {
    out[pair[1]] = Number(pair[2])
    pair = pairRe.exec(objectLiteralText)
  }
  return out
}

function parseProductsFromMockData(content) {
  const products = []
  const blockRe =
    /{\s*id:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?launchDate:\s*'([^']+)'[\s\S]*?launchPrice:\s*{([\s\S]*?)}\s*,[\s\S]*?marketAvg:\s*{([\s\S]*?)}\s*,[\s\S]*?}/g
  let match = blockRe.exec(content)
  while (match) {
    products.push({
      id: match[1],
      category: match[2],
      launchDate: match[3],
      launchPrice: parseKvObject(match[4]),
      marketAvg: parseKvObject(match[5]),
    })
    match = blockRe.exec(content)
  }
  return products
}

function parseIsoDate(text) {
  const d = new Date(text)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function monthsSince(fromDate, toDate) {
  const years = toDate.getUTCFullYear() - fromDate.getUTCFullYear()
  const months = toDate.getUTCMonth() - fromDate.getUTCMonth()
  return years * 12 + months
}

function getAgeSlope(months) {
  if (months < 6) return { min: -0.030, max: 0.012 }
  if (months < 18) return { min: -0.060, max: -0.006 }
  if (months < 36) return { min: -0.070, max: -0.012 }
  if (months < 72) return { min: -0.055, max: -0.008 }
  return { min: -0.040, max: -0.003 }
}

function roundToHundred(value) {
  return Math.round(value / 100) * 100
}

function getFloorRatio(category, ageMonths) {
  const base = category === 'Mac' || category === 'MacBook' ? 0.12 : 0.08
  if (ageMonths > 84) return base * 0.65
  if (ageMonths > 60) return base * 0.75
  return base
}

function buildTodayContext() {
  const now = new Date()
  const utcYear = now.getUTCFullYear()
  const utcMonth = `${now.getUTCMonth() + 1}`.padStart(2, '0')
  const utcDate = `${now.getUTCDate()}`.padStart(2, '0')
  return {
    now,
    monthKey: `${utcYear}-${utcMonth}`,
    isoDate: `${utcYear}-${utcMonth}-${utcDate}`,
    monthIndex: utcYear * 12 + now.getUTCMonth(),
  }
}

function seasonalWave(monthIndex, seed) {
  return Math.sin((monthIndex + seed % 13) / 2.8) * 0.008
}

function realSignalWeight(signal) {
  if (!signal || !signal.median || !signal.count) return 0
  const recencyDate = parseIsoDate(signal.updatedAt)
  const recencyPenalty = recencyDate
    ? clamp((Date.now() - recencyDate.getTime()) / (1000 * 60 * 60 * 24 * 120), 0, 1)
    : 1
  const freshness = 1 - recencyPenalty
  const volume = clamp(signal.count / 40, 0, 1)
  return 0.45 * freshness * volume
}

function main() {
  const mockDataContent = fs.readFileSync(mockDataPath, 'utf8')
  const products = parseProductsFromMockData(mockDataContent)
  if (products.length === 0) {
    throw new Error('找不到產品資料，請檢查 mockData.js 格式。')
  }

  const nowCtx = buildTodayContext()
  const existingAdjustments = safeReadJson(adjustmentsPath, { meta: {}, marketAvg: {} })
  const existingOverrides = existingAdjustments.marketAvg || {}
  const realSignals = safeReadJson(realSignalsPath, { products: {} }).products || {}
  const nextOverrides = {}
  const changes = []

  for (const p of products) {
    const launchDate = parseIsoDate(p.launchDate)
    if (!launchDate) continue
    const ageMonths = Math.max(0, monthsSince(launchDate, nowCtx.now))
    const categoryRange = categoryDrift[p.category] || categoryDrift['其他']
    const ageRange = getAgeSlope(ageMonths)
    const slopeMin = (categoryRange.min + ageRange.min) / 2
    const slopeMax = (categoryRange.max + ageRange.max) / 2
    const productSeed = hashCode(p.id)
    const season = seasonalWave(nowCtx.monthIndex, productSeed)

    for (const [storage, baseMarket] of Object.entries(p.marketAvg)) {
      const oldValue = existingOverrides[p.id]?.[storage] ?? baseMarket
      const launchPrice = p.launchPrice[storage] ?? oldValue
      const storageSeed = hashCode(`${p.id}:${storage}:${nowCtx.monthKey}`)
      const swing = ((storageSeed % 1000) / 1000 - 0.5) * 0.026
      const localDrift = slopeMin + ((storageSeed % 97) / 96) * (slopeMax - slopeMin)
      let pct = localDrift + season + swing
      pct = clamp(pct, -0.12, 0.03)

      let candidate = roundToHundred(oldValue * (1 + pct))
      const floor = roundToHundred(Math.max(500, launchPrice * getFloorRatio(p.category, ageMonths)))
      const ceiling = roundToHundred(launchPrice * 1.08)
      candidate = clamp(candidate, floor, ceiling)

      const signal = realSignals[p.id]?.[storage]
      if (signal?.median) {
        const w = realSignalWeight(signal)
        candidate = roundToHundred(candidate * (1 - w) + Number(signal.median) * w)
      }

      const delta = candidate - oldValue
      if (!nextOverrides[p.id]) nextOverrides[p.id] = {}
      nextOverrides[p.id][storage] = candidate
      if (delta !== 0) {
        changes.push({
          id: p.id,
          storage,
          oldValue,
          newValue: candidate,
          pct: Number(((delta / oldValue) * 100).toFixed(2)),
        })
      }
    }
  }

  const output = {
    meta: {
      lastUpdated: nowCtx.isoDate,
      month: nowCtx.monthKey,
      totalProducts: products.length,
      changedItems: changes.length,
      note: 'Auto-updated by scripts/monthly-price-update.mjs',
    },
    marketAvg: nextOverrides,
  }

  if (!dryRun) {
    fs.writeFileSync(adjustmentsPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
    fs.mkdirSync(changelogDir, { recursive: true })
    fs.writeFileSync(
      path.join(changelogDir, `${nowCtx.monthKey}.json`),
      `${JSON.stringify({ generatedAt: nowCtx.isoDate, changes }, null, 2)}\n`,
      'utf8',
    )
  }

  console.log(`[monthly-price-update] month=${nowCtx.monthKey} changed=${changes.length} dryRun=${dryRun}`)
  for (const item of changes.slice(0, 25)) {
    const sign = item.pct > 0 ? '+' : ''
    console.log(`- ${item.id} ${item.storage}: ${item.oldValue} -> ${item.newValue} (${sign}${item.pct}%)`)
  }
  if (changes.length > 25) {
    console.log(`... and ${changes.length - 25} more`)
  }
}

main()
