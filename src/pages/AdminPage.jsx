import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { supabase, getPopularSearches, getReports, getSearchAnalytics, updateReportStatus, deleteReport } from '../lib/supabase'
import { APPLE_PRODUCTS } from '../data/mockData'
import marketAdjustments from '../data/marketAdjustments.json'

const ADMIN_KEY = 'klland'
const PRICE_ANOMALY_THRESHOLD = 0.3
const DATA_QUALITY_MIN_SAMPLE = 3
const DELETED_TRANSACTION_IDS_KEY = 'admin_deleted_transaction_ids'
const BLOCKED_TRANSACTION_IDS = new Set([
  'c89af0d6-6d7e-4d46-85bf-3dd5b9e58e15',
])
const BLOCKED_TRANSACTION_FINGERPRINTS = new Set([
  'iPhone 13|128G|6|post|2026-06-02T14:01:50.4376+00:00',
])
const DATE_RANGE_OPTIONS = [
  { value: '30', label: '30 天' },
  { value: '90', label: '90 天' },
  { value: 'all', label: '全部' },
]

function readDeletedTransactionIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DELETED_TRANSACTION_IDS_KEY) || '[]').map(String))
  } catch {
    return new Set()
  }
}

function rememberDeletedTransactionId(id) {
  const ids = readDeletedTransactionIds()
  ids.add(String(id))
  localStorage.setItem(DELETED_TRANSACTION_IDS_KEY, JSON.stringify([...ids]))
}

function transactionFingerprint(row) {
  return `${row.model || ''}|${row.storage || ''}|${row.price ?? ''}|${row.source || ''}|${row.created_at || ''}`
}

