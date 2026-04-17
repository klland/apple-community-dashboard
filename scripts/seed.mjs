import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://aymposvjqhdsalxiffje.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bXBvc3ZqcWhkc2FseGlmZmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjc0NjgsImV4cCI6MjA5MTkwMzQ2OH0._vrmCkm-aaU-991etNw_8cL-tOSNTcSTAyVkLKmoORs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const CONDITIONS = ['全新未拆封', '外觀完美無痕', '輕微細紋（正常使用）', '邊框有小刮痕', '背蓋有明顯刮痕', '機身有缺陷／碰傷']
const CONDITION_MULTIPLIERS = [1.05, 1.02, 1.0, 0.97, 0.93, 0.85]
const TRADE_METHODS = ['面交', '郵寄（賣家出運費）', '郵寄（買家出運費）', '面交或郵寄皆可']
// 依社團 Facebook Insights 城市排名加權
const LOCATIONS = [
  '新北市', '新北市', '新北市',
  '台中市', '台中市', '台中市',
  '台北市', '台北市',
  '桃園市', '桃園市',
  '高雄市', '高雄市',
  '台南市',
  '新竹市',
  '雲林縣',
  '基隆市',
  '嘉義市',
]
const PURCHASE_CHANNELS = ['Apple 官方直購', '電信門市（中華/遠傳/台哥大）', '授權經銷商（iStore/STUDIO A 等）', 'Facebook 社團', '實體二手店']
const WARRANTY_STATUS = ['原廠保固內', '已過原廠保固', '延長保固（AppleCare+）']

// 主力機型，每款產生較多筆
const SEED_PRODUCTS = [
  // iPhone 17 系列
  { model: 'iPhone 17 Pro Max', storage: '256G', avg: 38000, color: '黑色鈦', isIphone: true },
  { model: 'iPhone 17 Pro Max', storage: '512G', avg: 44000, color: '白色鈦', isIphone: true },
  { model: 'iPhone 17 Pro Max', storage: '1T', avg: 50000, color: '沙漠色鈦', isIphone: true },
  { model: 'iPhone 17 Pro', storage: '256G', avg: 34000, color: '沙漠色鈦', isIphone: true },
  { model: 'iPhone 17 Pro', storage: '512G', avg: 40000, color: '黑色鈦', isIphone: true },
  { model: 'iPhone 17', storage: '256G', avg: 25000, color: '黑色', isIphone: true },
  { model: 'iPhone 17 Air', storage: '256G', avg: 31000, color: '藍色', isIphone: true },
  // iPhone 16 系列
  { model: 'iPhone 16 Pro Max', storage: '256G', avg: 30000, color: '黑色鈦', isIphone: true },
  { model: 'iPhone 16 Pro Max', storage: '512G', avg: 34000, color: '本然鈦', isIphone: true },
  { model: 'iPhone 16 Pro', storage: '128G', avg: 24000, color: '黑色鈦', isIphone: true },
  { model: 'iPhone 16 Pro', storage: '256G', avg: 27000, color: '沙漠色鈦', isIphone: true },
  { model: 'iPhone 16 Pro', storage: '512G', avg: 31000, color: '白色鈦', isIphone: true },
  { model: 'iPhone 16', storage: '128G', avg: 17000, color: '黑色', isIphone: true },
  { model: 'iPhone 16', storage: '256G', avg: 19500, color: '白色', isIphone: true },
  { model: 'iPhone 16 Plus', storage: '128G', avg: 20000, color: '超深藍', isIphone: true },
  // iPhone 15 系列
  { model: 'iPhone 15 Pro Max', storage: '256G', avg: 22000, color: '黑色鈦', isIphone: true },
  { model: 'iPhone 15 Pro', storage: '128G', avg: 15000, color: '白色鈦', isIphone: true },
  { model: 'iPhone 15 Pro', storage: '256G', avg: 17000, color: '本然鈦', isIphone: true },
  { model: 'iPhone 15', storage: '128G', avg: 11000, color: '黑色', isIphone: true },
  { model: 'iPhone 15', storage: '256G', avg: 13000, color: '藍色', isIphone: true },
  // iPhone 14 系列
  { model: 'iPhone 14 Pro Max', storage: '128G', avg: 13000, color: '深紫色', isIphone: true },
  { model: 'iPhone 14 Pro', storage: '128G', avg: 11000, color: '太空黑色', isIphone: true },
  { model: 'iPhone 14', storage: '128G', avg: 8000, color: '午夜色', isIphone: true },
  // iPhone 13 系列
  { model: 'iPhone 13 Pro Max', storage: '128G', avg: 9500, color: '石墨色', isIphone: true },
  { model: 'iPhone 13 Pro', storage: '128G', avg: 7500, color: '遠峰藍', isIphone: true },
  { model: 'iPhone 13', storage: '128G', avg: 6000, color: '午夜色', isIphone: true },
  // MacBook
  { model: 'MacBook Air 13吋 M4', storage: '16G/256G', avg: 27000, color: '午夜色', isIphone: false },
  { model: 'MacBook Air 13吋 M4', storage: '16G/512G', avg: 32000, color: '星光色', isIphone: false },
  { model: 'MacBook Air 15吋 M4', storage: '16G/256G', avg: 33000, color: '銀色', isIphone: false },
  { model: 'MacBook Air 13吋 M3', storage: '8G/256G', avg: 26000, color: '午夜色', isIphone: false },
  { model: 'MacBook Air 13吋 M2', storage: '8G/256G', avg: 19000, color: '星光色', isIphone: false },
  { model: 'MacBook Pro 14吋 M4 Pro', storage: '24G/512G', avg: 56000, color: '太空黑色', isIphone: false },
  { model: 'MacBook Pro 14吋 M4', storage: '16G/512G', avg: 42000, color: '銀色', isIphone: false },
  // iPad
  { model: 'iPad Air 11吋 M3', storage: '128G', avg: 18000, color: '藍色', isIphone: false },
  { model: 'iPad Pro 11吋 M4', storage: '256G', avg: 25000, color: '銀色', isIphone: false },
  { model: 'iPad mini 第7代', storage: '128G', avg: 14000, color: '星光色', isIphone: false },
  // Apple Watch
  { model: 'Apple Watch Series 11', storage: '46mm', avg: 13000, color: '午夜色', isIphone: false },
  { model: 'Apple Watch Series 10', storage: '46mm', avg: 11500, color: '銀色', isIphone: false },
  { model: 'Apple Watch Ultra 2', storage: '鈦金屬', avg: 24000, color: '鈦金屬原色', isIphone: false },
  // Mac mini
  { model: 'Mac mini M4', storage: '16G/256G', avg: 14500, color: '銀色', isIphone: false },
  { model: 'Mac mini M4', storage: '16G/512G', avg: 18000, color: '銀色', isIphone: false },
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
  // 隨機時間
  d.setHours(randomInt(8, 23), randomInt(0, 59), randomInt(0, 59))
  return d.toISOString()
}

