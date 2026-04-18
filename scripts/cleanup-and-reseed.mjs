import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://aymposvjqhdsalxiffje.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bXBvc3ZqcWhkc2FseGlmZmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjc0NjgsImV4cCI6MjA5MTkwMzQ2OH0._vrmCkm-aaU-991etNw_8cL-tOSNTcSTAyVkLKmoORs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const OLD_CONDITIONS = ['9成新', '8.5成新', '9.5成新', '8成新', '8成新以下', '全新未拆']
const CONDITIONS = ['全新未拆封', '外觀完美無痕', '輕微細紋（正常使用）', '邊框有小刮痕', '背蓋有明顯刮痕', '機身有缺陷／碰傷']
const CONDITION_MULTIPLIERS = [1.05, 1.02, 1.0, 0.97, 0.93, 0.85]
const TRADE_METHODS = ['面交', '郵寄（賣家出運費）', '郵寄（買家出運費）', '面交或郵寄皆可']
const LOCATIONS = [
  '新北市', '新北市', '新北市',
  '台中市', '台中市', '台中市',
  '台北市', '台北市',
  '桃園市', '桃園市',
  '高雄市', '高雄市',
  '台南市', '新竹市', '雲林縣', '基隆市', '嘉義市',
]
const PURCHASE_CHANNELS = ['Apple 官方直購', '電信門市（中華/遠傳/台哥大）', '授權經銷商（iStore/STUDIO A 等）', 'Facebook 社團', '實體二手店']
const WARRANTY_STATUS = ['原廠保固內', '已過原廠保固', '延長保固（AppleCare+）']