function isDeletedTransaction(row, deletedIds) {
  const id = String(row.id)
  return deletedIds.has(id)
    || BLOCKED_TRANSACTION_IDS.has(id)
    || BLOCKED_TRANSACTION_FINGERPRINTS.has(transactionFingerprint(row))
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return `NT$${Math.round(Number(value)).toLocaleString('zh-TW')}`
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function dateKey(value) {
  if (!value) return ''
  return new Date(value).toISOString().split('T')[0]
}

function average(values) {
  if (!values.length) return null
  return Math.round(values.reduce((sum, value) => sum + Number(value), 0) / values.length)
}

function withinDays(value, days) {
  if (!value || days === 'all') return true
  const since = new Date()
  since.setDate(since.getDate() - Number(days))
  return new Date(value) >= since
}

function getProductCategory(model) {
  return APPLE_PRODUCTS.find(product => product.name === model)?.category || '未分類'
}

function Card({ children, className = '' }) {
  return (
    <section className={`rounded-lg border border-[#e5e5ea] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}>
      {children}
    </section>
  )
}

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#f2f2f7] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && <Icon size={17} className="shrink-0 text-[#0071e3]" aria-hidden="true" />}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#1d1d1f]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-[#6e6e73]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div role="status" className="flex min-h-[180px] flex-col items-center justify-center px-4 py-10 text-center">
      <Database size={24} className="mb-3 text-[#86868b]" aria-hidden="true" />
      <p className="text-sm font-medium text-[#1d1d1f]">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs leading-5 text-[#6e6e73]">{description}</p>}
    </div>
  )
}

function KpiCard({ title, value, sub, tone = 'neutral', icon: Icon }) {
  const toneClass = {
    neutral: 'text-[#1d1d1f] bg-[#f5f5f7]',
    blue: 'text-[#0071e3] bg-[#eef6ff]',
    green: 'text-[#248a3d] bg-[#effaf2]',
    red: 'text-[#d70015] bg-[#fff1f0]',
    orange: 'text-[#b86e00] bg-[#fff7e6]',
  }[tone]

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#6e6e73]">{title}</p>
          <p className="mt-2 text-2xl font-semibold leading-none text-[#1d1d1f]">{value}</p>
        </div>
        {Icon && (
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${toneClass}`}>
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
      </div>
      {sub && <p className="mt-3 text-xs leading-5 text-[#86868b]">{sub}</p>}
    </Card>
  )
}

function BarRow({ label, count, max, color = 'bg-[#0071e3]' }) {
  const width = max ? Math.max(3, Math.round((count / max) * 100)) : 0
  return (
    <div className="grid grid-cols-[minmax(92px,1fr)_2fr_44px] items-center gap-3">
      <span className="truncate text-xs text-[#424245]">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-[#f2f2f7]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-right text-xs tabular-nums text-[#6e6e73]">{count}</span>
    </div>
  )
}

function Pill({ children, tone = 'neutral' }) {
  const toneClass = {
    neutral: 'border-[#e5e5ea] bg-[#f5f5f7] text-[#424245]',
    blue: 'border-[#d6eaff] bg-[#eef6ff] text-[#0066cc]',
    green: 'border-[#d7f0dd] bg-[#effaf2] text-[#248a3d]',
    red: 'border-[#ffd6d2] bg-[#fff1f0] text-[#d70015]',
    orange: 'border-[#ffe1a8] bg-[#fff7e6] text-[#b86e00]',
  }[tone]
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${toneClass}`}>
      {children}
    </span>
  )
}

function Field({ label, children }) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-[11px] font-medium text-[#6e6e73]">{label}</span>
      {children}
    </label>
  )
}

function inputClass(extra = '') {
  return `h-9 w-full rounded-md border border-[#d2d2d7] bg-white px-3 text-xs text-[#1d1d1f] outline-none transition focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/15 ${extra}`
}

function AdminTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  return (
    <div className="rounded-lg border border-[#e5e5ea] bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-[#1d1d1f]">{row?.fullLabel || label}</p>
      <p className="mt-1 text-[#0071e3]">均價：{formatMoney(row?.avg)}</p>
      <p className="text-[#6e6e73]">筆數：{row?.count ?? 0}</p>
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
  const [chartModel, setChartModel] = useState('')
  const [chartRange, setChartRange] = useState('90')
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [popularSearches, setPopularSearches] = useState([])
  const [popularSearchesLoading, setPopularSearchesLoading] = useState(false)
  const [searchAnalytics, setSearchAnalytics] = useState(null)
  const [searchAnalyticsLoading, setSearchAnalyticsLoading] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState('overview')
  const [filters, setFilters] = useState({
    search: '',
    storage: '',
    source: '',
    minPrice: '',
    maxPrice: '',
    fromDate: '',
    toDate: '',
  })

  async function fetchReports() {
    setReportsLoading(true)
    const r = await getReports().catch(() => [])
    setReports(r)
    setReportsLoading(false)
  }

  async function fetchPopularSearches() {
    setPopularSearchesLoading(true)
    const rows = await getPopularSearches().catch(() => [])
    setPopularSearches(rows)
    setPopularSearchesLoading(false)
  }

  async function fetchSearchAnalytics() {
    setSearchAnalyticsLoading(true)
    const analytics = await getSearchAnalytics().catch(() => null)
    setSearchAnalytics(analytics)
    setSearchAnalyticsLoading(false)
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
    const deletedIds = readDeletedTransactionIds()
    setData(all.filter(row => !isDeletedTransaction(row, deletedIds)))
    setLoading(false)
  }

  useEffect(() => {
    const search = location.search
      || (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '')
    const params = new URLSearchParams(search)
    if (params.get('key') === ADMIN_KEY) {
      const id = setTimeout(() => setAuthed(true), 0)
      return () => clearTimeout(id)
    }
    navigate('/', { replace: true })
  }, [location.search, navigate])

  useEffect(() => {
    if (!authed) return
    const id = setTimeout(() => {
      fetchData()
      fetchReports()
      fetchPopularSearches()
      fetchSearchAnalytics()
    }, 0)
    return () => clearTimeout(id)
  }, [authed])

  async function deleteRow(id) {
    if (!window.confirm('確定刪除這筆資料？')) return
    setDeleting(id)
    const { data: deletedRows, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .select('id')
    rememberDeletedTransactionId(id)
    setData(prev => prev.filter(r => r.id !== id))
    if (error) {
      window.alert(`資料庫刪除失敗，已先從後台隱藏這筆資料：${error.message}`)
    } else if (!deletedRows?.length) {
      window.alert('資料庫沒有回傳已刪除資料，已先從後台隱藏這筆資料。若其他裝置仍看得到，請檢查 Supabase delete 權限。')
    }
    setDeleting(null)
  }

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

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
      .map(([model, count]) => ({ model, count, since: earliest[model]?.slice(0, 7) }))
  }, [data])

  const activeChartModel = chartModel || modelOptions[0]?.model || ''

  const storageOptions = useMemo(() => {
    return [...new Set(data.map(r => r.storage).filter(Boolean))].sort()
  }, [data])

  const modelStorageAvg = useMemo(() => {
    const groups = {}
    for (const r of data) {
      if (!r.model || !r.price) continue
      const key = `${r.model}__${r.storage || ''}`
      if (!groups[key]) groups[key] = []
      groups[key].push(Number(r.price))
    }
    return Object.fromEntries(Object.entries(groups).map(([key, prices]) => [key, average(prices)]))
  }, [data])

  const enrichedData = useMemo(() => {
    return data.map(row => {
      const key = `${row.model}__${row.storage || ''}`
      const avg = modelStorageAvg[key]
      const anomaly = Boolean(row.model && row.price && avg && Math.abs(Number(row.price) - avg) / avg > PRICE_ANOMALY_THRESHOLD)
      return { ...row, category: getProductCategory(row.model), anomaly }
    })
  }, [data, modelStorageAvg])

  const filteredData = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    const min = filters.minPrice ? Number(filters.minPrice) : null
    const max = filters.maxPrice ? Number(filters.maxPrice) : null
    return enrichedData.filter(r => {
      if (q && !`${r.model || ''} ${r.storage || ''} ${r.source || ''}`.toLowerCase().includes(q)) return false
      if (filters.storage && r.storage !== filters.storage) return false
      if (filters.source && r.source !== filters.source) return false
      if (min !== null && Number(r.price) < min) return false
      if (max !== null && Number(r.price) > max) return false
      if (filters.fromDate && dateKey(r.created_at) < filters.fromDate) return false
      if (filters.toDate && dateKey(r.created_at) > filters.toDate) return false
      return true
    })
  }, [enrichedData, filters])

  const stats = useMemo(() => {
    const now = new Date()
    const todayKey = now.toISOString().split('T')[0]
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prices = data.map(r => Number(r.price)).filter(Boolean)
    const anomalies = enrichedData.filter(r => r.anomaly).length
    const pendingReports = reports.filter(r => !r.resolved).length
    return {
      total: data.length,
      today: data.filter(r => r.created_at?.startsWith(todayKey)).length,
      week: data.filter(r => new Date(r.created_at) >= weekStart).length,
      month: data.filter(r => new Date(r.created_at) >= monthStart).length,
      avgPrice: average(prices),
      anomalies,
      pendingReports,
      latest: data[0]?.created_at || null,
    }
  }, [data, enrichedData, reports])

  const chartData = useMemo(() => {
    if (!activeChartModel) return []
    const modelRows = data
      .filter(r => r.model === activeChartModel && r.price && r.created_at && withinDays(r.created_at, chartRange))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    if (modelRows.length === 0) return []

    const bucketByDay = chartRange !== 'all'
    const buckets = {}
    for (const r of modelRows) {
      const d = new Date(r.created_at)
      const key = bucketByDay
        ? d.toISOString().split('T')[0]
        : `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!buckets[key]) buckets[key] = []
      buckets[key].push(Number(r.price))
    }

    return Object.entries(buckets).map(([key, prices]) => {
      const label = bucketByDay ? key.slice(5) : key
      return {
        key,
        label,
        fullLabel: bucketByDay ? key : `${key} 月`,
        avg: average(prices),
        count: prices.length,
      }
    })
  }, [activeChartModel, chartRange, data])

  const volumeData = useMemo(() => {
    const buckets = {}
    for (const r of data.filter(row => withinDays(row.created_at, chartRange))) {
      const key = dateKey(r.created_at)
      if (!key) continue
      buckets[key] = (buckets[key] || 0) + 1
    }
    return Object.entries(buckets)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(chartRange === 'all' ? -90 : undefined)
      .map(([key, count]) => ({ key, label: key.slice(5), count }))
  }, [data, chartRange])

  const distributions = useMemo(() => {
    const countBy = (getter, limit = 8) => {
      const counts = {}
      for (const r of data) {
        const key = getter(r)
        if (!key) continue
        counts[key] = (counts[key] || 0) + 1
      }
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit)
      const max = Math.max(...entries.map(([, count]) => count), 1)
      return { entries, max }
    }
    return {
      source: countBy(r => r.source === 'report' ? '成交回報' : r.source === 'post' ? '貼文產生器' : r.source || '未標記', 4),
      condition: countBy(r => r.condition, 6),
      location: countBy(r => r.location?.split(' ')[0], 6),
    }
  }, [data])

  const dataHealth = useMemo(() => {
    const groups = {}
    for (const r of data) {
      if (!r.model || !r.storage) continue
      const key = `${r.model} ${r.storage}`
      if (!groups[key]) groups[key] = { model: r.model, storage: r.storage, count: 0 }
      groups[key].count += 1
    }
    const lowSample = Object.values(groups)
      .filter(item => item.count > 0 && item.count < DATA_QUALITY_MIN_SAMPLE)
      .sort((a, b) => a.count - b.count)
      .slice(0, 6)
    const anomalyCount = enrichedData.filter(row => row.anomaly).length
    const anomalyRate = data.length ? Math.round((anomalyCount / data.length) * 100) : 0
    const adjustmentMeta = marketAdjustments?.meta || {}
    const realWeightStatus = adjustmentMeta.lastUpdated
      ? `月更覆蓋：${adjustmentMeta.lastUpdated}`
      : '尚未匯入真實加權檔'
    return { lowSample, anomalyRate, realWeightStatus }
  }, [data, enrichedData])

  const searchInsights = useMemo(() => {
    const queries = popularSearches.filter(item => item.kind === 'query').slice(0, 8)
    const products = popularSearches.filter(item => item.kind === 'product').slice(0, 8)
    const totalEvents = popularSearches.reduce((sum, item) => sum + Number(item.event_count || 0), 0)
    return {
      queries,
      products,
      totalEvents,
      maxQuery: Math.max(...queries.map(item => Number(item.event_count)), 1),
      maxProduct: Math.max(...products.map(item => Number(item.event_count)), 1),
    }
  }, [popularSearches])

  const demandAnalytics = useMemo(() => {
    const toRows = value => Array.isArray(value) ? value : []
    const dailyRows = toRows(searchAnalytics?.daily)
    const dailyByDate = new Map(dailyRows.map(row => [String(row.date), row]))
    const trend = Array.from({ length: 30 }, (_, index) => {
      const day = new Date()
      day.setDate(day.getDate() - (29 - index))
      const key = day.toISOString().slice(0, 10)
      const row = dailyByDate.get(key)
      return {
        key,
        label: key.slice(5),
        events: Number(row?.event_count || 0),
        visitors: Number(row?.visitor_count || 0),
      }
    })
    const conversion = searchAnalytics?.conversion || {}
    const searchVisitors = Number(conversion.search_visitors || 0)
    const convertedVisitors = Number(conversion.converted_visitors || 0)
    const productVisitors = Number(conversion.product_visitors || 0)
    const currentWeekEvents = trend.slice(-7).reduce((sum, row) => sum + row.events, 0)
    const previousWeekEvents = trend.slice(-14, -7).reduce((sum, row) => sum + row.events, 0)
    return {
      trend,
      zeroResults: toRows(searchAnalytics?.zero_results).slice(0, 8),
      storage: toRows(searchAnalytics?.storage).slice(0, 8),
      categories: toRows(searchAnalytics?.categories).slice(0, 8),
      trending: toRows(searchAnalytics?.trending).slice(0, 8),
      searchVisitors,
      convertedVisitors,
      productVisitors,
      conversionRate: searchVisitors ? Math.round((convertedVisitors / searchVisitors) * 100) : 0,
      currentWeekEvents,
      previousWeekEvents,
      weeklyGrowth: previousWeekEvents ? Math.round(((currentWeekEvents - previousWeekEvents) / previousWeekEvents) * 100) : null,
      maxZero: Math.max(...toRows(searchAnalytics?.zero_results).map(row => Number(row.event_count)), 1),
      maxStorage: Math.max(...toRows(searchAnalytics?.storage).map(row => Number(row.event_count)), 1),
      maxCategory: Math.max(...toRows(searchAnalytics?.categories).map(row => Number(row.event_count)), 1),
      maxTrending: Math.max(...toRows(searchAnalytics?.trending).map(row => Number(row.current_count)), 1),
    }
  }, [searchAnalytics])

  if (!authed) return null

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[#6e6e73]">Apple 二手行情資料營運</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#1d1d1f]">管理員後台</h1>
            <p className="mt-1 text-xs text-[#86868b]">最後資料時間：{stats.latest ? formatDateTime(stats.latest) : '尚無資料'}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              fetchData()
              fetchReports()
              fetchPopularSearches()
              fetchSearchAnalytics()
            }}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d2d2d7] bg-white px-3 text-xs font-medium text-[#1d1d1f] transition hover:bg-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/25"
          >
            <RefreshCw size={14} aria-hidden="true" />
            重新整理
          </button>
        </header>

        <nav className="mb-5 flex gap-1 overflow-x-auto rounded-lg border border-[#e5e5ea] bg-white p-1" aria-label="後台工作區">
          {[
            { id: 'overview', label: '總覽' },
            { id: 'demand', label: '需求洞察' },
            { id: 'operations', label: '資料與回報' },
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveWorkspace(item.id)}
              className={`h-9 shrink-0 rounded-md px-4 text-xs font-semibold transition ${
                activeWorkspace === item.id
                  ? 'bg-[#1d1d1f] text-white'
                  : 'text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {loading ? (
          <Card className="p-10">
            <div role="status" className="flex items-center justify-center gap-3 text-sm text-[#6e6e73]">
              <RefreshCw size={17} className="animate-spin" aria-hidden="true" />
              載入後台資料中
            </div>
          </Card>
        ) : (
          <div className="space-y-5">
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard title="總成交筆數" value={stats.total.toLocaleString('zh-TW')} sub="自開站累計" icon={Database} tone="blue" />
              <KpiCard title="近 7 天" value={stats.week.toLocaleString('zh-TW')} sub="近期活躍度" icon={Activity} tone="green" />
              <KpiCard title="熱門互動" value={searchInsights.totalEvents.toLocaleString('zh-TW')} sub="近 30 天匿名去重事件" icon={Search} tone="blue" />
              <KpiCard title="待處理回報" value={stats.pendingReports.toLocaleString('zh-TW')} sub="使用者問題回報" icon={ShieldCheck} tone={stats.pendingReports ? 'red' : 'green'} />
            </section>

            {(activeWorkspace === 'overview' || activeWorkspace === 'demand') && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
            <Card>
              <SectionHeader icon={Search} title="熱門搜尋" subtitle="近 30 天匿名去重統計，同一裝置同日的相同操作只計一次" />
              {popularSearchesLoading ? (
                <div className="flex min-h-[150px] items-center justify-center gap-2 text-xs text-[#6e6e73]">
                  <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
                  載入搜尋趨勢中
                </div>
              ) : searchInsights.totalEvents === 0 ? (
                <EmptyState title="尚無搜尋資料" description="套用資料庫 migration 後，使用者搜尋與產品點擊會從這裡開始累積。" />
              ) : (
                <div className="grid grid-cols-1 divide-y divide-[#f2f2f7] md:grid-cols-2 md:divide-x md:divide-y-0">
                  <div className="space-y-3 p-4">
                    <p className="text-xs font-semibold text-[#1d1d1f]">熱門搜尋字詞</p>
                    {searchInsights.queries.length === 0 ? (
                      <p className="text-xs text-[#86868b]">尚無足夠的關鍵字搜尋。</p>
                    ) : searchInsights.queries.map(item => (
                      <BarRow
                        key={`query-${item.label}`}
                        label={`${item.label}・${item.visitor_count} 位訪客`}
                        count={Number(item.event_count)}
                        max={searchInsights.maxQuery}
                        color="bg-[#0071e3]"
                      />
                    ))}
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="text-xs font-semibold text-[#1d1d1f]">熱門產品與規格</p>
                    {searchInsights.products.length === 0 ? (
                      <p className="text-xs text-[#86868b]">尚無足夠的產品點擊資料。</p>
                    ) : searchInsights.products.map(item => (
                      <BarRow
                        key={`product-${item.label}`}
                        label={`${item.label}・${item.visitor_count} 位訪客`}
                        count={Number(item.event_count)}
                        max={searchInsights.maxProduct}
                        color="bg-[#34c759]"
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <SectionHeader icon={Activity} title="搜尋需求分析" subtitle="以匿名搜尋、產品點擊與容量選擇判讀需求，不蒐集帳號或個人資料" />
              {searchAnalyticsLoading ? (
                <div className="flex min-h-[220px] items-center justify-center gap-2 text-xs text-[#6e6e73]">
                  <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
                  載入需求分析中
                </div>
              ) : demandAnalytics.searchVisitors === 0 && demandAnalytics.productVisitors === 0 ? (
                <EmptyState title="尚無足夠的需求資料" description="搜尋、點擊產品與選擇容量後，這裡會顯示需求趨勢與轉換。" />
              ) : (
                <div className="grid grid-cols-1 divide-y divide-[#f2f2f7] lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)] lg:divide-x lg:divide-y-0">
                  <div className="p-4">
                    <p className="mb-3 text-xs font-semibold text-[#1d1d1f]">近 30 天搜尋趨勢</p>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={demandAnalytics.trend} margin={{ top: 10, right: 14, left: -16, bottom: 0 }} accessibilityLayer>
                          <CartesianGrid stroke="#f2f2f7" vertical={false} />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#86868b' }} interval="preserveStartEnd" />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#86868b' }} />
                          <Tooltip
                            cursor={{ stroke: '#d2d2d7', strokeDasharray: '3 3' }}
                            contentStyle={{ borderRadius: 8, borderColor: '#e5e5ea', fontSize: 12 }}
                            formatter={(value, name) => [`${value} 筆`, name === 'events' ? '搜尋互動' : '訪客']}
                          />
                          <Line type="monotone" dataKey="events" name="events" stroke="#0071e3" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-[#f2f2f7]">
                    <div className="bg-white p-4">
                      <p className="text-xs text-[#6e6e73]">搜尋訪客</p>
                      <p className="mt-1 text-2xl font-semibold text-[#1d1d1f]">{demandAnalytics.searchVisitors}</p>
                      <p className="mt-2 text-xs text-[#86868b]">近 30 天去重</p>
                    </div>
                    <div className="bg-white p-4">
                      <p className="text-xs text-[#6e6e73]">搜尋後點擊</p>
                      <p className="mt-1 text-2xl font-semibold text-[#0071e3]">{demandAnalytics.conversionRate}%</p>
                      <p className="mt-2 text-xs text-[#86868b]">同日搜尋到產品</p>
                    </div>
                    <div className="col-span-2 bg-white p-4">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-[#6e6e73]">近 7 天搜尋趨勢</p>
                          <p className="mt-1 text-xl font-semibold text-[#1d1d1f]">{demandAnalytics.currentWeekEvents} 筆</p>
                        </div>
                        <p className={`text-xs font-medium ${demandAnalytics.weeklyGrowth === null || demandAnalytics.weeklyGrowth >= 0 ? 'text-[#248a3d]' : 'text-[#d70015]'}`}>
                          {demandAnalytics.weeklyGrowth === null
                            ? '前 7 天無樣本'
                            : `較前 7 天 ${demandAnalytics.weeklyGrowth >= 0 ? '+' : ''}${demandAnalytics.weeklyGrowth}%`}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 bg-white p-4">
                      <p className="text-xs font-semibold text-[#1d1d1f]">零結果關鍵字</p>
                      {demandAnalytics.zeroResults.length === 0 ? (
                        <p className="mt-2 text-xs text-[#86868b]">目前沒有零結果搜尋。</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {demandAnalytics.zeroResults.slice(0, 3).map(item => (
                            <BarRow
                              key={`zero-${item.label}`}
                              label={`${item.label}・${item.visitor_count} 位訪客`}
                              count={Number(item.event_count)}
                              max={demandAnalytics.maxZero}
                              color="bg-[#ff9500]"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>

              </div>
            )}

            {activeWorkspace === 'demand' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card>
                <SectionHeader icon={Database} title="容量偏好" subtitle="使用者點進產品後主動選擇的容量" />
                <div className="space-y-3 p-4">
                  {demandAnalytics.storage.length === 0 ? (
                    <p className="text-xs text-[#86868b]">尚無容量選擇資料。</p>
                  ) : demandAnalytics.storage.map(item => (
                    <BarRow
                      key={`storage-${item.label}`}
                      label={`${item.label}・${item.visitor_count} 位訪客`}
                      count={Number(item.event_count)}
                      max={demandAnalytics.maxStorage}
                      color="bg-[#34c759]"
                    />
                  ))}
                </div>
              </Card>
              <Card>
                <SectionHeader icon={BarChart3} title="分類熱度" subtitle="以產品點擊次數計算" />
                <div className="space-y-3 p-4">
                  {demandAnalytics.categories.length === 0 ? (
                    <p className="text-xs text-[#86868b]">尚無分類點擊資料。</p>
                  ) : demandAnalytics.categories.map(item => (
                    <BarRow
                      key={`category-${item.label}`}
                      label={`${item.label}・${item.visitor_count} 位訪客`}
                      count={Number(item.event_count)}
                      max={demandAnalytics.maxCategory}
                      color="bg-[#0071e3]"
                    />
                  ))}
                </div>
              </Card>
              <Card>
                <SectionHeader icon={Activity} title="近期升溫產品" subtitle="最近 7 天與前 7 天的產品點擊比較" />
                <div className="space-y-3 p-4">
                  {demandAnalytics.trending.length === 0 ? (
                    <p className="text-xs text-[#86868b]">尚無足夠的近期產品點擊資料。</p>
                  ) : demandAnalytics.trending.map(item => {
                    const current = Number(item.current_count)
                    const previous = Number(item.previous_count)
                    const growth = previous ? `+${Math.round(((current - previous) / previous) * 100)}%` : '新出現'
                    return (
                      <BarRow
                        key={`trending-${item.label}`}
                        label={`${item.label}・${growth}`}
                        count={current}
                        max={demandAnalytics.maxTrending}
                        color="bg-[#ff9500]"
                      />
                    )
                  })}
                </div>
              </Card>
              <Card>
                <SectionHeader icon={Search} title="需要補齊的型號" subtitle="零結果搜尋，可用來安排產品資料優先順序" />
                <div className="space-y-3 p-4">
                  {demandAnalytics.zeroResults.length === 0 ? (
                    <p className="text-xs text-[#86868b]">目前沒有需要補齊的搜尋字詞。</p>
                  ) : demandAnalytics.zeroResults.map(item => (
                    <BarRow
                      key={`missing-${item.label}`}
                      label={`${item.label}・${item.visitor_count} 位訪客`}
                      count={Number(item.event_count)}
                      max={demandAnalytics.maxZero}
                      color="bg-[#ff9500]"
                    />
                  ))}
                </div>
              </Card>
            </div>
            )}

            {activeWorkspace === 'operations' && (
              <>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
              <Card>
                <SectionHeader
                  icon={BarChart3}
                  title="成交均價趨勢"
                  subtitle="依型號追蹤均價與資料量，金額皆為 TWD 整數"
                  action={
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={activeChartModel}
                        onChange={e => setChartModel(e.target.value)}
                        className={inputClass('w-[220px]')}
                        aria-label="選擇趨勢型號"
                      >
                        <option value="">選擇型號</option>
                        {modelOptions.map(({ model, count, since }) => (
                          <option key={model} value={model}>{model}・{count} 筆・{since}</option>
                        ))}
                      </select>
                      <div className="flex rounded-md border border-[#d2d2d7] bg-white p-0.5" role="group" aria-label="趨勢時間範圍">
                        {DATE_RANGE_OPTIONS.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setChartRange(option.value)}
                            className={`h-8 rounded px-3 text-xs font-medium transition ${
                              chartRange === option.value
                                ? 'bg-[#1d1d1f] text-white'
                                : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  }
                />
                {chartData.length === 0 ? (
                  <EmptyState title="尚無可繪製的趨勢資料" description="選擇有成交紀錄的型號，或切換到更長的時間範圍。" />
                ) : (
                  <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 8 }} accessibilityLayer>
                          <CartesianGrid stroke="#f2f2f7" vertical={false} />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#86868b' }} interval="preserveStartEnd" />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#86868b' }}
                            tickFormatter={value => `${Math.round(value / 1000)}k`}
                            width={42}
                          />
                          <Tooltip content={<AdminTooltip />} />
                          <Line type="monotone" dataKey="avg" stroke="#0071e3" strokeWidth={2.4} dot={{ r: 3, fill: '#0071e3' }} activeDot={{ r: 5 }} connectNulls={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-[300px]">
                      {volumeData.length === 0 ? (
                        <EmptyState title="尚無提交量" description="目前時間範圍沒有可統計資料。" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={volumeData} margin={{ top: 10, right: 12, left: 0, bottom: 8 }} accessibilityLayer>
                            <CartesianGrid stroke="#f2f2f7" vertical={false} />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#86868b' }} interval="preserveStartEnd" />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#86868b' }} width={28} />
                            <Tooltip cursor={{ fill: '#f5f5f7' }} contentStyle={{ borderRadius: 8, borderColor: '#e5e5ea', fontSize: 12 }} formatter={value => [`${value} 筆`, '提交量']} />
                            <Bar dataKey="count" fill="#34c759" radius={[4, 4, 0, 0]} maxBarSize={18} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <SectionHeader icon={ShieldCheck} title="資料健康度" subtitle="用來判讀價格可信度與補資料優先順序" />
                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#e5e5ea] p-3">
                      <p className="text-xs text-[#6e6e73]">異常比例</p>
                      <p className="mt-1 text-xl font-semibold text-[#1d1d1f]">{dataHealth.anomalyRate}%</p>
                    </div>
                    <div className="rounded-lg border border-[#e5e5ea] p-3">
                      <p className="text-xs text-[#6e6e73]">真實資料權重</p>
                      <p className="mt-1 text-xs leading-5 text-[#1d1d1f]">{dataHealth.realWeightStatus}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold text-[#1d1d1f]">樣本不足型號</p>
                    {dataHealth.lowSample.length === 0 ? (
                      <p className="rounded-lg bg-[#effaf2] px-3 py-2 text-xs text-[#248a3d]">目前沒有低於 {DATA_QUALITY_MIN_SAMPLE} 筆的已回報規格。</p>
                    ) : (
                      <div className="space-y-2">
                        {dataHealth.lowSample.map(item => (
                          <div key={`${item.model}-${item.storage}`} className="flex items-center justify-between gap-3 rounded-lg bg-[#f5f5f7] px-3 py-2">
                            <span className="min-w-0 truncate text-xs text-[#424245]">{item.model}・{item.storage}</span>
                            <Pill tone="orange">{item.count} 筆</Pill>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Card>
                <SectionHeader icon={Activity} title="來源分布" />
                <div className="space-y-3 p-4">
                  {distributions.source.entries.map(([label, count]) => (
                    <BarRow key={label} label={label} count={count} max={distributions.source.max} color="bg-[#0071e3]" />
                  ))}
                </div>
              </Card>
              <Card>
                <SectionHeader icon={CheckCircle2} title="成色分布" />
                <div className="space-y-3 p-4">
                  {distributions.condition.entries.length === 0 ? (
                    <p className="text-xs text-[#86868b]">尚無成色資料</p>
                  ) : distributions.condition.entries.map(([label, count]) => (
                    <BarRow key={label} label={label} count={count} max={distributions.condition.max} color="bg-[#34c759]" />
                  ))}
                </div>
              </Card>
              <Card>
                <SectionHeader icon={Database} title="地區分布" />
                <div className="space-y-3 p-4">
                  {distributions.location.entries.length === 0 ? (
                    <p className="text-xs text-[#86868b]">尚無地區資料</p>
                  ) : distributions.location.entries.map(([label, count]) => (
                    <BarRow key={label} label={label} count={count} max={distributions.location.max} color="bg-[#ff9500]" />
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <SectionHeader
                icon={Filter}
                title="成交資料表"
                subtitle={`顯示 ${filteredData.length.toLocaleString('zh-TW')} / ${data.length.toLocaleString('zh-TW')} 筆`}
              />
              <div className="border-b border-[#f2f2f7] p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-7">
                  <Field label="搜尋">
                    <div className="relative">
                      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" aria-hidden="true" />
                      <input value={filters.search} onChange={e => updateFilter('search', e.target.value)} className={inputClass('pl-9')} placeholder="型號、容量、來源" />
                    </div>
                  </Field>
                  <Field label="容量">
                    <select value={filters.storage} onChange={e => updateFilter('storage', e.target.value)} className={inputClass()} aria-label="依容量篩選">
                      <option value="">全部容量</option>
                      {storageOptions.map(storage => <option key={storage} value={storage}>{storage}</option>)}
                    </select>
                  </Field>
                  <Field label="來源">
                    <select value={filters.source} onChange={e => updateFilter('source', e.target.value)} className={inputClass()} aria-label="依來源篩選">
                      <option value="">全部來源</option>
                      <option value="report">成交回報</option>
                      <option value="post">貼文產生器</option>
                    </select>
                  </Field>
                  <Field label="最低價">
                    <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className={inputClass()} placeholder="0" />
                  </Field>
                  <Field label="最高價">
                    <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className={inputClass()} placeholder="99999" />
                  </Field>
                  <Field label="開始日期">
                    <input type="date" value={filters.fromDate} onChange={e => updateFilter('fromDate', e.target.value)} className={inputClass()} />
                  </Field>
                  <Field label="結束日期">
                    <input type="date" value={filters.toDate} onChange={e => updateFilter('toDate', e.target.value)} className={inputClass()} />
                  </Field>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-xs">
                  <thead>
                    <tr className="border-b border-[#e5e5ea] bg-[#fbfbfd] text-left text-[11px] font-semibold text-[#6e6e73]">
                      <th className="px-4 py-3">型號</th>
                      <th className="px-3 py-3">容量</th>
                      <th className="px-3 py-3 text-right">價格</th>
                      <th className="px-3 py-3">來源</th>
                      <th className="px-3 py-3">交易方式</th>
                      <th className="px-3 py-3">地點</th>
                      <th className="px-3 py-3">建立時間</th>
                      <th className="px-3 py-3">異常</th>
                      <th className="px-4 py-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(row => (
                      <tr key={row.id} className="border-b border-[#f2f2f7] transition hover:bg-[#fbfbfd]">
                        <td className="px-4 py-3">
                          <div className="max-w-[220px] truncate font-medium text-[#1d1d1f]">{row.model || '-'}</div>
                          <div className="mt-0.5 text-[11px] text-[#86868b]">{row.category}</div>
                        </td>
                        <td className="px-3 py-3 text-[#424245]">{row.storage || '-'}</td>
                        <td className="px-3 py-3 text-right font-semibold tabular-nums text-[#1d1d1f]">{formatMoney(row.price)}</td>
                        <td className="px-3 py-3">
                          <Pill tone={row.source === 'report' ? 'green' : row.source === 'post' ? 'blue' : 'neutral'}>
                            {row.source === 'report' ? '成交回報' : row.source === 'post' ? '貼文' : row.source || '未標記'}
                          </Pill>
                        </td>
                        <td className="px-3 py-3 text-[#424245]">{row.trade_method || '-'}</td>
                        <td className="px-3 py-3 text-[#424245]">{row.location || '-'}</td>
                        <td className="px-3 py-3 text-[#6e6e73]">{formatDateTime(row.created_at)}</td>
                        <td className="px-3 py-3">
                          {row.anomaly ? (
                            <Pill tone="orange">需檢查</Pill>
                          ) : (
                            <span className="text-[#86868b]">正常</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => deleteRow(row.id)}
                            disabled={deleting === row.id}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#d70015] transition hover:bg-[#fff1f0] disabled:opacity-40"
                            aria-label={`刪除 ${row.model || '成交資料'}`}
                            title="刪除"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={9}>
                          <EmptyState title="找不到符合條件的成交資料" description="調整搜尋字、價格區間或日期範圍後再試一次。" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <SectionHeader
                icon={AlertTriangle}
                title="用戶錯誤回報"
                subtitle={`${reports.filter(r => !r.resolved).length} 筆未處理・共 ${reports.length} 筆`}
                action={
                  <button
                    type="button"
                    onClick={fetchReports}
                    className="inline-flex h-8 items-center gap-2 rounded-md border border-[#d2d2d7] bg-white px-3 text-xs font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  >
                    <RefreshCw size={13} aria-hidden="true" />
                    重新整理
                  </button>
                }
              />
              {reportsLoading ? (
                <div role="status" className="py-10 text-center text-xs text-[#86868b]">載入回報中</div>
              ) : reports.length === 0 ? (
                <EmptyState title="目前沒有回報" description="使用者送出的價格或產品問題會出現在這裡。" />
              ) : (
                <div className="divide-y divide-[#f2f2f7]">
                  {reports.map(report => (
                    <article key={report.id} className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[140px_minmax(0,1fr)_180px] md:items-start">
                      <div className="flex items-center gap-2">
                        {report.resolved ? <CheckCircle2 size={15} className="text-[#248a3d]" aria-hidden="true" /> : <XCircle size={15} className="text-[#ff9500]" aria-hidden="true" />}
                        <Pill tone={report.resolved ? 'green' : 'orange'}>{report.resolved ? '已處理' : '待處理'}</Pill>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[#1d1d1f]">{report.issue_type || '未分類問題'}</span>
                          {report.product && <span className="text-xs text-[#6e6e73]">{report.product}</span>}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[#424245]">{report.description || '使用者未填寫補充說明。'}</p>
                        <p className="mt-1 text-[11px] text-[#86868b]">{formatDateTime(report.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => toggleResolved(report.id, report.resolved)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d2d2d7] bg-white px-3 text-xs font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
                          aria-label={report.resolved ? '標記為未處理' : '標記為已處理'}
                        >
                          <CheckCircle2 size={14} aria-hidden="true" />
                          {report.resolved ? '重開' : '處理'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeReport(report.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#d70015] hover:bg-[#fff1f0]"
                          aria-label="刪除回報"
                          title="刪除回報"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>

              </>
            )}

            {activeWorkspace === 'overview' && (
              <details className="rounded-lg border border-[#e5e5ea] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <summary className="flex h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-semibold text-[#1d1d1f] marker:content-none">
                  <Activity size={17} className="text-[#0071e3]" aria-hidden="true" />
                  網站流量分析
                  <span className="ml-1 text-xs font-normal text-[#86868b]">Google Analytics 4 / Looker Studio</span>
                </summary>
                <iframe
                  src="https://datastudio.google.com/embed/reporting/ca1def25-014a-45c1-a67a-3d51065fdebf/page/XKcvF"
                  width="100%"
                  height="500"
                  frameBorder="0"
                  allowFullScreen
                  className="block border-t border-[#f2f2f7]"
                  title="網站流量分析"
                />
              </details>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
