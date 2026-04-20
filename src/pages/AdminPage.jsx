import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase, getReports, updateReportStatus, deleteReport } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const ADMIN_KEY = 'klland'

function StatCard({ title, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function BarRow({ label, count, max, color = 'bg-gray-900' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-36 truncate shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${(count / max) * 100}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right shrink-0">{count}</span>
    </div>
  )
}

export default function AdminPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [tableSearch, setTableSearch] = useState('')
  const [chartModel, setChartModel] = useState('')
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)

  useEffect(() => {
    const search = location.search
      || (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '')
    const params = new URLSearchParams(search)
    if (params.get('key') === ADMIN_KEY) {
      setAuthed(true)
    } else {
      navigate('/', { replace: true })
    }
  }, [location.search])

  useEffect(() => {
    if (!authed) return
    fetchData()
    fetchReports()
  }, [authed])

  async function fetchReports() {
    setReportsLoading(true)
    const r = await getReports().catch(() => [])
    setReports(r)
    setReportsLoading(false)
  }

  async function toggleResolved(id, current) {
    await updateReportStatus(id, !current).catch(() => {})
    setReports(prev => prev.map(r => r.id === id ? { ...r, resolved: !current } : r))
  }

  async function removeReport(id) {
    await deleteReport(id).catch(() => {})
    setReports(prev => prev.filter(r => r.id !== id))
  }

  async function fetchData() {
    setLoading(true)
    // Supabase 預設 limit 1000，分頁撈全部
    let all = []
    let from = 0
    const PAGE = 1000
    while (true) {
      const { data: page, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1)
      if (error) break
      if (!page || page.length === 0) break
      all = all.concat(page)
      if (page.length < PAGE) break
      from += PAGE
    }
    setData(all)
    setLoading(false)
  }

  async function deleteRow(id) {
    if (!window.confirm('確定刪除這筆資料？')) return
    setDeleting(id)
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) setData(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
  }

  // 可選型號列表（有資料的，依筆數排序，附最早日期）
  const modelOptions = useMemo(() => {
    const counts = {}
    const earliest = {}
    for (const r of data) {
      if (!r.model) continue
      counts[r.model] = (counts[r.model] || 0) + 1
      if (!earliest[r.model] || r.created_at < earliest[r.model]) earliest[r.model] = r.created_at
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([m]) => ({ model: m, since: earliest[m]?.slice(0, 7) }))
  }, [data])

  // 折線圖資料：從最早有資料的月份起算到現在
  const chartData = useMemo(() => {
    if (!chartModel) return []
    const now = new Date()
    // 找該型號最早一筆資料的月份
    const modelRows = data.filter(r => r.model === chartModel && r.price && r.created_at)
    if (modelRows.length === 0) return []
    const minDate = modelRows.reduce((a, r) => r.created_at < a ? r.created_at : a, modelRows[0].created_at)
    const start = new Date(minDate)
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    const buckets = {}
    let cursor = new Date(start)
    while (cursor <= now) {
      const key = `${cursor.getFullYear()}/${String(cursor.getMonth() + 1).padStart(2, '0')}`
      buckets[key] = []
      cursor.setMonth(cursor.getMonth() + 1)
    }
    for (const r of modelRows) {
      const d = new Date(r.created_at)
      const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key in buckets) buckets[key].push(r.price)
    }
    return Object.entries(buckets).map(([ym, prices]) => {
      const [year, month] = ym.split('/')
      // 每年一月顯示年份，其他只顯示月份
      const label = month === '01' ? `${year}\n${month}月` : `${month}月`
      return {
        ym,
        label,
        avg: prices.length > 0
          ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
          : null,
        count: prices.length,
      }
    })
  }, [chartModel, data])

  if (!authed) return null

  // 統計
  const total = data.length
  const today = data.filter(r => r.created_at?.startsWith(new Date().toISOString().split('T')[0])).length
  const thisWeek = (() => {
    const d = new Date(); d.setDate(d.getDate() - 7)
    return data.filter(r => new Date(r.created_at) >= d).length
  })()
  const fromReport = data.filter(r => r.source === 'report').length
  const fromPost = data.filter(r => r.source === 'post').length

  // 各型號均價排行（含上個月比較）
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const modelPrices = {}
  const modelPricesLastMonth = {}
  for (const r of data) {
    if (!r.model || !r.price) continue
    const d = new Date(r.created_at)
    if (d >= thisMonthStart) {
      if (!modelPrices[r.model]) modelPrices[r.model] = []
      modelPrices[r.model].push(r.price)
    } else if (d >= lastMonthStart) {
      if (!modelPricesLastMonth[r.model]) modelPricesLastMonth[r.model] = []
      modelPricesLastMonth[r.model].push(r.price)
    }
  }
  // 若本月資料太少，fallback 用全部資料
  const modelPricesAll = {}
  for (const r of data) {
    if (!r.model || !r.price) continue
    if (!modelPricesAll[r.model]) modelPricesAll[r.model] = []
    modelPricesAll[r.model].push(r.price)
  }

  const avgOf = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null

  const modelAvg = Object.entries(modelPricesAll)
    .map(([model, prices]) => {
      const avg = avgOf(prices)
      const lastAvg = avgOf(modelPricesLastMonth[model] ?? [])
      const thisAvg = avgOf(modelPrices[model] ?? [])
      // 比較本月 vs 上月，若本月無資料則不顯示趨勢
      const pct = (thisAvg && lastAvg)
        ? ((thisAvg - lastAvg) / lastAvg * 100).toFixed(1)
        : null
      return { model, avg, count: prices.length, pct }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // 成色分布
  const conditionCount = {}
  for (const r of data) {
    if (r.condition) conditionCount[r.condition] = (conditionCount[r.condition] || 0) + 1
  }
  const conditionEntries = Object.entries(conditionCount).sort((a, b) => b[1] - a[1])
  const maxCondition = Math.max(...conditionEntries.map(e => e[1])) || 1

  // 交易方式分布
  const tradeCount = {}
  for (const r of data) {
    if (r.trade_method) tradeCount[r.trade_method] = (tradeCount[r.trade_method] || 0) + 1
  }
  const tradeEntries = Object.entries(tradeCount).sort((a, b) => b[1] - a[1])
  const maxTrade = Math.max(...tradeEntries.map(e => e[1])) || 1

  // 地區分布
  const locationCount = {}
  for (const r of data) {
    const loc = r.location?.split(' ')[0]
    if (loc) locationCount[loc] = (locationCount[loc] || 0) + 1
  }
  const locationEntries = Object.entries(locationCount).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxLocation = Math.max(...locationEntries.map(e => e[1])) || 1

  // 每小時分布
  const hourCount = Array(24).fill(0)
  for (const r of data) {
    const h = new Date(r.created_at).getHours()
    hourCount[h]++
  }
  const maxHour = Math.max(...hourCount) || 1

  // 近 7 天每日
  const dailyCount = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dailyCount[d.toISOString().split('T')[0]] = 0
  }
  for (const r of data) {
    const day = r.created_at?.split('T')[0]
    if (day in dailyCount) dailyCount[day]++
  }
  const maxDay = Math.max(...Object.values(dailyCount)) || 1

  // 近 3 個月每月
  const monthlyCount = {}
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyCount[key] = 0
  }
  for (const r of data) {
    if (!r.created_at) continue
    const d = new Date(r.created_at)
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in monthlyCount) monthlyCount[key]++
  }
  const maxMonth = Math.max(...Object.values(monthlyCount)) || 1

  // 價格異常偵測：同型號+容量，離均價 ±30%
  const modelStoragePrices = {}
  for (const r of data) {
    if (!r.model || !r.price) continue
    const key = `${r.model}__${r.storage || ''}`
    if (!modelStoragePrices[key]) modelStoragePrices[key] = []
    modelStoragePrices[key].push(r.price)
  }
  const modelStorageAvg = {}
  for (const [key, prices] of Object.entries(modelStoragePrices)) {
    modelStorageAvg[key] = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  }
  function isAnomaly(r) {
    if (!r.model || !r.price) return false
    const key = `${r.model}__${r.storage || ''}`
    const avg = modelStorageAvg[key]
    if (!avg) return false
    return Math.abs(r.price - avg) / avg > 0.3
  }

  // 明細搜尋過濾
  const filteredData = tableSearch.trim()
    ? data.filter(r => r.model?.toLowerCase().includes(tableSearch.toLowerCase()))
    : data

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">管理員後台</h1>
            <p className="text-xs text-gray-400 mt-1">蘋果二手行情網站數據總覽</p>
          </div>
          <button onClick={fetchData}
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 bg-white">
            重新整理
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-20">載入中...</p>
        ) : (
          <>
            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard title="總回報筆數" value={total} sub="自開站累計" />
              <StatCard title="今日新增" value={today} sub={new Date().toLocaleDateString('zh-TW')} />
              <StatCard title="近 7 天" value={thisWeek} />
              <StatCard title="來源分布" value={`${fromReport} / ${fromPost}`} sub="成交回報 / 貼文產生器" />
            </div>

            {/* 近 7 天 + 近 3 個月趨勢 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">近 7 天每日提交數</p>
                <div className="flex items-end gap-2 h-28">
                  {Object.entries(dailyCount).map(([day, count]) => (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">{count}</span>
                      <div className="w-full rounded-t-md bg-gray-900 transition-all"
                        style={{ height: `${(count / maxDay) * 80}px`, minHeight: count > 0 ? 4 : 0 }} />
                      <span className="text-xs text-gray-400">{day.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">近 3 個月提交量</p>
                <div className="flex items-end gap-4 h-28">
                  {Object.entries(monthlyCount).map(([month, count]) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">{count}</span>
                      <div className="w-full rounded-t-md bg-blue-500 transition-all"
                        style={{ height: `${(count / maxMonth) * 80}px`, minHeight: count > 0 ? 4 : 0 }} />
                      <span className="text-xs text-gray-400">{month.slice(5)} 月</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 使用時段 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">使用時段分布（小時）</p>
              <div className="flex items-end gap-0.5 h-20">
                {hourCount.map((count, h) => (
                  <div key={h} className="flex-1 flex flex-col items-center">
                    <div className="w-full rounded-t bg-blue-400"
                      style={{ height: `${(count / maxHour) * 64}px`, minHeight: count > 0 ? 2 : 0 }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0時</span><span>6時</span><span>12時</span><span>18時</span><span>23時</span>
              </div>
            </div>

            {/* 各型號均價 + 成色分布 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">各型號均價排行</p>
                <div className="space-y-3">
                  {modelAvg.map(({ model, avg, count, pct }) => (
                    <div key={model} className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 truncate">{model}</p>
                        <p className="text-xs text-gray-400">{count} 筆</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {pct !== null && (
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            Number(pct) < 0
                              ? 'bg-red-50 text-red-500'
                              : Number(pct) > 0
                                ? 'bg-green-50 text-green-600'
                                : 'bg-gray-100 text-gray-400'
                          }`}>
                            {Number(pct) > 0 ? '+' : ''}{pct}%
                          </span>
                        )}
                        <span className="text-sm font-semibold text-blue-600">
                          ${avg.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {modelAvg.length === 0 && <p className="text-sm text-gray-400">尚無資料</p>}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">成色分布</p>
                <div className="space-y-2">
                  {conditionEntries.map(([cond, count]) => (
                    <BarRow key={cond} label={cond} count={count} max={maxCondition} color="bg-green-500" />
                  ))}
                  {conditionEntries.length === 0 && <p className="text-sm text-gray-400">尚無資料</p>}
                </div>
              </div>
            </div>

            {/* 交易方式 + 地區分布 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">交易方式分布</p>
                <div className="space-y-2">
                  {tradeEntries.map(([method, count]) => (
                    <BarRow key={method} label={method} count={count} max={maxTrade} color="bg-purple-500" />
                  ))}
                  {tradeEntries.length === 0 && <p className="text-sm text-gray-400">尚無資料</p>}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">地區分布</p>
                <div className="space-y-2">
                  {locationEntries.map(([loc, count]) => (
                    <BarRow key={loc} label={loc} count={count} max={maxLocation} color="bg-orange-400" />
                  ))}
                  {locationEntries.length === 0 && <p className="text-sm text-gray-400">尚無資料</p>}
                </div>
              </div>
            </div>

            {/* 型號均價趨勢折線圖 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4 gap-3">
                <p className="text-sm font-semibold text-gray-700">
                  型號均價走勢
                  {chartModel && chartData.length > 0 && (
                    <span className="font-normal text-gray-400 ml-2 text-xs">
                      {chartData[0].ym.replace('/', '/')} – {chartData[chartData.length - 1].ym.replace('/', '/')}
                    </span>
                  )}
                </p>
                <select
                  value={chartModel}
                  onChange={e => setChartModel(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 max-w-[240px]"
                >
                  <option value="">選擇型號…</option>
                  {modelOptions.map(({ model, since }) => (
                    <option key={model} value={model}>{model}　({since?.slice(0,4)}~)</option>
                  ))}
                </select>
              </div>
              {!chartModel ? (
                <p className="text-xs text-gray-400 text-center py-10">請選擇型號查看均價走勢</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="label"
                        tick={({ x, y, payload }) => {
                          const lines = payload.value.split('\n')
                          return (
                            <g transform={`translate(${x},${y})`}>
                              {lines.map((line, i) => (
                                <text key={i} x={0} y={0} dy={14 + i * 12} textAnchor="middle"
                                  fill={i === 0 && lines.length > 1 ? '#374151' : '#9ca3af'}
                                  fontSize={i === 0 && lines.length > 1 ? 11 : 10}
                                  fontWeight={i === 0 && lines.length > 1 ? 600 : 400}>
                                  {line}
                                </text>
                              ))}
                            </g>
                          )
                        }}
                        interval={chartData.length > 24 ? 2 : 1}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                        width={44}
                      />
                      <Tooltip
                        labelFormatter={(_, payload) => {
                          if (!payload?.length) return ''
                          return payload[0]?.payload?.ym?.replace('/', '/') ?? ''
                        }}
                        formatter={(val, _name, props) =>
                          val != null
                            ? [`$${val.toLocaleString()}　(${props.payload.count} 筆)`, '月均價']
                            : ['無資料', '月均價']
                        }
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avg"
                        stroke="#0071e3"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#0071e3' }}
                        connectNulls={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-400 mt-1 text-right">月份資料不足 3 筆時僅供參考</p>
                </>
              )}
            </div>

            {/* 流量分析 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">網站流量分析</p>
                <p className="text-xs text-gray-400 mt-0.5">資料來源：Google Analytics 4</p>
              </div>
              <iframe
                src="https://datastudio.google.com/embed/reporting/ca1def25-014a-45c1-a67a-3d51065fdebf/page/XKcvF"
                width="100%"
                height="500"
                frameBorder="0"
                allowFullScreen
                className="block"
              />
            </div>

            {/* 最新明細 + 刪除 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 gap-3">
                <p className="text-sm font-semibold text-gray-700 shrink-0">所有回報明細（可刪除可疑資料）</p>
                <input
                  value={tableSearch}
                  onChange={e => setTableSearch(e.target.value)}
                  placeholder="搜尋型號…"
                  className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 w-40"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2">時間</th>
                      <th className="text-left pb-2">型號</th>
                      <th className="text-left pb-2">容量</th>
                      <th className="text-left pb-2">成色</th>
                      <th className="text-right pb-2">價格</th>
                      <th className="text-left pb-2">來源</th>
                      <th className="text-center pb-2">刪除</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(r => {
                      const anomaly = isAnomaly(r)
                      return (
                        <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 ${anomaly ? 'bg-red-50' : ''}`}>
                          <td className="py-2 text-gray-400">
                            {new Date(r.created_at).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2 text-gray-700 max-w-[120px] truncate">{r.model}</td>
                          <td className="py-2 text-gray-500">{r.storage}</td>
                          <td className="py-2 text-gray-500">{r.condition}</td>
                          <td className="py-2 text-right font-medium">
                            <span className={anomaly ? 'text-red-500' : 'text-blue-600'}>
                              ${r.price?.toLocaleString()}
                            </span>
                            {anomaly && <span className="ml-1 text-red-400" title="價格離均價超過 30%">⚠️</span>}
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full ${r.source === 'report' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                              {r.source === 'report' ? '成交回報' : '貼文'}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            <button onClick={() => deleteRow(r.id)} disabled={deleting === r.id}
                              className="text-red-400 hover:text-red-600 disabled:opacity-30 px-2 py-1 rounded hover:bg-red-50 transition">
                              {deleting === r.id ? '...' : '刪除'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredData.length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-gray-400">找不到相關資料</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 用戶錯誤回報 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">用戶回報問題</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {reports.filter(r => !r.resolved).length} 筆未處理・共 {reports.length} 筆
                  </p>
                </div>
                <button onClick={fetchReports} className="text-xs text-blue-500 hover:underline">重新整理</button>
              </div>
              {reportsLoading ? (
                <p className="text-xs text-gray-400 py-6 text-center">載入中…</p>
              ) : reports.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">目前沒有回報</p>
              ) : (
                <div className="space-y-2">
                  {reports.map(r => (
                    <div key={r.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${r.resolved ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-orange-50 border-orange-100'}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.resolved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {r.resolved ? '已處理' : '未處理'}
                          </span>
                          <span className="text-[12px] font-medium text-gray-700">{r.issue_type}</span>
                          {r.product && <span className="text-[11px] text-gray-400">{r.product}</span>}
                          <span className="text-[11px] text-gray-300 ml-auto">
                            {new Date(r.created_at).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {r.description && (
                          <p className="text-[12px] text-gray-600 mt-1.5 leading-relaxed">{r.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => toggleResolved(r.id, r.resolved)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${r.resolved ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                          {r.resolved ? '取消' : '標記處理'}
                        </button>
                        <button onClick={() => removeReport(r.id)}
                          className="text-[11px] px-2.5 py-1 rounded-lg text-red-400 hover:bg-red-50 transition-all">
                          刪除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  )
}
