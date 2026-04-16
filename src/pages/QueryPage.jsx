import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { APPLE_PRODUCTS, CATEGORIES, CONDITIONS, generateTransactions } from '../data/mockData'

function generateChartData(basePrice, tradeInPrice, days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const label = `${date.getMonth() + 1}/${date.getDate()}`
    const price = Math.round((basePrice + (Math.random() - 0.5) * basePrice * 0.12) / 100) * 100
    return { date: label, price, tradeIn: tradeInPrice }
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm text-xs space-y-1">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map(p => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span style={{ color: p.color }}>●</span>
            <span className="text-gray-500">{p.dataKey === 'price' ? '社團均價' : '官方回收'}</span>
            <span className="font-semibold text-gray-900">${p.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function QueryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedStorage, setSelectedStorage] = useState('')
  const [transactions, setTransactions] = useState([])
  const [chartData, setChartData] = useState([])
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const filtered = useMemo(() => {
    return APPLE_PRODUCTS.filter(p => {
      const matchCat = selectedCategory === '全部' || p.category === selectedCategory
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [search, selectedCategory])

  function selectProduct(product) {
    setSelectedProduct(product)
    const firstStorage = product.storages[0]
    setSelectedStorage(firstStorage)
    setTransactions(generateTransactions(product.id, firstStorage))
    setChartData(generateChartData(product.marketAvg[firstStorage], product.tradeInPrice?.[firstStorage] || 0))
    setAiAnalysis('')
    setAiError('')
  }

  function changeStorage(storage) {
    setSelectedStorage(storage)
    setTransactions(generateTransactions(selectedProduct.id, storage))
    setChartData(generateChartData(selectedProduct.marketAvg[storage], selectedProduct.tradeInPrice?.[storage] || 0))
    setAiAnalysis('')
    setAiError('')
  }

  function fetchAiAnalysis() {
    if (!selectedProduct || !selectedStorage) return
    setAiLoading(true)
    setAiError('')
    setAiAnalysis('')

    setTimeout(() => {
      const avg = selectedProduct.marketAvg[selectedStorage]
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

  const avg = selectedProduct && selectedStorage ? selectedProduct.marketAvg[selectedStorage] : null
  const retail = selectedProduct && selectedStorage ? selectedProduct.basePrice[selectedStorage] : null
  const discount = avg && retail ? Math.round((1 - avg / retail) * 100) : null

  const conditionPrices = selectedProduct && selectedStorage
    ? CONDITIONS.map((c, i) => {
        const multipliers = [1.05, 1.02, 1.0, 0.97, 0.93, 0.85]
        return { condition: c, price: Math.round(avg * multipliers[i] / 100) * 100 }
      })
    : []

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Search */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">二手行情，一查就知</h1>
        <p className="text-gray-500 mb-6 text-sm">基於社團真實成交資料，買賣不再吃虧</p>
        <div className="flex gap-3 max-w-xl mx-auto mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋型號，例如 iPhone 16 Pro"
            className="flex-1 px-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-gray-400 bg-gray-50"
          />
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${selectedCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Product list */}
        <div className="col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">找不到相關產品</p>
          )}
          {filtered.map(product => (
            <button key={product.id} onClick={() => selectProduct(product)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${selectedProduct?.id === product.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
              <div className="font-medium">{product.name}</div>
              <div className={`text-xs mt-0.5 ${selectedProduct?.id === product.id ? 'text-gray-300' : 'text-gray-400'}`}>
                均價 ${product.marketAvg[product.storages[0]]?.toLocaleString()}+
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="col-span-2">
          {!selectedProduct ? (
            <div className="flex items-center justify-center h-64 text-gray-300 text-sm">
              選擇左側產品查看行情
            </div>
          ) : (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>

              {/* Storage selector */}
              <div className="flex gap-2 flex-wrap">
                {selectedProduct.storages.map(s => (
                  <button key={s} onClick={() => changeStorage(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${selectedStorage === s ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                    {s}
                  </button>
                ))}
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">社團均價</p>
                  <p className="text-2xl font-bold text-gray-900">${avg?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">原廠售價</p>
                  <p className="text-2xl font-bold text-gray-400">${retail?.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">平均折扣</p>
                  <p className="text-2xl font-bold text-green-600">{discount}% off</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">官方回收價</p>
                  <p className="text-2xl font-bold text-red-500">
                    ${selectedProduct.tradeInPrice?.[selectedStorage]?.toLocaleString() || '—'}
                  </p>
                  <p className="text-xs text-red-300 mt-1">最高容量最高可達</p>
                </div>
              </div>

              {/* 原廠開賣資訊 */}
              {selectedProduct.launchDate && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">原廠開賣資訊</p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">開賣日期</p>
                      <p className="font-medium text-gray-900">{selectedProduct.launchDate}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {Math.floor((new Date() - new Date(selectedProduct.launchDate)) / (1000*60*60*24*30))} 個月前
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">原廠售價</p>
                      <p className="font-medium text-gray-900">
                        ${(selectedProduct.launchPrice?.[selectedStorage] || selectedProduct.basePrice[selectedStorage])?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">目前折舊</p>
                      {(() => {
                        const launch = selectedProduct.launchPrice?.[selectedStorage] || selectedProduct.basePrice[selectedStorage]
                        const current = selectedProduct.marketAvg[selectedStorage]
                        const drop = launch - current
                        const dropPct = Math.round((drop / launch) * 100)
                        return (
                          <div>
                            <p className="font-medium text-red-500">-${drop.toLocaleString()}</p>
                            <p className="text-xs text-red-400">跌了 {dropPct}%</p>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Recharts 趨勢圖 */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-xs font-semibold text-gray-500 mb-4">近 30 天成交價趨勢</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={28}
                      formatter={(value) => value === 'price' ? '社團成交價' : 'Apple 官方回收價'}
                      wrapperStyle={{ fontSize: '11px', color: '#6b7280' }}
                    />
                    <Line type="monotone" dataKey="price" name="price" stroke="#1d1d1f" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="tradeIn" name="tradeIn" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-2">
                  ⚠️ 紅色虛線為 Apple 官方回收估價（{selectedStorage} 最高可達），實際回收價依機況、電池健康度而異，請至
                  <a href="https://www.apple.com/tw/trade-in/" target="_blank" rel="noreferrer" className="underline ml-1">Apple Trade In</a> 查詢正確金額。
                </p>
              </div>

              {/* AI 分析 */}
              <div className="border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500">AI 行情分析</p>
                  <button onClick={fetchAiAnalysis} disabled={aiLoading}
                    className="text-xs px-4 py-1.5 bg-gray-900 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 transition">
                    {aiLoading ? '分析中...' : aiAnalysis ? '重新分析' : '取得 AI 建議'}
                  </button>
                </div>
                {aiError && <p className="text-xs text-red-500">{aiError}</p>}
                {aiAnalysis && (
                  <p className="text-sm text-gray-700 leading-relaxed">{aiAnalysis}</p>
                )}
                {!aiAnalysis && !aiError && !aiLoading && (
                  <p className="text-xs text-gray-300">點擊右側按鈕取得 AI 買賣建議</p>
                )}
              </div>

              {/* Condition price table */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3">各成色參考行情</p>
                <div className="space-y-2">
                  {conditionPrices.map(({ condition, price }) => (
                    <div key={condition} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{condition}</span>
                      <span className="font-semibold text-gray-900">${price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">可選顏色</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.colors.map(color => (
                    <span key={color} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{color}</span>
                  ))}
                </div>
              </div>

              {/* Recent transactions */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">近期成交紀錄</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {transactions.slice(0, 6).map((tx, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-50 last:border-0 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{tx.daysAgo === 0 ? '今天' : tx.daysAgo + '天前'}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{tx.condition}</span>
                        <span className="text-xs text-gray-400">{tx.tradeMethod}</span>
                      </div>
                      <span className="font-semibold text-gray-900">${tx.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
