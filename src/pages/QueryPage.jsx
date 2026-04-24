import { useState, useMemo, useEffect } from 'react'
import { APPLE_PRODUCTS, CATEGORIES } from '../data/mockData'
import { Smartphone, Laptop, Tablet, Watch, Headphones, Monitor, Grid2x2, Package, TrendingDown, Activity, CircleDollarSign } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getMarketPrice } from '../lib/supabase'

const CATEGORY_ICONS = {
  '全部': Grid2x2,
  'iPhone': Smartphone,
  'MacBook': Laptop,
  'iPad': Tablet,
  'Apple Watch': Watch,
  'AirPods': Headphones,
  'Mac': Monitor,
  '其他': Package,
}

function formatMoney(value) {
  return value == null ? '—' : `$${value.toLocaleString()}`
}

function ProductCategoryIcon({ category, ...props }) {
  switch (category) {
    case 'iPhone': return <Smartphone {...props} />
    case 'MacBook': return <Laptop {...props} />
    case 'iPad': return <Tablet {...props} />
    case 'Apple Watch': return <Watch {...props} />
    case 'AirPods': return <Headphones {...props} />
    case 'Mac': return <Monitor {...props} />
    default: return <Package {...props} />
  }
}

function getMonthsOld(product) {
  if (!product?.launchDate) return null
  return Math.max(0, Math.floor((new Date() - new Date(product.launchDate)) / (1000 * 60 * 60 * 24 * 30)))
}

function buildDepreciationTrend(product, storage, currentValue) {
  if (!product || !storage) return []
  const launch = product.launchPrice?.[storage] || product.basePrice[storage]
  const current = currentValue ?? product.marketAvg[storage]
  if (!launch || !current) return []

  const monthsOld = Math.max(getMonthsOld(product) ?? 1, 1)
  const points = [0, 0.2, 0.4, 0.6, 0.8, 1]
  return points.map((pct, idx) => {
    const value = Math.round((launch - (launch - current) * Math.pow(pct, 0.72)) / 100) * 100
    return {
      label: idx === 0 ? '上市' : idx === points.length - 1 ? '現在' : `${Math.round(monthsOld * pct)}月`,
      price: value,
    }
  })
}

function buildStorageBars(product) {
  if (!product) return []
  return product.storages.map(storage => ({
    storage,
    market: product.marketAvg[storage],
    retail: product.basePrice[storage],
  })).filter(row => row.market && row.retail)
}

function getPriceBand(avgValue) {
  if (!avgValue) return null
  return {
    low: Math.round(avgValue * 0.95 / 100) * 100,
    target: avgValue,
    high: Math.round(avgValue * 1.08 / 100) * 100,
  }
}

function getPrimaryMarketPrice(product) {
  return product?.marketAvg?.[product?.storages?.[0]]
}