function generateRows() {
  const rows = []
  for (const product of SEED_PRODUCTS) {
    // 主力機型多筆，舊機少筆
    const count = product.avg > 20000 ? randomInt(6, 10) : randomInt(3, 6)
    for (let i = 0; i < count; i++) {
      // 9成新最多，全新未拆最少，符合真實市場
      const condWeights = [2, 15, 40, 25, 12, 6]
      const totalWeight = condWeights.reduce((a, b) => a + b, 0)
      let r = Math.random() * totalWeight
      let condIdx = 0
      for (let j = 0; j < condWeights.length; j++) {
        r -= condWeights[j]
        if (r <= 0) { condIdx = j; break }
      }
      const multiplier = CONDITION_MULTIPLIERS[condIdx]
      const variance = 0.96 + Math.random() * 0.08 // ±4%
      const price = Math.round((product.avg * multiplier * variance) / 500) * 500

      const batteryHealth = product.isIphone ? randomInt(82, 100) : null
      const hasDamage = condIdx >= 3
      const tradeMethod = randomChoice(TRADE_METHODS)
      const location = tradeMethod.includes('面交') ? randomChoice(LOCATIONS) : randomChoice(LOCATIONS)

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
        trade_method: tradeMethod,
        location,
        source: 'report',
        note: null,
        created_at: randomDate(90),
      })
    }
  }
  return rows
}

async function seed() {
  const rows = generateRows()
  console.log(`準備 insert ${rows.length} 筆資料...`)

  // 分批 insert，每批 50 筆
  const batchSize = 50
  let success = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from('transactions').insert(batch)
    if (error) {
      console.error(`第 ${i / batchSize + 1} 批失敗:`, error.message)
    } else {
      success += batch.length
      console.log(`第 ${i / batchSize + 1} 批成功，累計 ${success} 筆`)
    }
  }
  console.log(`完成！共 insert ${success} / ${rows.length} 筆`)
}

seed()