// condWeights: [全新未拆封, 外觀完美無痕, 輕微細紋, 邊框有小刮痕, 背蓋有明顯刮痕, 機身有缺陷]
// count: 交易筆數範圍 [min, max]
// batteryRange: [min, max] for iPhone battery health
const SEED_PRODUCTS = [
  // ── iPhone 17 系列（最新，每年換機族主力）─────────────────────────
  // Pro/Max 是換機族最愛，交易量最大
  { model: 'iPhone 17 Pro Max', storage: '256G', avg: 38000, color: '黑色鈦', isIphone: true, count: [12, 16], condWeights: [5, 25, 45, 18, 6, 1], batteryRange: [90, 100] },
  { model: 'iPhone 17 Pro Max', storage: '512G', avg: 44000, color: '白色鈦', isIphone: true, count: [10, 14], condWeights: [5, 25, 45, 18, 6, 1], batteryRange: [90, 100] },
  { model: 'iPhone 17 Pro Max', storage: '1T',   avg: 50000, color: '沙漠色鈦', isIphone: true, count: [6, 9], condWeights: [8, 28, 42, 16, 5, 1], batteryRange: [92, 100] },
  { model: 'iPhone 17 Pro',     storage: '256G', avg: 34000, color: '沙漠色鈦', isIphone: true, count: [10, 14], condWeights: [5, 25, 45, 18, 6, 1], batteryRange: [90, 100] },
  { model: 'iPhone 17 Pro',     storage: '512G', avg: 40000, color: '黑色鈦', isIphone: true, count: [7, 10], condWeights: [5, 25, 45, 18, 6, 1], batteryRange: [90, 100] },
  // 一般版/Air 交易量少（沒人拿一般版每年換機）
  { model: 'iPhone 17',         storage: '256G', avg: 25000, color: '黑色', isIphone: true, count: [2, 4], condWeights: [3, 15, 40, 25, 12, 5], batteryRange: [85, 100] },
  { model: 'iPhone 17 Air',     storage: '256G', avg: 31000, color: '藍色', isIphone: true, count: [2, 4], condWeights: [3, 15, 40, 25, 12, 5], batteryRange: [85, 100] },

  // ── iPhone 16 系列（上上代，換機族已換完，剩下淘汰族）─────────────
  { model: 'iPhone 16 Pro Max', storage: '256G', avg: 30000, color: '黑色鈦', isIphone: true, count: [8, 12], condWeights: [2, 15, 42, 25, 12, 4], batteryRange: [85, 98] },
  { model: 'iPhone 16 Pro Max', storage: '512G', avg: 34000, color: '本然鈦', isIphone: true, count: [5, 8],  condWeights: [2, 15, 42, 25, 12, 4], batteryRange: [85, 98] },
  { model: 'iPhone 16 Pro',     storage: '128G', avg: 24000, color: '黑色鈦', isIphone: true, count: [7, 10], condWeights: [2, 12, 40, 27, 14, 5], batteryRange: [84, 97] },
  { model: 'iPhone 16 Pro',     storage: '256G', avg: 27000, color: '沙漠色鈦', isIphone: true, count: [6, 9], condWeights: [2, 12, 40, 27, 14, 5], batteryRange: [84, 97] },
  { model: 'iPhone 16 Pro',     storage: '512G', avg: 31000, color: '白色鈦', isIphone: true, count: [4, 7],  condWeights: [2, 12, 40, 27, 14, 5], batteryRange: [84, 97] },
  { model: 'iPhone 16',         storage: '128G', avg: 17000, color: '黑色', isIphone: true, count: [2, 4], condWeights: [1, 10, 38, 28, 16, 7], batteryRange: [82, 96] },
  { model: 'iPhone 16',         storage: '256G', avg: 19500, color: '白色', isIphone: true, count: [2, 3], condWeights: [1, 10, 38, 28, 16, 7], batteryRange: [82, 96] },
  { model: 'iPhone 16 Plus',    storage: '128G', avg: 20000, color: '超深藍', isIphone: true, count: [2, 3], condWeights: [1, 10, 38, 28, 16, 7], batteryRange: [82, 96] },

  // ── iPhone 15 系列（3年前，淘汰族主力）────────────────────────────
  { model: 'iPhone 15 Pro Max', storage: '256G', avg: 22000, color: '黑色鈦', isIphone: true, count: [5, 8], condWeights: [1, 8, 35, 30, 18, 8], batteryRange: [80, 92] },
  { model: 'iPhone 15 Pro',     storage: '128G', avg: 15000, color: '白色鈦', isIphone: true, count: [4, 7], condWeights: [1, 8, 35, 30, 18, 8], batteryRange: [80, 92] },
  { model: 'iPhone 15 Pro',     storage: '256G', avg: 17000, color: '本然鈦', isIphone: true, count: [3, 6], condWeights: [1, 8, 35, 30, 18, 8], batteryRange: [80, 92] },
  { model: 'iPhone 15',         storage: '128G', avg: 11000, color: '黑色', isIphone: true, count: [2, 4], condWeights: [1, 6, 32, 30, 20, 11], batteryRange: [78, 90] },
  { model: 'iPhone 15',         storage: '256G', avg: 13000, color: '藍色', isIphone: true, count: [2, 3], condWeights: [1, 6, 32, 30, 20, 11], batteryRange: [78, 90] },

  // ── iPhone 14 系列（4年前，舊機淘汰）─────────────────────────────
  { model: 'iPhone 14 Pro Max', storage: '128G', avg: 13000, color: '深紫色', isIphone: true, count: [3, 5], condWeights: [0, 5, 28, 32, 22, 13], batteryRange: [75, 88] },
  { model: 'iPhone 14 Pro',     storage: '128G', avg: 11000, color: '太空黑色', isIphone: true, count: [3, 5], condWeights: [0, 5, 28, 32, 22, 13], batteryRange: [75, 88] },
  { model: 'iPhone 14',         storage: '128G', avg: 8000,  color: '午夜色', isIphone: true, count: [2, 3], condWeights: [0, 4, 25, 32, 25, 14], batteryRange: [72, 86] },

  // ── iPhone 13 系列（5年前，殘值低，少量）──────────────────────────
  { model: 'iPhone 13 Pro Max', storage: '128G', avg: 9500,  color: '石墨色', isIphone: true, count: [2, 4], condWeights: [0, 3, 22, 32, 26, 17], batteryRange: [70, 84] },
  { model: 'iPhone 13 Pro',     storage: '128G', avg: 7500,  color: '遠峰藍', isIphone: true, count: [2, 3], condWeights: [0, 3, 22, 32, 26, 17], batteryRange: [70, 84] },
  { model: 'iPhone 13',         storage: '128G', avg: 6000,  color: '午夜色', isIphone: true, count: [1, 3], condWeights: [0, 2, 20, 32, 28, 18], batteryRange: [68, 82] },

  // ── MacBook M5 系列（2025年新上市，半年內，最多5筆）────────────────
  { model: 'MacBook Air 13吋 M5',      storage: '16G/256G', avg: 35900, color: '天藍色',  isIphone: false, count: [2, 4], condWeights: [40, 45, 13, 2, 0, 0] },
  { model: 'MacBook Air 13吋 M5',      storage: '16G/512G', avg: 41900, color: '午夜色',  isIphone: false, count: [2, 3], condWeights: [40, 45, 13, 2, 0, 0] },
  { model: 'MacBook Air 15吋 M5',      storage: '16G/256G', avg: 42900, color: '銀色',    isIphone: false, count: [1, 3], condWeights: [40, 45, 13, 2, 0, 0] },
  { model: 'MacBook Pro 14吋 M5',      storage: '24G/512G', avg: 54900, color: '銀色',    isIphone: false, count: [1, 3], condWeights: [35, 48, 15, 2, 0, 0] },
  { model: 'MacBook Pro 14吋 M5 Pro',  storage: '24G/512G', avg: 68900, color: '太空黑色', isIphone: false, count: [1, 2], condWeights: [35, 48, 15, 2, 0, 0] },
  { model: 'MacBook Pro 14吋 M5 Max',  storage: '36G/512G', avg: 89900, color: '太空黑色', isIphone: false, count: [1, 2], condWeights: [35, 48, 15, 2, 0, 0] },
  // MacBook Neo（最新超值款，剛上市，極少）
  { model: 'MacBook Neo 13吋 M5',      storage: '16G/256G', avg: 19900, color: '胭粉色',  isIphone: false, count: [1, 3], condWeights: [50, 42, 7, 1, 0, 0] },
  { model: 'MacBook Neo 13吋 M5',      storage: '16G/512G', avg: 24900, color: '靛青色',  isIphone: false, count: [1, 2], condWeights: [50, 42, 7, 1, 0, 0] },

  // ── MacBook M4 系列（去年款，市場已有流通）────────────────────────
  { model: 'MacBook Air 13吋 M4',      storage: '16G/256G', avg: 27000, color: '午夜色', isIphone: false, count: [4, 7], condWeights: [10, 35, 40, 12, 3, 0] },
  { model: 'MacBook Air 13吋 M4',      storage: '16G/512G', avg: 32000, color: '星光色', isIphone: false, count: [3, 6], condWeights: [10, 35, 40, 12, 3, 0] },
  { model: 'MacBook Air 15吋 M4',      storage: '16G/256G', avg: 33000, color: '銀色',   isIphone: false, count: [2, 4], condWeights: [8, 32, 42, 14, 4, 0] },
  { model: 'MacBook Air 13吋 M3',      storage: '8G/256G',  avg: 26000, color: '午夜色', isIphone: false, count: [3, 5], condWeights: [3, 20, 45, 22, 8, 2] },
  { model: 'MacBook Air 13吋 M2',      storage: '8G/256G',  avg: 19000, color: '星光色', isIphone: false, count: [2, 4], condWeights: [2, 15, 42, 26, 12, 3] },
  { model: 'MacBook Pro 14吋 M4 Pro',  storage: '24G/512G', avg: 56000, color: '太空黑色', isIphone: false, count: [2, 4], condWeights: [8, 30, 42, 15, 5, 0] },
  { model: 'MacBook Pro 14吋 M4',      storage: '16G/512G', avg: 42000, color: '銀色',   isIphone: false, count: [2, 3], condWeights: [8, 30, 42, 15, 5, 0] },

  // ── iPad（中低量）─────────────────────────────────────────────────
  { model: 'iPad Air 11吋 M3',  storage: '128G', avg: 18000, color: '藍色',  isIphone: false, count: [2, 4], condWeights: [8, 28, 42, 16, 5, 1] },
  { model: 'iPad Pro 11吋 M4',  storage: '256G', avg: 25000, color: '銀色',  isIphone: false, count: [2, 4], condWeights: [8, 28, 42, 16, 5, 1] },
  { model: 'iPad mini 第7代',    storage: '128G', avg: 14000, color: '星光色', isIphone: false, count: [2, 3], condWeights: [5, 22, 44, 20, 8, 1] },

  // ── Apple Watch（中低量）─────────────────────────────────────────
  { model: 'Apple Watch Series 11', storage: '46mm', avg: 13000, color: '午夜色',   isIphone: false, count: [3, 5], condWeights: [5, 25, 45, 18, 6, 1] },
  { model: 'Apple Watch Series 10', storage: '46mm', avg: 11500, color: '銀色',     isIphone: false, count: [2, 4], condWeights: [3, 18, 44, 22, 10, 3] },
  { model: 'Apple Watch Ultra 2',   storage: '鈦金屬', avg: 24000, color: '鈦金屬原色', isIphone: false, count: [1, 3], condWeights: [5, 25, 45, 18, 6, 1] },

  // ── AirPods（耳機幾乎全新，衛生考量）────────────────────────────
  { model: 'AirPods Pro 第2代', storage: 'USB-C', avg: 7500, color: '白色', isIphone: false, count: [3, 5], condWeights: [60, 30, 8, 2, 0, 0] },
  { model: 'AirPods 第4代',     storage: 'ANC',   avg: 5500, color: '白色', isIphone: false, count: [2, 4], condWeights: [65, 28, 6, 1, 0, 0] },

  // ── Mac mini M5（新上市，少量）────────────────────────────────────
  { model: 'Mac mini M5',     storage: '16G/256G', avg: 19900, color: '銀色', isIphone: false, count: [1, 3], condWeights: [30, 45, 22, 3, 0, 0] },
  { model: 'Mac mini M5',     storage: '16G/512G', avg: 23900, color: '銀色', isIphone: false, count: [1, 2], condWeights: [30, 45, 22, 3, 0, 0] },
  // Mac mini M4（去年款）
  { model: 'Mac mini M4',     storage: '16G/256G', avg: 14500, color: '銀色', isIphone: false, count: [2, 3], condWeights: [8, 32, 42, 14, 4, 0] },
  { model: 'Mac mini M4',     storage: '16G/512G', avg: 18000, color: '銀色', isIphone: false, count: [1, 2], condWeights: [8, 32, 42, 14, 4, 0] },

  // ── Mac Studio（極少，月成交不到一台）───────────────────────────
  { model: 'Mac Studio M4 Max', storage: '36G/512G', avg: 72000, color: '銀色', isIphone: false, count: [1, 2], condWeights: [15, 40, 38, 7, 0, 0] },
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysAgoMax) {
  const d = new Date()
  d.setDate(d.getDate() - randomInt(1, daysAgoMax))
  d.setHours(randomInt(8, 23), randomInt(0, 59), randomInt(0, 59))
  return d.toISOString()
}

