import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://aymposvjqhdsalxiffje.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_tdw2Lb6RrF3AvnqcfQLyPQ_ffst31CL'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 送出交易資料
export async function submitTransaction(data) {
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
