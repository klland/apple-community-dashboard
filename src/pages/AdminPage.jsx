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

export default function AdminPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // 驗證 URL token
  useEffect(() => {
    const params = new URLSearchParams(location.search)
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

  // 各型號排行
  const modelCount = {}
  for (const r of data) {
    modelCount[r.model] = (modelCount[r.model] || 0) + 1
  }
  const topModels = Object.entries(modelCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // 每小時分布
  const hourCount = Array(24).fill(0)
  for (const r of data) {
    const h = new Date(r.created_at).getHours()
    hourCount[h]++
  }
  const maxHour = Math.max(...hourCount) || 1

  // 最近 7 天每日
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
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理員後台</h1>
          <p className="text-xs text-gray-400 mt-1">蘋果二手行情網站數據總覽</p>
        </div>
        <button onClick={fetchData}
          className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50">
          重新整理
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-20">載入中...</p>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

          {/* 使用時段分布 */}
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

          {/* 熱門型號 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-4">熱門型號 Top 10</p>
            <div className="space-y-2">
              {topModels.map(([model, count]) => (
                <div key={model} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-48 truncate">{model}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-gray-900 h-2 rounded-full"
                      style={{ width: `${(count / (topModels[0]?.[1] || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                </div>
              ))}
              {topModels.length === 0 && <p className="text-sm text-gray-400">尚無資料</p>}
            </div>
          </div>

          {/* 最新 20 筆明細 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-4">最新 20 筆回報</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-2">時間</th>
                    <th className="text-left pb-2">型號</th>
                    <th className="text-left pb-2">容量</th>
                    <th className="text-right pb-2">價格</th>
                    <th className="text-left pb-2">來源</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 20).map(r => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-gray-400">
                        {new Date(r.created_at).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 text-gray-700">{r.model}</td>
                      <td className="py-2 text-gray-500">{r.storage}</td>
                      <td className="py-2 text-right font-medium text-blue-600">${r.price?.toLocaleString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${r.source === 'report' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                          {r.source === 'report' ? '成交回報' : '貼文產生器'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">尚無資料</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
