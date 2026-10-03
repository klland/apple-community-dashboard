const DAY = 86400000
export const MIN_MARKET_SAMPLES = 5

export function publicationCutoff(now = Date.now()) {
  const monday = new Date(now + 8 * 3600000)
  monday.setUTCHours(0, 0, 0, 0)
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7)
  return monday.getTime() - 8 * 3600000 - 7 * DAY
}

export function quantile(values, q) {
  const sorted = [...values].sort((a, b) => a - b)
  if (!sorted.length) return null
  const index = (sorted.length - 1) * q
  const lower = Math.floor(index)
  return sorted[lower] + (sorted[Math.ceil(index)] - sorted[lower]) * (index - lower)
}

const hundred = value => Math.round(value / 100) * 100

// Publication and independence checks are shared by the headline and history.
export function eligibleMarketRows(rows, now = Date.now()) {
  const cutoff = publicationCutoff(now)
  const identities = new Map()
  return [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).filter(row => {
    const date = new Date(row.created_at).getTime()
    if (!row.created_at || !row.price_reviewed_at) return false
    const reviewedAt = new Date(row.price_reviewed_at).getTime()
    if (!Number.isFinite(date) || date > cutoff || date < cutoff + 7 * DAY - 90 * DAY) return false
    if (!Number.isFinite(reviewedAt) || reviewedAt > cutoff) return false
    if (row.price_review_status !== 'approved' || !row.spec_verified || !row.reporter_key) return false
    if (!['report', 'post'].includes(row.source) || !Number.isFinite(Number(row.price)) || Number(row.price) <= 0) return false
    if (row.has_damage || row.condition !== '正常無拆修') return false
    const key = `${row.source}|${row.reporter_key}|${row.model}|${row.storage}`
    const latest = identities.get(key)
    if (latest != null) return false
    identities.set(key, date)
    return true
  })
}

function summarize(rows) {
  if (!rows.length) return { count: 0, avg: null, range: null, anomalyCount: 0, rows: [] }
  const values = rows.map(row => Number(row.price))
  const center = quantile(values, 0.5)
  const mad = quantile(values.map(value => Math.abs(value - center)), 0.5)
  // A zero MAD must not reject normal variation; sparse samples are not auto-trimmed.
  const tolerance = Math.max(mad * 4.4478, center * 0.15, 500)
  const accepted = rows.length >= MIN_MARKET_SAMPLES
    ? rows.filter(row => Math.abs(Number(row.price) - center) <= tolerance)
    : rows
  const prices = accepted.map(row => Number(row.price))
  const enough = accepted.length >= MIN_MARKET_SAMPLES
  return {
    count: accepted.length,
    avg: enough ? hundred(quantile(prices, 0.5)) : null,
    range: enough ? { low: Math.floor(quantile(prices, 0.1) / 100) * 100, high: Math.ceil(quantile(prices, 0.9) / 100) * 100 } : null,
    anomalyCount: rows.length - accepted.length,
    rows: accepted,
  }
}

export function analyzeMarketEvidence(rows, now = Date.now()) {
  const eligible = eligibleMarketRows(rows, now)
  const reports = summarize(eligible.filter(row => row.source === 'report'))
  const listings = summarize(eligible.filter(row => row.source === 'post'))
  const basis = reports.avg != null ? 'confirmed_sales' : listings.avg != null ? 'asking_prices' : 'model_estimate'
  const selected = basis === 'confirmed_sales' ? reports : basis === 'asking_prices' ? listings : null
  return {
    basis,
    avg: selected?.avg ?? null,
    range: selected?.range ?? null,
    count: selected?.count ?? 0,
    reportCount: reports.count,
    listingCount: listings.count,
    pendingCount: rows.filter(row => !['approved', 'rejected'].includes(row.price_review_status)).length,
    coolingCount: rows.filter(row => row.price_review_status === 'approved'
      && Math.max(new Date(row.created_at).getTime(), new Date(row.price_reviewed_at).getTime()) > publicationCutoff(now)).length,
    anomalyCount: reports.anomalyCount + listings.anomalyCount,
    publicationAt: new Date(publicationCutoff(now) + 7 * DAY).toISOString(),
    reportRows: reports.avg == null ? [] : reports.rows,
  }
}
