import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
  }, [authed])

  async function fetchData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setData(data || [])
    setLoading(false)
  }

  async function deleteRow(id) {
    if (!window.confirm('確定刪除這筆資料？')) return
    setDeleting(id)
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) setData(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
  }

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

            {/* 近 7 天趨勢 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
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

            {/* 最新明細 + 刪除 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-4">所有回報明細（可刪除可疑資料）</p>
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
                    {data.map(r => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 text-gray-400">
                          {new Date(r.created_at).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2 text-gray-700 max-w-[120px] truncate">{r.model}</td>
                        <td className="py-2 text-gray-500">{r.storage}</td>
                        <td className="py-2 text-gray-500">{r.condition}</td>
                        <td className="py-2 text-right font-medium text-blue-600">${r.price?.toLocaleString()}</td>
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
                    ))}
                    {data.length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-gray-400">尚無資料</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 流量分析 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
          </>
        )}
      </div>
    </div>
  )
}
