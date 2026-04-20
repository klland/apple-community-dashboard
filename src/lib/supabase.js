import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://aymposvjqhdsalxiffje.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bXBvc3ZqcWhkc2FseGlmZmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjc0NjgsImV4cCI6MjA5MTkwMzQ2OH0._vrmCkm-aaU-991etNw_8cL-tOSNTcSTAyVkLKmoORs'

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
  checkRateLimit()
  const { error } = await supabase.from('transactions').insert([data])
  if (error) throw error
}

// 取得某型號+容量的市場均價（PR10-90）
export async function getMarketPrice(model, storage) {
  const { data, error } = await supabase
    .from('transactions')
    .select('price')
    .eq('model', model)
    .eq('storage', storage)
    .order('price')

  if (error || !data || data.length === 0) return null

  const prices = data.map(r => r.price).sort((a, b) => a - b)
  const p10 = Math.floor(prices.length * 0.1)
  const p90 = Math.ceil(prices.length * 0.9)
  const trimmed = prices.slice(p10, p90)
  if (trimmed.length === 0) return null

  const avg = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length)
  return { avg, count: data.length, trimmedCount: trimmed.length }
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
export async function getDailyPrices(model, storage) {
  const since = new Date()
  since.setDate(since.getDate() - 89)
  const { data, error } = await supabase
    .from('transactions')
    .select('price, created_at')
    .eq('model', model)
    .eq('storage', storage)
    .gte('created_at', since.toISOString())
    .order('created_at')

  if (error) return []
  return data || []
}
