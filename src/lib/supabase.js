import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Rate limiting：localStorage 記錄送出時間，1 小時最多 10 筆
const RATE_KEY = 'submit_timestamps'
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit() {
  const raw = localStorage.getItem(RATE_KEY)
  const now = Date.now()
  const timestamps = raw ? JSON.parse(raw).filter(t => now - t < RATE_WINDOW_MS) : []
  if (timestamps.length >= RATE_LIMIT) {
    const waitMin = Math.ceil((RATE_WINDOW_MS - (now - timestamps[0])) / 60000)
    throw new Error(`已達每小時上限 ${RATE_LIMIT} 筆，請 ${waitMin} 分鐘後再試`)
  }
  timestamps.push(now)
  localStorage.setItem(RATE_KEY, JSON.stringify(timestamps))
}

// 送出交易資料
export async function submitTransaction(data) {
  assertReportNotDuplicated(data)
  checkRateLimit()
  const { error } = await supabase.from('transactions').insert([data])
  if (error) throw error
  rememberSubmittedReport(data)
}

const LIVE_REPORT_WEIGHT = 6
const OTHER_TRANSACTION_WEIGHT = 1
const DAY_MS = 24 * 60 * 60 * 1000
const PUBLIC_PRICE_DELAY_DAYS = 7
const REPORT_DUPLICATE_WINDOW_DAYS = 30
const PRICE_ANOMALY_RATIO = 0.3
const REPORT_HISTORY_KEY = 'submitted_transaction_reports'

function getRecencyWeight(createdAt) {
  if (!createdAt) return 1
  const ageInDays = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / DAY_MS)
  if (Number.isNaN(ageInDays)) return 1
  if (ageInDays <= 30) return 1
  if (ageInDays <= 90) return 0.7
  return 0.45
}

function getWeightedAverage(rows) {
  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0)
  if (!totalWeight) return null
  return rows.reduce((sum, row) => sum + row.price * row.weight, 0) / totalWeight
}

function isEligibleForPublicPrice(createdAt) {
  if (!createdAt) return false
  const submittedAt = new Date(createdAt).getTime()
  if (Number.isNaN(submittedAt)) return false
  return submittedAt <= Date.now() - PUBLIC_PRICE_DELAY_DAYS * DAY_MS
}

function isWithinReferenceRange(price, referencePrice) {
  if (!referencePrice) return true
  return Math.abs(Number(price) - Number(referencePrice)) / Number(referencePrice) <= PRICE_ANOMALY_RATIO
}

function readSubmittedReports() {
  try {
    return JSON.parse(localStorage.getItem(REPORT_HISTORY_KEY) || '{}')
  } catch {
    return {}
  }
}

function assertReportNotDuplicated(data) {
  if (data.source !== 'report') return
  const history = readSubmittedReports()
  const key = `${data.model}__${data.storage}`
  const lastSubmittedAt = Number(history[key])
  const windowMs = REPORT_DUPLICATE_WINDOW_DAYS * DAY_MS
  if (lastSubmittedAt && Date.now() - lastSubmittedAt < windowMs) {
    const daysLeft = Math.ceil((windowMs - (Date.now() - lastSubmittedAt)) / DAY_MS)
    throw new Error(`同一裝置的 ${data.model} ${data.storage} 已回報過，請 ${daysLeft} 天後再送出`)
  }
}

function rememberSubmittedReport(data) {
  if (data.source !== 'report') return
  const history = readSubmittedReports()
  history[`${data.model}__${data.storage}`] = Date.now()
  localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(history))
}

// 取得某型號+容量的市場均價。成交回報是少數可驗證的真實樣本，
// 因此以 6:1 權重優先於貼文或其他來源，並讓近期成交有較高影響力。
// 新回報會先冷卻 7 天，避免單筆資料即時操控公開均價與價格曲線。
export async function getMarketPrice(model, storage, { referencePrice } = {}) {
  const { data, error } = await supabase
    .from('transactions')
    .select('price, source, created_at')
    .eq('model', model)
    .eq('storage', storage)
    .order('created_at', { ascending: false })

  if (error || !data || data.length === 0) return null

  const pendingCount = data.filter(row => !isEligibleForPublicPrice(row.created_at)).length
  const prices = data
    .filter(row => isEligibleForPublicPrice(row.created_at))
    .filter(row => Number.isFinite(Number(row.price)) && Number(row.price) > 0)
    .filter(row => isWithinReferenceRange(row.price, referencePrice))
    .sort((a, b) => Number(a.price) - Number(b.price))
  if (prices.length === 0) return null

  const p10 = Math.floor(prices.length * 0.1)
  const p90 = Math.ceil(prices.length * 0.9)
  const trimmed = prices.slice(p10, p90)
  if (trimmed.length === 0) return null

  const weightedRows = trimmed.map(row => ({
    price: Number(row.price),
    weight: (row.source === 'report' ? LIVE_REPORT_WEIGHT : OTHER_TRANSACTION_WEIGHT)
      * getRecencyWeight(row.created_at),
  }))
  const reportCount = trimmed.filter(row => row.source === 'report').length
  const avg = Math.round(getWeightedAverage(weightedRows) / 100) * 100
  const anomalyCount = data.length - pendingCount - prices.length
  return { avg, count: prices.length, trimmedCount: trimmed.length, reportCount, pendingCount, anomalyCount }
}

// 送出錯誤回報
export async function submitReport(data) {
  const { error } = await supabase.from('reports').insert([data])
  if (error) throw error
}

// 取得所有錯誤回報（後台用）
export async function getReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// 更新回報狀態
export async function updateReportStatus(id, resolved) {
  const { error } = await supabase
    .from('reports')
    .update({ resolved })
    .eq('id', id)
  if (error) throw error
}

// 刪除回報
export async function deleteReport(id) {
  const { error } = await supabase.from('reports').delete().eq('id', id)
  if (error) throw error
}

// 取得近 90 天每日成交紀錄（用於趨勢圖）
export async function getDailyPrices(model, storage, { referencePrice } = {}) {
  const since = new Date()
  since.setDate(since.getDate() - 89)
  const { data, error } = await supabase
    .from('transactions')
    .select('price, created_at, source')
    .eq('model', model)
    .eq('storage', storage)
    .gte('created_at', since.toISOString())
    .order('created_at')

  if (error) return []
  return (data || [])
    .filter(row => isEligibleForPublicPrice(row.created_at))
    .filter(row => Number.isFinite(Number(row.price)) && Number(row.price) > 0)
    .filter(row => isWithinReferenceRange(row.price, referencePrice))
    .filter(row => row.source === 'report')
}
