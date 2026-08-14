import fs from 'node:fs'
import path from 'node:path'

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const mockDataPath = path.join(rootDir, 'src', 'data', 'mockData.js')
const adjustmentsPath = path.join(rootDir, 'src', 'data', 'marketAdjustments.json')
const realSignalsPath = path.join(rootDir, 'data', 'real-price-signals.json')
const changelogDir = path.join(rootDir, 'data', 'monthly-price-changelog')
const dryRun = process.argv.includes('--dry-run')
const forceRun = process.argv.includes('--force')
const onlyProduct = process.argv.find(arg => arg.startsWith('--only='))?.slice('--only='.length)

const categoryDrift = {
  iPhone: { min: -0.018, max: -0.005 },
  MacBook: { min: -0.014, max: -0.004 },
  iPad: { min: -0.014, max: -0.004 },
  'Apple Watch': { min: -0.016, max: -0.004 },
  AirPods: { min: -0.016, max: -0.005 },
  Mac: { min: -0.012, max: -0.003 },
  '其他': { min: -0.012, max: -0.003 },
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
      storages: Object.keys(parseKvObject(match[5])),
    })
    match = blockRe.exec(content)
  }
  return products
}

function productLine(id, category) {
  if (category === 'Apple Watch') {
    if (id.includes('ultra')) return 'apple-watch-ultra'
    if (id.includes('-se')) return 'apple-watch-se'
    if (id.includes('-s')) return 'apple-watch-series'
  }

  const matchers = [
    [/^(iphone)-\d+-(pro-max|pro|plus)$/, '$1-$2'],
    [/^(iphone)-\d+$/, '$1-standard'],
    [/^(ipad-pro)-m\d+-(11|13)$/, '$1-$2'],
    [/^(ipad-air)-m\d+-(11|13)$/, '$1-$2'],
    [/^(macbook-air)-m\d+-(13|15)$/, '$1-$2'],
    [/^(macbook-pro)-(13|14|16)-m\d+(-pro|-max)?$/, '$1-$2$3'],
    [/^(mac-mini)-m\d+(-pro)?$/, '$1$2'],
    [/^(mac-studio)-m\d+-(max|ultra)$/, '$1-$2'],
    [/^(imac)-m\d+$/, '$1'],
  ]

  for (const [matcher, replacement] of matchers) {
    if (matcher.test(id)) return id.replace(matcher, replacement)
  }
  return id
}

function storageTier(storage) {
  const mm = /^(\d+)mm$/.exec(storage)
  if (mm) return Number(mm[1]) <= 42 ? 'small' : 'large'
  return storage
}

function previousGeneration(product, products) {
  const line = productLine(product.id, product.category)
  return products
    .filter(candidate =>
      candidate.id !== product.id
      && candidate.category === product.category
      && productLine(candidate.id, candidate.category) === line
      && candidate.launchDate < product.launchDate,
    )
    .sort((a, b) => b.launchDate.localeCompare(a.launchDate))[0]
}

function hasNewerGeneration(product, products) {
  const line = productLine(product.id, product.category)
  return products.some(candidate =>
    candidate.category === product.category
    && productLine(candidate.id, candidate.category) === line
    && candidate.launchDate > product.launchDate,
  )
}

function matchingStorage(product, previous, storage) {
  if (previous.marketAvg[storage]) return storage
  const tier = storageTier(storage)
  return previous.storages.find(candidate => storageTier(candidate) === tier) ?? previous.storages[0]
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

function isWithinProductWindow(product, now) {
  const launchDate = parseIsoDate(product.launchDate)
  if (!launchDate) return false
  const cutoff = new Date(now)
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 5)
  return launchDate >= cutoff
}

function getAgeSlope(months) {
  if (months < 6) return { min: -0.010, max: 0 }
  if (months < 18) return { min: -0.018, max: -0.004 }
  if (months < 36) return { min: -0.014, max: -0.005 }
  if (months < 72) return { min: -0.010, max: -0.003 }
  return { min: -0.006, max: -0.001 }
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
  const allProducts = parseProductsFromMockData(mockDataContent)
  const nowCtx = buildTodayContext()
  const activeProducts = allProducts.filter(product => isWithinProductWindow(product, nowCtx.now))
  const products = onlyProduct
    ? activeProducts.filter(product => product.id === onlyProduct)
    : activeProducts
  if (products.length === 0) {
    throw new Error('找不到產品資料，請檢查 mockData.js 格式。')
  }

  const existingAdjustments = safeReadJson(adjustmentsPath, { meta: {}, marketAvg: {} })
  if (!dryRun && !forceRun && existingAdjustments.meta?.month === nowCtx.monthKey) {
    console.log(`[monthly-price-update] month=${nowCtx.monthKey} already updated; use --force to run again.`)
    return
  }
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
    const previous = previousGeneration(p, activeProducts)
    const replaced = hasNewerGeneration(p, activeProducts)

    for (const [storage, baseMarket] of Object.entries(p.marketAvg)) {
      const oldValue = existingOverrides[p.id]?.[storage] ?? baseMarket
      const launchPrice = p.launchPrice[storage] ?? oldValue
      const storageSeed = hashCode(`${p.id}:${storage}:${nowCtx.monthKey}`)
      const localDrift = slopeMin + ((storageSeed % 97) / 96) * (slopeMax - slopeMin)
      let pct = clamp(localDrift, -0.025, 0.005)

      let candidate = roundToHundred(oldValue * (1 + pct))
      const floor = roundToHundred(Math.max(500, launchPrice * getFloorRatio(p.category, ageMonths)))
      const ceiling = roundToHundred(launchPrice * 1.08)
      candidate = clamp(candidate, floor, ceiling)

      // 新一代已存在時，舊款逐月朝「目前前一代」的價帶靠攏。
      // 只會下修；若人工調價或成交資料已低於目標，不會被公式拉回去。
      if (replaced && previous) {
        const priorStorage = matchingStorage(p, previous, storage)
        const target = existingOverrides[previous.id]?.[priorStorage] ?? previous.marketAvg[priorStorage]
        if (target && candidate > target) {
          const gap = candidate - target
          const transitionStep = Math.max(100, roundToHundred(gap * 0.08))
          candidate = Math.max(target, candidate - transitionStep)
        }
      }

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
