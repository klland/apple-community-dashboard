import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aymposvjqhdsalxiffje.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bXBvc3ZqcWhkc2FseGlmZmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjc0NjgsImV4cCI6MjA5MTkwMzQ2OH0._vrmCkm-aaU-991etNw_8cL-tOSNTcSTAyVkLKmoORs'
)

const PRODUCTS = [
  { model: 'iPhone 16 Pro',     storage: '128G',     launchDate: '2024-09-20', launchPrice: 36900, depreciation: 0.018 },
  { model: 'iPhone 16 Pro',     storage: '256G',     launchDate: '2024-09-20', launchPrice: 40400, depreciation: 0.018 },
  { model: 'iPhone 16 Pro',     storage: '512G',     launchDate: '2024-09-20', launchPrice: 47400, depreciation: 0.016 },
  { model: 'iPhone 16 Pro Max', storage: '256G',     launchDate: '2024-09-20', launchPrice: 44900, depreciation: 0.017 },
  { model: 'iPhone 16 Pro Max', storage: '512G',     launchDate: '2024-09-20', launchPrice: 51900, depreciation: 0.016 },
  { model: 'iPhone 16 Plus',    storage: '128G',     launchDate: '2024-09-20', launchPrice: 32900, depreciation: 0.019 },
  { model: 'iPhone 16',         storage: '128G',     launchDate: '2024-09-20', launchPrice: 29900, depreciation: 0.020 },
  { model: 'iPhone 15 Pro',     storage: '128G',     launchDate: '2023-09-22', launchPrice: 36900, depreciation: 0.019 },
  { model: 'iPhone 15 Pro Max', storage: '256G',     launchDate: '2023-09-22', launchPrice: 44900, depreciation: 0.018 },
  { model: 'iPhone 15 Plus',    storage: '128G',     launchDate: '2023-09-22', launchPrice: 32900, depreciation: 0.021 },
  { model: 'iPhone 15',         storage: '128G',     launchDate: '2023-09-22', launchPrice: 29900, depreciation: 0.022 },
  { model: 'iPhone 14 Pro Max', storage: '128G',     launchDate: '2022-09-16', launchPrice: 38900, depreciation: 0.022 },
  { model: 'iPhone 14 Pro',     storage: '128G',     launchDate: '2022-09-16', launchPrice: 34900, depreciation: 0.022 },
  { model: 'iPhone 14 Plus',    storage: '128G',     launchDate: '2022-10-07', launchPrice: 31900, depreciation: 0.023 },
  { model: 'iPhone 14',         storage: '128G',     launchDate: '2022-09-16', launchPrice: 27900, depreciation: 0.023 },
  { model: 'iPhone 13 Pro Max', storage: '128G',     launchDate: '2021-09-24', launchPrice: 36900, depreciation: 0.023 },
  { model: 'iPhone 13 Pro',     storage: '128G',     launchDate: '2021-09-24', launchPrice: 32900, depreciation: 0.023 },
  { model: 'iPhone 13',         storage: '128G',     launchDate: '2021-09-24', launchPrice: 25900, depreciation: 0.024 },
  { model: 'MacBook Air 13吋 M4', storage: '16G/256G', launchDate: '2025-03-12', launchPrice: 32900, depreciation: 0.012 },
  { model: 'MacBook Air 13吋 M3', storage: '8G/256G',  launchDate: '2024-03-08', launchPrice: 35900, depreciation: 0.013 },
  { model: 'iPhone 17 Pro',     storage: '256G',     launchDate: '2025-09-19', launchPrice: 39900, depreciation: 0.014 },
  { model: 'iPhone 17 Pro Max', storage: '256G',     launchDate: '2025-09-19', launchPrice: 44900, depreciation: 0.013 },
  { model: 'iPhone 17',         storage: '256G',     launchDate: '2025-09-19', launchPrice: 29900, depreciation: 0.015 },
  { model: 'Mac mini M4',       storage: '16G/256G', launchDate: '2024-11-08', launchPrice: 19900, depreciation: 0.010 },
]

const CONDITIONS = ['輕微細紋（正常使用）', '邊框有小刮痕', '外觀完美無痕', '9成新', '8.5成新', '全新未拆']
const TRADE_METHODS = ['面交或郵寄皆可', '面交', '郵寄（賣家出運費）', '郵寄（買家出運費）']
const LOCATIONS = ['台中市', '新北市', '台北市', '高雄市', '桃園市', '基隆市', '台南市', '新竹市']

function rand(min, max) { return Math.random() * (max - min) + min }
function randInt(min, max) { return Math.floor(rand(min, max + 1)) }
function pick(arr) { return arr[randInt(0, arr.length - 1)] }

// 月基準價：嚴格遞減，前 3 個月跌快，之後趨緩，最多跌 55%
function monthlyBasePrice(launchPrice, monthsElapsed, depreciation) {
  let drop = 0
  for (let m = 0; m < monthsElapsed; m++) {
    drop += m < 3 ? depreciation * 1.8 : depreciation
  }
  drop = Math.min(drop, 0.55)
  return launchPrice * (1 - drop)
}

const now = new Date()

// 先刪除所有 source='seed' 的假資料（用 source 欄位區分）
console.log('刪除舊的 seed 假資料…')
const { error: delError } = await supabase.from('transactions').delete().eq('source', 'seed')
if (delError) console.warn('刪除失敗（可能沒有舊資料）：', delError.message)
else console.log('刪除完成')

const rows = []

for (const product of PRODUCTS) {
  const launchDate = new Date(product.launchDate)

  let cursor = new Date(launchDate)
  cursor.setDate(1)
  let monthIndex = 0

  while (cursor <= now) {
    const base = monthlyBasePrice(product.launchPrice, monthIndex, product.depreciation)
    const monthlyCount = randInt(6, 18)

    for (let i = 0; i < monthlyCount; i++) {
      const day = randInt(1, 28)
      const hour = randInt(8, 23)
      const minute = randInt(0, 59)
      const txDate = new Date(cursor.getFullYear(), cursor.getMonth(), day, hour, minute)
      if (txDate > now) continue

      // 每筆只加 ±5% 雜訊，不影響月均走勢
      const noise = rand(-0.05, 0.05)
      const price = Math.round(base * (1 + noise) / 100) * 100

      rows.push({
        model: product.model,
        storage: product.storage,
        condition: pick(CONDITIONS),
        price,
        trade_method: pick(TRADE_METHODS),
        location: pick(LOCATIONS),
        source: 'seed',
        created_at: txDate.toISOString(),
      })
    }

    cursor.setMonth(cursor.getMonth() + 1)
    monthIndex++
  }
}

console.log(`準備插入 ${rows.length} 筆假資料…`)

const BATCH = 200
let inserted = 0
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error } = await supabase.from('transactions').insert(batch)
  if (error) {
    console.error('插入失敗：', error.message)
    process.exit(1)
  }
  inserted += batch.length
  console.log(`已插入 ${inserted} / ${rows.length}`)
}

console.log('完成！')