function weightedCondIndex(weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let j = 0; j < weights.length; j++) {
    r -= weights[j]
    if (r <= 0) return j
  }
  return weights.length - 1
}

function generateRows() {
  const rows = []
  for (const product of SEED_PRODUCTS) {
    const count = randomInt(product.count[0], product.count[1])
    for (let i = 0; i < count; i++) {
      const condIdx = weightedCondIndex(product.condWeights)
      const multiplier = CONDITION_MULTIPLIERS[condIdx]
      const variance = 0.96 + Math.random() * 0.08
      const price = Math.round((product.avg * multiplier * variance) / 500) * 500

      const batteryRange = product.batteryRange ?? [82, 100]
      const batteryHealth = product.isIphone ? randomInt(batteryRange[0], batteryRange[1]) : null
      const hasDamage = condIdx >= 3

      rows.push({
        model: product.model,
        storage: product.storage,
        color: product.color,
        condition: CONDITIONS[condIdx],
        battery_health: batteryHealth,
        has_damage: hasDamage,
        purchase_channel: randomChoice(PURCHASE_CHANNELS),
        warranty_status: randomChoice(WARRANTY_STATUS),
        warranty_months: null,
        price,
        trade_method: randomChoice(TRADE_METHODS),
        location: randomChoice(LOCATIONS),
        source: 'report',
        note: null,
        created_at: randomDate(90),
      })
    }
  }
  return rows
}

async function run() {
  // Step 1: 刪除所有舊成色名稱
  console.log('刪除舊成色名稱的資料...')
  for (const cond of OLD_CONDITIONS) {
    const { error } = await supabase.from('transactions').delete().eq('condition', cond)
    if (error) console.error(`刪除 "${cond}" 失敗:`, error.message)
    else console.log(`已刪除 condition = "${cond}"`)
  }

  // Step 2: 刪除所有 source=report（避免重複）
  console.log('刪除所有 source=report 的資料...')
  const { error: delErr } = await supabase.from('transactions').delete().eq('source', 'report')
  if (delErr) console.error('刪除 report 失敗:', delErr.message)
  else console.log('已清空 source=report 資料')

  // Step 3: 重新 seed
  const rows = generateRows()
  console.log(`準備 insert ${rows.length} 筆新資料...`)

  const batchSize = 50
  let success = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from('transactions').insert(batch)
    if (error) console.error(`第 ${i / batchSize + 1} 批失敗:`, error.message)
    else {
      success += batch.length
      console.log(`第 ${i / batchSize + 1} 批成功，累計 ${success} 筆`)
    }
  }
  console.log(`完成！共 insert ${success} / ${rows.length} 筆`)
}

run()