export default function QueryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const initialProduct = APPLE_PRODUCTS.find(p => p.id === 'iphone-16-pro') ?? APPLE_PRODUCTS[0]
  const [selectedProduct, setSelectedProduct] = useState(initialProduct)
  const [selectedStorage, setSelectedStorage] = useState(initialProduct?.storages[0] ?? '')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [liveAvg, setLiveAvg] = useState(null)   // null = 尚未載入, false = 無資料
  const [avgLoading, setAvgLoading] = useState(false)

  const filtered = useMemo(() => {
    return APPLE_PRODUCTS.filter(p => {
      const matchCat = selectedCategory === '全部' || p.category === selectedCategory
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [search, selectedCategory])

  function selectProduct(product) {
    setSelectedProduct(product)
    setSelectedStorage(product.storages[0])
    setAiAnalysis('')
    setAiError('')
    setLiveAvg(null)
    // 手機版：選完產品自動捲到詳情區
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('product-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  function changeStorage(storage) {
    setSelectedStorage(storage)
    setAiAnalysis('')
    setAiError('')
    setLiveAvg(null)
  }

  // 每次型號或容量改變時，從 Supabase 撈最新均價
  useEffect(() => {
    if (!selectedProduct || !selectedStorage) return
    let cancelled = false
    const loadingId = setTimeout(() => {
      if (!cancelled) setAvgLoading(true)
    }, 0)
    getMarketPrice(selectedProduct.name, selectedStorage).then(result => {
      if (cancelled) return
      // result = { avg, count, trimmedCount } 或 null
      setLiveAvg(result && result.count >= 5 ? result : false)
      setAvgLoading(false)
    })
    return () => {
      cancelled = true
      clearTimeout(loadingId)
    }
  }, [selectedProduct, selectedStorage])

  function fetchAiAnalysis() {
    if (!selectedProduct || !selectedStorage || !avgValue) return
    setAiLoading(true)
    setAiError('')
    setAiAnalysis('')

    setTimeout(() => {
      const avg = avgValue
      const retail = selectedProduct.basePrice[selectedStorage]
      const discount = Math.round((1 - avg / retail) * 100)

      const analyses = [
        `目前 ${selectedProduct.name} ${selectedStorage} 社團均價 $${avg.toLocaleString()}，較原廠售價便宜 ${discount}%。近期供給量穩定，建議買家從均價再低 3-5% 開始出價，9成新以上品項較容易成交。`,
        `${selectedProduct.name} ${selectedStorage} 目前行情合理，成交價集中在 $${Math.round(avg*0.95/100)*100} – $${Math.round(avg*1.05/100)*100} 之間。有盒裝且保固內的機子可溢價 5-8%，賣家定價建議不超過 $${Math.round(avg*1.08/100)*100}。`,
        `市場觀察：${selectedProduct.name} ${selectedStorage} 近期成交筆數正常，價格波動在 ±5% 範圍內。買家可安心在 $${Math.round(avg*0.97/100)*100} 左右入手，超過 $${Math.round(avg*1.1/100)*100} 建議再議價。`,
      ]
      const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)]
      setAiAnalysis(randomAnalysis)
      setAiLoading(false)
    }, 800)
  }

  // loading 中沿用 mockData，載入完才切換（避免數字閃跳）
  const avgRaw = selectedProduct && selectedStorage
    ? (liveAvg && !avgLoading ? liveAvg.avg : selectedProduct.marketAvg[selectedStorage])
    : null
  const avgValue = avgRaw != null ? Math.round(avgRaw / 100) * 100 : null
  const retail = selectedProduct && selectedStorage ? selectedProduct.basePrice[selectedStorage] : null
  const discount = avgValue && retail ? Math.round((1 - avgValue / retail) * 100) : null
  const isLiveMarketPrice = Boolean(liveAvg && !avgLoading)
  const monthsOld = getMonthsOld(selectedProduct)
  const depreciationTrend = buildDepreciationTrend(selectedProduct, selectedStorage, avgValue)
  const storageBars = buildStorageBars(selectedProduct)
  const priceBand = getPriceBand(avgValue)
  const categoryProducts = selectedProduct
    ? APPLE_PRODUCTS.filter(p => p.category === selectedProduct.category)
    : []
  const categoryPrices = categoryProducts.map(getPrimaryMarketPrice).filter(Boolean)
  const maxCategoryPrice = Math.max(...categoryPrices, 1)

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#f5f5f7] pt-16 pb-14 text-center">
        <div className="max-w-[980px] mx-auto px-5">
          <div className="flex items-center justify-center gap-4 mb-6">
            {[Laptop, Smartphone, Watch, Tablet, Headphones].map((Icon, idx) => (
              <div key={idx} className="w-10 h-10 rounded-2xl bg-white border border-[rgba(0,0,0,0.06)] flex items-center justify-center shadow-sm">
                <Icon size={20} strokeWidth={1.8} className="text-[#6e6e73]" />
              </div>
            ))}
          </div>
          <h1 className="text-[48px] font-semibold text-[#1d1d1f] leading-tight tracking-tight mb-3">
            二手行情，一查就知
          </h1>
          <p className="text-[19px] text-[#6e6e73] mb-8 font-light">
            基於社團真實成交資料，買賣不再吃虧
          </p>
          <div className="flex gap-3 max-w-[560px] mx-auto mb-5">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜尋型號，例如 iPhone 16 Pro"
              className="flex-1 px-5 py-3.5 rounded-2xl border border-[rgba(0,0,0,0.1)] text-[15px] focus:outline-none focus:border-[#0071e3] bg-white shadow-sm text-[#1d1d1f] placeholder-[#6e6e73] transition-colors"
            />
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat]
              return (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-white text-[#6e6e73] hover:bg-[#e8e8ed] border border-[rgba(0,0,0,0.1)]'
                  }`}>
                  {Icon && <Icon size={13} strokeWidth={2} />}
                  {cat}
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 max-w-[560px] mx-auto mt-7 text-left">
            <div className="bg-white rounded-2xl p-3 border border-[rgba(0,0,0,0.06)]">
              <p className="text-[11px] text-[#6e6e73]">收錄產品</p>
              <p className="text-[20px] font-semibold text-[#1d1d1f]">{APPLE_PRODUCTS.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[rgba(0,0,0,0.06)]">
              <p className="text-[11px] text-[#6e6e73]">資料來源</p>
              <p className="text-[20px] font-semibold text-[#1d1d1f]">社團</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[980px] mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product list */}
          <div className="col-span-1 space-y-1.5 max-h-[40vh] lg:max-h-[72vh] overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <p className="text-[13px] text-[#6e6e73] text-center py-8">找不到相關產品</p>
            )}
            {filtered.map(product => (
              (() => {
                const primaryPrice = getPrimaryMarketPrice(product)
                const priceWidth = Math.max(8, Math.round((primaryPrice / maxCategoryPrice) * 100))
                return (
              <button key={product.id} onClick={() => selectProduct(product)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm transition-all duration-200 ${
                  selectedProduct?.id === product.id
                    ? 'bg-[#1d1d1f] text-white shadow-md'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }`}>
                <div className="font-medium text-[14px]">{product.name}</div>
                <div className={`text-[12px] mt-0.5 ${selectedProduct?.id === product.id ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>
                  參考均價 ${product.marketAvg[product.storages[0]]?.toLocaleString()}+
                </div>
                <div className={`h-1 rounded-full mt-2 overflow-hidden ${selectedProduct?.id === product.id ? 'bg-white/15' : 'bg-white'}`}>
                  <div
                    className={`h-full rounded-full ${selectedProduct?.id === product.id ? 'bg-[#0071e3]' : 'bg-[#d2d2d7]'}`}
                    style={{ width: `${priceWidth}%` }}
                  />
                </div>
              </button>
                )
              })()
            ))}
          </div>

          {/* Detail panel */}
          <div id="product-detail" className="col-span-2">
            {!selectedProduct ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#6e6e73] text-[15px] gap-3">
                <div className="text-4xl opacity-20">⌕</div>
                <p>選擇左側產品查看行情</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="bg-[#f5f5f7] rounded-[28px] p-5 border border-[rgba(0,0,0,0.05)] flex items-start gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-white border border-[rgba(0,0,0,0.06)] flex items-center justify-center shadow-sm shrink-0">
                    <ProductCategoryIcon category={selectedProduct.category} size={30} strokeWidth={1.7} className="text-[#1d1d1f]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-[#6e6e73] border border-[rgba(0,0,0,0.06)]">{selectedProduct.category}</span>
                      {monthsOld != null && <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-[#6e6e73] border border-[rgba(0,0,0,0.06)]">上市 {monthsOld} 個月</span>}
                    </div>
                    <h2 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">{selectedProduct.name}</h2>
                    <p className="text-[13px] text-[#6e6e73] mt-1">用成交均價、原廠售價與折舊曲線判斷買賣區間</p>
                  </div>
                </div>

                {/* Storage selector */}
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.storages.map(s => (
                    <button key={s} onClick={() => changeStorage(s)}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-200 ${
                        selectedStorage === s
                          ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white'
                          : 'border-[rgba(0,0,0,0.15)] text-[#1d1d1f] hover:border-[#1d1d1f]'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#f5f5f7] rounded-2xl p-4">
                    <p className="text-[11px] text-[#6e6e73] mb-1 font-medium">
                      {isLiveMarketPrice ? `社團均價（${liveAvg.count} 筆）` : '參考均價'}
                    </p>
                    {avgLoading
                      ? <p className="text-[18px] font-semibold text-[#6e6e73] tracking-tight">載入中…</p>
                      : <p className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
                          ${avgValue != null ? avgValue.toLocaleString() : '—'}
                        </p>
                    }
                    {!avgLoading && !isLiveMarketPrice && (
                      <p className="text-[10px] text-[#6e6e73] mt-1">成交筆數不足時顯示資料庫參考值</p>
                    )}
                  </div>
                  <div className="bg-[#e3f2fd] rounded-2xl p-4">
                    <p className="text-[11px] text-[#6e6e73] mb-1 font-medium">平均折扣</p>
                    <p className="text-[22px] font-semibold text-[#0071e3] tracking-tight">{discount != null ? `${discount}% off` : '—'}</p>
                  </div>
                  <a href="https://www.apple.com/tw/trade-in/" target="_blank" rel="noreferrer"
                    className="bg-[#fce4ec] rounded-2xl p-4 flex flex-col justify-between hover:opacity-80 transition-opacity">
                    <div>
                      <p className="text-[11px] text-[#6e6e73] mb-1 font-medium">官方回收估價</p>
                      <p className="text-[18px] font-semibold text-[#ff3b30] tracking-tight leading-snug">前往 Apple<br />官網試算 →</p>
                    </div>
                    <p className="text-[10px] text-[#ff3b30] mt-2 opacity-70">實際金額依機況而定</p>
                  </a>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">折舊曲線</p>
                        <p className="text-[13px] text-[#6e6e73] mt-1">上市價到目前行情</p>
                      </div>
                      <TrendingDown size={18} className="text-[#ff3b30]" />
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={depreciationTrend} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v / 1000)}k`} width={42} />
                          <Tooltip formatter={v => [formatMoney(v), '行情']} contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }} />
                          <Line type="monotone" dataKey="price" stroke="#ff3b30" strokeWidth={2.5} dot={{ r: 3, fill: '#ff3b30' }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">容量價差</p>
                        <p className="text-[13px] text-[#6e6e73] mt-1">原廠售價 vs 參考均價</p>
                      </div>
                      <Activity size={18} className="text-[#0071e3]" />
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={storageBars} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="storage" tick={{ fontSize: 11, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v / 1000)}k`} width={42} />
                          <Tooltip formatter={v => formatMoney(v)} contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }} />
                          <Bar dataKey="retail" name="原廠" fill="#d2d2d7" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="market" name="行情" fill="#0071e3" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {priceBand && (
                  <div className="border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 bg-white">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">成交區間建議</p>
                        <p className="text-[13px] text-[#6e6e73] mt-1">以目前均價估算合理買賣帶</p>
                      </div>
                      <CircleDollarSign size={18} className="text-[#34c759]" />
                    </div>
                    <div className="relative h-3 rounded-full bg-[#f5f5f7] overflow-hidden">
                      <div className="absolute inset-y-0 left-[18%] right-[18%] bg-[#e8f5e9]" />
                      <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-[#34c759] rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div>
                        <p className="text-[11px] text-[#6e6e73]">好買價</p>
                        <p className="text-[15px] font-semibold text-[#34c759]">{formatMoney(priceBand.low)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-[#6e6e73]">均價</p>
                        <p className="text-[15px] font-semibold text-[#1d1d1f]">{formatMoney(priceBand.target)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-[#6e6e73]">偏高價</p>
                        <p className="text-[15px] font-semibold text-[#ff9500]">{formatMoney(priceBand.high)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 原廠開賣資訊 */}
                {selectedProduct.launchDate && (
                  <div className="bg-[#f5f5f7] rounded-2xl p-5">
                    <p className="text-[11px] font-semibold text-[#6e6e73] mb-4 uppercase tracking-wider">原廠開賣資訊</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[11px] text-[#6e6e73] mb-1">開賣日期</p>
                        <p className="font-semibold text-[#1d1d1f] text-[14px]">{selectedProduct.launchDate}</p>
                        <p className="text-[11px] text-[#6e6e73] mt-0.5">
                          {Math.floor((new Date() - new Date(selectedProduct.launchDate)) / (1000*60*60*24*30))} 個月前
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6e6e73] mb-1">原廠售價</p>
                        <p className="font-semibold text-[#1d1d1f] text-[14px]">
                          ${(selectedProduct.launchPrice?.[selectedStorage] || selectedProduct.basePrice[selectedStorage])?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6e6e73] mb-1">目前折舊</p>
                        {(() => {
                          const launch = selectedProduct.launchPrice?.[selectedStorage] || selectedProduct.basePrice[selectedStorage]
                          const current = avgValue ?? selectedProduct.marketAvg[selectedStorage]
                          const drop = launch - current
                          const dropPct = Math.round((drop / launch) * 100)
                          return (
                            <div>
                              <p className="font-semibold text-[#ff3b30] text-[14px]">-${drop.toLocaleString()}</p>
                              <p className="text-[11px] text-[#ff3b30]">跌了 {dropPct}%</p>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI 分析 */}
                <div className="border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">AI 行情分析</p>
                    <button onClick={fetchAiAnalysis} disabled={aiLoading}
                      className="text-[13px] px-4 py-1.5 bg-[#0071e3] text-white rounded-full hover:bg-[#0077ed] disabled:opacity-50 transition font-medium">
                      {aiLoading ? '分析中…' : aiAnalysis ? '重新分析' : '取得 AI 建議'}
                    </button>
                  </div>
                  {aiError && <p className="text-[13px] text-[#ff3b30]">{aiError}</p>}
                  {aiAnalysis && (
                    <p className="text-[14px] text-[#1d1d1f] leading-relaxed">{aiAnalysis}</p>
                  )}
                  {!aiAnalysis && !aiError && !aiLoading && (
                    <p className="text-[13px] text-[#6e6e73]">點擊右側按鈕取得 AI 買賣建議</p>
                  )}
                </div>

                {/* 可選顏色 */}
                <div>
                  <p className="text-[11px] font-semibold text-[#6e6e73] mb-3 uppercase tracking-wider">可選顏色</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map(color => (
                      <span key={color} className="px-3 py-1.5 bg-[#f5f5f7] rounded-full text-[13px] text-[#1d1d1f] border border-[rgba(0,0,0,0.06)]">{color}</span>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
