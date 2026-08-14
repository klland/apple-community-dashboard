import { useState, useMemo, useEffect } from 'react'
import { APPLE_PRODUCTS, CATEGORIES } from '../data/mockData'
import {
  estimateMacSpec,
  getDefaultMacSpec,
  getMacRuleMessages,
  getMacSpecConfig,
  isMacOptionDisabled,
  normalizeMacSpec,
} from '../data/macSpecRules'
import { Smartphone, Laptop, Tablet, Watch, Headphones, Monitor, Grid2x2, Package, TrendingDown, Activity, CircleDollarSign } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getDailyPrices, getMarketPrice, trackSearchEvent } from '../lib/supabase'

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

function isLowLiquidityIphone(product, marketValue) {
  return product?.category === 'iPhone' && marketValue != null && marketValue < 3000
}

function getLowLiquidityRange(value) {
  if (value == null) return null
  const high = Math.max(1000, Math.ceil(value / 500) * 500)
  const low = Math.max(300, Math.floor(high * 0.45 / 100) * 100)
  return { low, high }
}

function formatMarketValue(product, value) {
  if (!isLowLiquidityIphone(product, value)) return formatMoney(value)
  const range = getLowLiquidityRange(value)
  return range ? `$${range.low.toLocaleString()} - $${range.high.toLocaleString()}` : '低流動性'
}

function getOfficialPrice(product, storage) {
  return product?.currentOfficialPrice?.[storage] ?? product?.basePrice?.[storage]
}

function getLaunchPrice(product, storage) {
  return product?.launchPrice?.[storage] ?? product?.basePrice?.[storage]
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

function buildDepreciationTrend(product, storage, currentValue, options = {}) {
  if (!product || !storage) return []
  const launch = options.launchPrice ?? getLaunchPrice(product, storage)
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

function buildReportedPriceTrend(rows) {
  const byDay = new Map()
  for (const row of rows) {
    const day = row.created_at?.slice(0, 10)
    if (!day) continue
    const prices = byDay.get(day) || []
    prices.push(Number(row.price))
    byDay.set(day, prices)
  }

  return [...byDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([day, prices]) => ({
      label: day.slice(5).replace('-', '/'),
      price: Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) / 100) * 100,
    }))
}

function buildStorageBars(product) {
  if (!product) return []
  return product.storages.map(storage => ({
    storage,
    market: product.marketAvg[storage],
    retail: getOfficialPrice(product, storage),
  })).filter(row => row.market && row.retail)
}

function getMarketCeiling(product, storage) {
  return product?.newProductPriceCeiling?.[storage] ?? null
}

function capToMarketCeiling(value, ceiling) {
  if (value == null) return value
  return ceiling ? Math.min(value, ceiling) : value
}

function getPriceBand(product, avgValue, ceiling) {
  if (!avgValue) return null
  const isWatch = product?.category === 'Apple Watch'
  const lowMultiplier = isWatch ? 0.65 : 0.95
  const highMultiplier = isWatch ? 1.15 : 1.08
  return {
    low: Math.round(avgValue * lowMultiplier / 100) * 100,
    target: avgValue,
    high: capToMarketCeiling(Math.round(avgValue * highMultiplier / 100) * 100, ceiling),
    isWatch,
  }
}

function getPrimaryMarketPrice(product) {
  return product?.marketAvg?.[product?.storages?.[0]]
}

function getIphoneGeneration(product) {
  const name = product?.name ?? ''
  const match = name.match(/^iPhone\s+(\d+)/)
  if (match) return Number(match[1])
  if (name.startsWith('iPhone SE')) return 'SE'
  if (/^iPhone\s+(X|XR|XS)/.test(name)) return 'X'
  return null
}

function getIphoneTier(product) {
  const name = product?.name ?? ''
  if (name.startsWith('iPhone SE')) return { key: 'se', name: 'iPhone SE', rank: 0 }
  if (/^iPhone\s+(X|XR|XS)/.test(name)) return { key: 'x', name: 'iPhone X 系列', rank: 1 }
  if (name.includes('Pro Max')) return { key: 'pro-max', name: 'iPhone Pro Max', rank: 4 }
  if (name.includes('Pro')) return { key: 'pro', name: 'iPhone Pro', rank: 3 }
  if (name.includes('Plus') || name.includes('Air')) return { key: 'plus-air', name: 'iPhone Plus / Air', rank: 2 }
  if (/iPhone\s+\d+e/.test(name)) return { key: 'e', name: 'iPhone e', rank: 0 }
  return { key: 'standard', name: 'iPhone 標準版', rank: 1 }
}

function getIphoneGenerationRank(generation) {
  if (typeof generation === 'number') return generation
  if (generation === 'X') return 10
  if (generation === 'SE') return 9
  return 0
}

function getProductVariantGroup(product, options = {}) {
  if (product?.category === 'iPhone' && options.iphoneGrouping) {
    const generation = getIphoneGeneration(product)
    if (!generation) return null

    if (options.iphoneGrouping === 'generation') {
      return {
        key: `iphone-generation-${generation}`,
        name: generation === 'SE' ? 'iPhone SE' : `iPhone ${generation} 世代`,
        kind: 'iphone-generation',
      }
    }

    const tier = getIphoneTier(product)
    return {
      key: `iphone-model-${tier.key}`,
      name: tier.name,
      kind: 'iphone-model',
    }
  }

  if (product?.category === 'MacBook') {
    const macBookProMatch = product.name.match(/^MacBook Pro (13吋|14吋|16吋)/)
    if (macBookProMatch) {
      return {
        key: `macbook-pro-${macBookProMatch[1]}`,
        name: `MacBook Pro ${macBookProMatch[1]}`,
        kind: 'macbook-pro',
      }
    }

    const macBookAirMatch = product.name.match(/^MacBook Air (13吋|15吋)/)
    if (macBookAirMatch) {
      return {
        key: `macbook-air-${macBookAirMatch[1]}`,
        name: `MacBook Air ${macBookAirMatch[1]}`,
        kind: 'macbook-air',
      }
    }

    if (product.name === 'MacBook Air M1') {
      return {
        key: 'macbook-air-13吋',
        name: 'MacBook Air 13吋',
        kind: 'macbook-air',
      }
    }
  }

  if (product?.category === 'iPad') {
    const iPadAirMatch = product.name.match(/^iPad Air (11吋|13吋)/)
    if (iPadAirMatch) {
      return {
        key: `ipad-air-${iPadAirMatch[1]}`,
        name: `iPad Air ${iPadAirMatch[1]}`,
        kind: 'ipad-air',
      }
    }

    if (product.name.startsWith('iPad Air 第')) {
      return {
        key: 'ipad-air-10.9吋',
        name: 'iPad Air 10.9吋',
        kind: 'ipad-air',
      }
    }

    const iPadProMatch = product.name.match(/^iPad Pro (11吋|13吋|12\.9吋)/)
    if (iPadProMatch) {
      const isLarge = iPadProMatch[1] === '13吋' || iPadProMatch[1] === '12.9吋'
      return {
        key: isLarge ? 'ipad-pro-large' : 'ipad-pro-11吋',
        name: isLarge ? 'iPad Pro 13吋 / 12.9吋' : 'iPad Pro 11吋',
        kind: 'ipad-pro',
      }
    }

    if (product.name.startsWith('iPad mini ')) {
      return {
        key: 'ipad-mini',
        name: 'iPad mini',
        kind: 'ipad-mini',
      }
    }

    if (/^iPad 第\d+代/.test(product.name)) {
      return {
        key: 'ipad',
        name: 'iPad',
        kind: 'ipad',
      }
    }
  }

  if (product?.category === 'Mac') {
    if (product.name.startsWith('Mac mini ')) {
      return {
        key: 'mac-mini',
        name: 'Mac mini',
        kind: 'mac',
      }
    }
    if (product.name.startsWith('Mac Studio ')) {
      return {
        key: 'mac-studio',
        name: 'Mac Studio',
        kind: 'mac',
      }
    }
    if (product.name.startsWith('iMac ')) {
      return {
        key: 'imac',
        name: 'iMac',
        kind: 'mac',
      }
    }
    if (product.name.startsWith('Mac Pro ')) {
      return {
        key: 'mac-pro',
        name: 'Mac Pro',
        kind: 'mac',
      }
    }
  }

  if (product?.category === 'Apple Watch') {
    if (product.name.startsWith('Apple Watch Ultra')) {
      return {
        key: 'apple-watch-ultra',
        name: 'Apple Watch Ultra',
        kind: 'watch-ultra',
      }
    }

    if (product.name.startsWith('Apple Watch Series ')) {
      return {
        key: 'apple-watch-series',
        name: 'Apple Watch Series',
        kind: 'watch-series',
      }
    }

    if (product.name.startsWith('Apple Watch SE')) {
      return {
        key: 'apple-watch-se',
        name: 'Apple Watch SE',
        kind: 'watch-se',
      }
    }
  }

  return null
}

function getVariantLabel(product, options = {}) {
  const group = getProductVariantGroup(product, options)
  if (!group) return product?.name ?? ''
  if (group.kind === 'iphone-generation') {
    if (product.name.startsWith('iPhone SE')) return product.name.replace('iPhone ', '')
    if (/^iPhone\s+(X|XR|XS)/.test(product.name)) return product.name.replace('iPhone ', '')
    return product.name.replace(/^iPhone\s+\d+\s*/, '') || '標準版'
  }
  if (group.kind === 'iphone-model') {
    const generation = getIphoneGeneration(product)
    const tier = getIphoneTier(product)
    if (!generation) return product.name
    if (tier.key === 'standard') return `${generation}`
    if (tier.key === 'e') return `${generation}e`
    if (tier.key === 'se') return product.name.replace('iPhone ', '')
    if (tier.key === 'x') return product.name.replace('iPhone ', '')
    return product.name.replace('iPhone ', '')
  }
  if (group.kind === 'macbook-air') {
    if (product.name === 'MacBook Air M1') return 'M1'
    return product.name.replace(/^MacBook Air (13吋|15吋) /, '')
  }
  if (group.kind === 'ipad-air') {
    return product.name.replace(/^iPad Air (?:11吋|13吋) /, '').replace('iPad Air ', '')
  }
  if (group.kind === 'ipad-pro') {
    return product.name.replace(/^iPad Pro (11吋|13吋|12\.9吋) /, '')
  }
  if (group.kind === 'ipad-mini') {
    return product.name.replace('iPad mini ', '')
  }
  if (group.kind === 'ipad') {
    return product.name.replace('iPad ', '')
  }
  if (group.kind === 'watch-ultra') {
    return product.name.replace('Apple Watch ', '')
  }
  if (group.kind === 'watch-series') {
    return product.name.replace('Apple Watch ', '')
  }
  if (group.kind === 'watch-se') {
    return product.name.replace('Apple Watch SE ', '') || 'SE'
  }
  return product.name.replace(`${group.name} `, '')
}

function getVariantSortValue(product, options = {}) {
  if (product?.category === 'iPhone') {
    const generation = getIphoneGeneration(product) ?? 0
    const tier = getIphoneTier(product)
    if (options.iphoneGrouping === 'generation') return tier.rank
    return getIphoneGenerationRank(generation) * 10 + tier.rank
  }

  const label = getVariantLabel(product, options)
  const chip = label.match(/M(\d+)/)
  const generation = chip ? Number(chip[1]) : 0
  const tier = label.includes('Ultra')
    ? 3
    : label.includes('Max')
      ? 2
      : label.includes('Pro')
        ? 1
        : 0
  return generation * 10 + tier
}

function buildProductEntries(products, options = {}) {
  const entries = []
  const groups = new Map()

  for (const product of products) {
    const group = getProductVariantGroup(product, options)
    if (!group) {
      entries.push({ type: 'product', key: product.id, product })
      continue
    }

    if (!groups.has(group.key)) {
      const entry = {
        type: 'variant-group',
        key: group.key,
        name: group.name,
        category: product.category,
        variants: [],
      }
      groups.set(group.key, entry)
      entries.push(entry)
    }
    groups.get(group.key).variants.push(product)
  }

  for (const group of groups.values()) {
    group.variants.sort((a, b) => getVariantSortValue(b, options) - getVariantSortValue(a, options))
  }

  if (options.iphoneGrouping) {
    const modelOrder = {
      'pro-max': 70,
      pro: 60,
      'plus-air': 50,
      standard: 40,
      e: 30,
      se: 20,
      x: 10,
    }

    entries.sort((a, b) => {
      const productA = a.type === 'product' ? a.product : a.variants[0]
      const productB = b.type === 'product' ? b.product : b.variants[0]
      if (options.iphoneGrouping === 'generation') {
        return getIphoneGenerationRank(getIphoneGeneration(productB)) - getIphoneGenerationRank(getIphoneGeneration(productA))
      }
      return (modelOrder[getIphoneTier(productB).key] ?? 0) - (modelOrder[getIphoneTier(productA).key] ?? 0)
    })
  }

  return entries
}

function getEntryPrimaryPrice(entry) {
  if (entry.type === 'product') return getPrimaryMarketPrice(entry.product)
  const prices = entry.variants.map(getPrimaryMarketPrice).filter(Boolean)
  return prices.length ? Math.min(...prices) : null
}

function isEntrySelected(entry, selectedProduct) {
  if (!selectedProduct) return false
  if (entry.type === 'product') return entry.product.id === selectedProduct.id
  return entry.variants.some(product => product.id === selectedProduct.id)
}

function getMacSpecSummary(config, spec) {
  if (!config || !spec) return ''
  return config.groups
    .map(group => group.options.find(option => option.value === spec[group.key])?.label ?? spec[group.key])
    .join(' / ')
}


export default function QueryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [iphoneGrouping, setIphoneGrouping] = useState('generation')
  const initialProduct = APPLE_PRODUCTS.find(p => p.id === 'iphone-16-pro') ?? APPLE_PRODUCTS[0]
  const [selectedProduct, setSelectedProduct] = useState(initialProduct)
  const [selectedStorage, setSelectedStorage] = useState(initialProduct?.storages[0] ?? '')
  const [selectedMacSpec, setSelectedMacSpec] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [liveAvg, setLiveAvg] = useState(null)   // null = 尚未載入, false = 無資料
  const [liveDailyPrices, setLiveDailyPrices] = useState([])
  const [avgLoading, setAvgLoading] = useState(false)

  const filtered = useMemo(() => {
    return APPLE_PRODUCTS.filter(p => {
      const matchCat = selectedCategory === '全部' || p.category === selectedCategory
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [search, selectedCategory])

  const productEntries = useMemo(
    () => buildProductEntries(filtered, selectedCategory === 'iPhone' ? { iphoneGrouping } : {}),
    [filtered, selectedCategory, iphoneGrouping]
  )

  const macConfig = useMemo(
    () => getMacSpecConfig(selectedProduct?.id),
    [selectedProduct?.id]
  )

  useEffect(() => {
    const query = search.trim()
    if (query.length < 2) return
    const id = setTimeout(() => {
      void trackSearchEvent({ eventType: 'search', query, resultCount: filtered.length })
    }, 700)
    return () => clearTimeout(id)
  }, [search, filtered.length])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedProduct(null)
      setSelectedStorage('')
      setAiAnalysis('')
      setAiError('')
      setLiveAvg(null)
      setLiveDailyPrices([])
      return
    }

    if (!selectedProduct || !filtered.some(product => product.id === selectedProduct.id)) {
      const nextProduct = filtered[0]
      setSelectedProduct(nextProduct)
      setSelectedStorage(nextProduct.storages[0])
      setAiAnalysis('')
      setAiError('')
      setLiveAvg(null)
      setLiveDailyPrices([])
    }
  }, [filtered, selectedProduct])

  useEffect(() => {
    if (!macConfig) {
      setSelectedMacSpec(null)
      return
    }

    setSelectedStorage(macConfig.baseStorage)
    setSelectedMacSpec(getDefaultMacSpec(macConfig))
    setAiAnalysis('')
    setAiError('')
    setLiveAvg(null)
    setLiveDailyPrices([])
  }, [macConfig])

  function selectProduct(product) {
    void trackSearchEvent({ eventType: 'product_view', product })
    setSelectedProduct(product)
    const config = getMacSpecConfig(product.id)
    setSelectedStorage(config?.baseStorage ?? product.storages[0])
    setSelectedMacSpec(config ? getDefaultMacSpec(config) : null)
    setAiAnalysis('')
    setAiError('')
    setLiveAvg(null)
    setLiveDailyPrices([])
    // 手機版：選完產品自動捲到詳情區
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('product-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  function changeStorage(storage) {
    if (selectedProduct) {
      void trackSearchEvent({ eventType: 'storage_select', product: selectedProduct, storage })
    }
    setSelectedStorage(storage)
    setAiAnalysis('')
    setAiError('')
    setLiveAvg(null)
  }

  function changeMacSpec(key, value) {
    if (!macConfig) return
    setSelectedMacSpec(current => normalizeMacSpec(macConfig, {
      ...(current ?? getDefaultMacSpec(macConfig)),
      [key]: value,
    }))
    setAiAnalysis('')
    setAiError('')
  }

  // 每次型號或容量改變時，從 Supabase 撈最新均價
  useEffect(() => {
    if (!selectedProduct || !selectedStorage) return
    let cancelled = false
    const loadingId = setTimeout(() => {
      if (!cancelled) setAvgLoading(true)
    }, 0)
    const referencePrice = selectedProduct.marketAvg[selectedStorage]
    Promise.all([
      getMarketPrice(selectedProduct.name, selectedStorage, { referencePrice }),
      getDailyPrices(selectedProduct.name, selectedStorage, { referencePrice }),
    ]).then(([result, dailyPrices]) => {
      if (cancelled) return
      // result = { avg, count, trimmedCount } 或 null
      // 真實成交回報有 2 筆即可優先使用；其餘來源維持至少 5 筆才採用。
      setLiveAvg(result && (result.reportCount >= 2 || result.count >= 5) ? result : false)
      setLiveDailyPrices(dailyPrices)
      setAvgLoading(false)
    })
    return () => {
      cancelled = true
      clearTimeout(loadingId)
    }
  }, [selectedProduct, selectedStorage])

  function fetchAiAnalysis() {
    if (!selectedProduct || !selectedStorage || !displayAvgValue) return
    setAiLoading(true)
    setAiError('')
    setAiAnalysis('')

    setTimeout(() => {
      const avg = displayAvgValue
      if (isLowLiquidityIphone(selectedProduct, avg)) {
        const range = getLowLiquidityRange(avg)
        const rangeText = range ? `$${range.low.toLocaleString()} - $${range.high.toLocaleString()}` : '低價區間'
        setAiAnalysis(`${selectedProduct.name} ${displayStorageLabel} 已屬低流動性老機，參考區間約 ${rangeText}。這類手機價格受外觀、電池健康度、是否能正常使用與配件影響很大，能賣就賣，外觀好才有溢價；外觀差或電池差時不用再用精準均價估算。`)
        setAiLoading(false)
        return
      }
      const ceiling = macEstimate?.newProductGuardrail ?? getMarketCeiling(selectedProduct, selectedStorage)
      const retail = displayRetail
      const discount = Math.round((1 - avg / retail) * 100)
      const lowOffer = capToMarketCeiling(Math.round(avg*0.95/100)*100, ceiling)
      const highOffer = capToMarketCeiling(Math.round(avg*1.05/100)*100, ceiling)
      const sellerLimit = capToMarketCeiling(Math.round(avg*1.08/100)*100, ceiling)
      const buyerTarget = capToMarketCeiling(Math.round(avg*0.97/100)*100, ceiling)
      const overpayLimit = capToMarketCeiling(Math.round(avg*1.1/100)*100, ceiling)

      const analyses = [
        `目前 ${selectedProduct.name} ${displayStorageLabel} 參考行情 $${avg.toLocaleString()}，較官方參考價便宜 ${discount}%。近期供給量穩定，建議買家從均價再低 3-5% 開始出價，9成新以上品項較容易成交。`,
        `${selectedProduct.name} ${displayStorageLabel} 目前行情合理，成交價集中在 $${lowOffer} – $${highOffer} 之間。有盒裝且保固內的機子可溢價 5-8%，賣家定價建議不超過 $${sellerLimit}。`,
        `市場觀察：${selectedProduct.name} ${displayStorageLabel} 近期成交筆數正常，價格波動在 ±5% 範圍內。買家可安心在 $${buyerTarget} 左右入手，超過 $${overpayLimit} 建議再議價。`,
      ]
      const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)]
      setAiAnalysis(randomAnalysis)
      setAiLoading(false)
    }, 800)
  }

  // loading 中沿用 mockData，載入完才切換（避免數字閃跳）。
  // 真實成交優先於模型預設；新品通路最低價只作為二手價的單向上限。
  const adjustedReference = selectedProduct && selectedStorage
    ? selectedProduct.marketAvg[selectedStorage]
    : null
  const marketCeiling = selectedProduct && selectedStorage
    ? getMarketCeiling(selectedProduct, selectedStorage)
    : null
  const avgRaw = selectedProduct && selectedStorage
    ? capToMarketCeiling(liveAvg && !avgLoading
        ? liveAvg.avg
        : adjustedReference, marketCeiling)
    : null
  const avgValue = avgRaw != null ? Math.round(avgRaw / 100) * 100 : null
  const retail = selectedProduct && selectedStorage ? getOfficialPrice(selectedProduct, selectedStorage) : null
  const normalizedMacSpec = macConfig && selectedMacSpec
    ? normalizeMacSpec(macConfig, selectedMacSpec)
    : null
  const macEstimate = macConfig && normalizedMacSpec
    ? estimateMacSpec({
        config: macConfig,
        spec: normalizedMacSpec,
        baseMarket: avgValue,
        baseRetail: retail,
      })
    : null
  const displayAvgValue = macEstimate?.estimatedMarket ?? avgValue
  const displayRetail = macEstimate?.estimatedRetail ?? retail
  const displayStorageLabel = macEstimate
    ? getMacSpecSummary(macConfig, macEstimate.spec)
    : selectedStorage
  const lowLiquidityIphone = isLowLiquidityIphone(selectedProduct, displayAvgValue)
  const lowLiquidityRange = lowLiquidityIphone ? getLowLiquidityRange(displayAvgValue) : null
  const discount = !lowLiquidityIphone && displayAvgValue && displayRetail ? Math.round((1 - displayAvgValue / displayRetail) * 100) : null
  const isLiveMarketPrice = Boolean(liveAvg && !avgLoading)
  const monthsOld = getMonthsOld(selectedProduct)
  const reportedPriceTrend = buildReportedPriceTrend(liveDailyPrices)
  const depreciationTrend = reportedPriceTrend.length >= 2 ? reportedPriceTrend : buildDepreciationTrend(selectedProduct, selectedStorage, displayAvgValue, {
    launchPrice: macEstimate?.estimatedRetail,
  })
  const storageBars = buildStorageBars(selectedProduct)
  const priceBand = lowLiquidityIphone ? null : getPriceBand(selectedProduct, displayAvgValue, macEstimate?.newProductGuardrail ?? marketCeiling)
  const categoryProducts = selectedProduct
    ? APPLE_PRODUCTS.filter(p => p.category === selectedProduct.category)
    : []
  const selectedGroupingOptions = selectedProduct?.category === 'iPhone' ? { iphoneGrouping } : {}
  const categoryEntries = buildProductEntries(categoryProducts, selectedGroupingOptions)
  const categoryPrices = categoryEntries.map(getEntryPrimaryPrice).filter(Boolean)
  const maxCategoryPrice = Math.max(...categoryPrices, 1)
  const selectedVariantGroup = getProductVariantGroup(selectedProduct, selectedGroupingOptions)
  const selectedGroupVariants = selectedVariantGroup
    ? APPLE_PRODUCTS
        .filter(product => getProductVariantGroup(product, selectedGroupingOptions)?.key === selectedVariantGroup.key)
        .sort((a, b) => getVariantSortValue(b, selectedGroupingOptions) - getVariantSortValue(a, selectedGroupingOptions))
    : []

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
          {selectedCategory === 'iPhone' && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex rounded-full bg-white border border-[rgba(0,0,0,0.1)] p-1 shadow-sm">
                {[
                  { value: 'generation', label: '依世代' },
                  { value: 'model', label: '依機型' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setIphoneGrouping(option.value)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                      iphoneGrouping === option.value
                        ? 'bg-[#1d1d1f] text-white'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
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
            {productEntries.map(entry => (
              (() => {
                const primaryPrice = getEntryPrimaryPrice(entry)
                const priceWidth = Math.max(8, Math.round((primaryPrice / maxCategoryPrice) * 100))
                const active = isEntrySelected(entry, selectedProduct)
                const product = entry.type === 'product' ? entry.product : entry.variants[0]
                const title = entry.type === 'product' ? product.name : entry.name
                const subtitle = entry.type === 'product'
                  ? isLowLiquidityIphone(product, product.marketAvg[product.storages[0]])
                    ? `低流動性 ${formatMarketValue(product, product.marketAvg[product.storages[0]])}`
                    : `參考均價 $${product.marketAvg[product.storages[0]]?.toLocaleString()}+`
                  : isLowLiquidityIphone(product, primaryPrice)
                    ? `${entry.variants.length} 個型號，低流動性 ${formatMarketValue(product, primaryPrice)}`
                    : `${entry.variants.length} 個型號，參考均價 $${primaryPrice?.toLocaleString()} 起`
                return (
              <button key={entry.key} onClick={() => selectProduct(product)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm transition-all duration-200 ${
                  active
                    ? 'bg-[#1d1d1f] text-white shadow-md'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }`}>
                <div className="font-medium text-[14px]">{title}</div>
                <div className={`text-[12px] mt-0.5 ${active ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>
                  {subtitle}
                </div>
                <div className={`h-1 rounded-full mt-2 overflow-hidden ${active ? 'bg-white/15' : 'bg-white'}`}>
                  <div
                    className={`h-full rounded-full ${active ? 'bg-[#0071e3]' : 'bg-[#d2d2d7]'}`}
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

                {selectedGroupVariants.length > 1 && (
                  <div>
                    {selectedVariantGroup?.kind === 'ipad-air' && (
                      <p className="text-[11px] font-semibold text-[#6e6e73] mb-2">晶片／世代</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {selectedGroupVariants.map(product => (
                        <button
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-200 ${
                            selectedProduct?.id === product.id
                              ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white'
                              : 'border-[rgba(0,0,0,0.15)] text-[#1d1d1f] hover:border-[#1d1d1f]'
                          }`}
                        >
                          {getVariantLabel(product, selectedGroupingOptions)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {macConfig && macEstimate ? (
                  <div className="border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 bg-white space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">Mac 規格估算</p>
                        <h3 className="text-[18px] font-semibold text-[#1d1d1f] mt-1">基準規格：{macConfig.baseMarketLabel}</h3>
                        <p className="text-[12px] text-[#6e6e73] mt-1">高配為規格加值估算，不假裝每個組合都有足夠成交樣本。</p>
                      </div>
                      <span className="shrink-0 px-3 py-1 rounded-full bg-[#fff7e6] text-[#b36b00] text-[11px] font-semibold border border-[#ffe0a3]">估算</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {macConfig.groups.map(group => (
                        <div key={group.key}>
                          <p className="text-[11px] font-semibold text-[#6e6e73] mb-2">{group.label}</p>
                          <div className="flex flex-wrap gap-2">
                            {group.options.map(option => {
                              const disabled = isMacOptionDisabled(macConfig, normalizedMacSpec, group.key, option.value)
                              const active = normalizedMacSpec?.[group.key] === option.value
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => !disabled && changeMacSpec(group.key, option.value)}
                                  disabled={disabled}
                                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                                    active
                                      ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white'
                                      : disabled
                                        ? 'border-[#e5e5ea] bg-[#f5f5f7] text-[#b0b0b5] cursor-not-allowed'
                                        : 'border-[rgba(0,0,0,0.15)] text-[#1d1d1f] hover:border-[#1d1d1f]'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {getMacRuleMessages(macConfig, normalizedMacSpec).length > 0 && (
                      <div className="rounded-xl bg-[#f5f5f7] px-3 py-2">
                        {getMacRuleMessages(macConfig, normalizedMacSpec).map(message => (
                          <p key={message} className="text-[12px] text-[#6e6e73]">{message}</p>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl bg-[#f5f5f7] p-3">
                        <p className="text-[11px] text-[#6e6e73]">基準行情</p>
                        <p className="text-[18px] font-semibold text-[#1d1d1f]">{formatMoney(macEstimate.baseMarket)}</p>
                      </div>
                      <div className="rounded-xl bg-[#f5f5f7] p-3">
                        <p className="text-[11px] text-[#6e6e73]">規格加值</p>
                        <p className="text-[18px] font-semibold text-[#1d1d1f]">+{macEstimate.marketAddOn.toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-[#e8f5e9] p-3">
                        <p className="text-[11px] text-[#2e7d32]">估算行情</p>
                        <p className="text-[18px] font-semibold text-[#1d1d1f]">{formatMoney(macEstimate.estimatedMarket)}</p>
                      </div>
                    </div>

                    {macEstimate.rows.length > 0 && (
                      <div className="divide-y divide-[rgba(0,0,0,0.06)]">
                        {macEstimate.rows.map(row => (
                          <div key={`${row.key}-${row.label}`} className="flex items-center justify-between py-2 text-[13px]">
                            <span className="text-[#6e6e73]">{row.label}</span>
                            <span className="font-semibold text-[#1d1d1f]">+{row.market.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {macEstimate.capped && (
                      <p className="text-[12px] text-[#b36b00]">估算值已被新品參考防線壓低，二手價不應貼近全新品。</p>
                    )}
                  </div>
                ) : (
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
                )}

                {/* KPI cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#f5f5f7] rounded-2xl p-4">
                    <p className="text-[11px] text-[#6e6e73] mb-1 font-medium">
                      {lowLiquidityIphone ? '低流動性區間' : isLiveMarketPrice ? `社團均價（${liveAvg.count} 筆）` : '參考均價'}
                    </p>
                    {avgLoading
                      ? <p className="text-[18px] font-semibold text-[#6e6e73] tracking-tight">載入中…</p>
                      : <p className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
                          {formatMarketValue(selectedProduct, displayAvgValue)}
                        </p>
                    }
                    {!avgLoading && lowLiquidityIphone && (
                      <p className="text-[10px] text-[#6e6e73] mt-1">不再用精準均價，外觀與電池影響較大</p>
                    )}
                    {!avgLoading && macEstimate && (
                      <p className="text-[10px] text-[#6e6e73] mt-1">含規格加值估算，基準為社團行情</p>
                    )}
                    {!avgLoading && !lowLiquidityIphone && !macEstimate && !isLiveMarketPrice && (
                      <p className="text-[10px] text-[#6e6e73] mt-1">成交筆數不足時顯示資料庫參考值</p>
                    )}
                    {isLiveMarketPrice && liveAvg.reportCount > 0 && (
                      <p className="text-[10px] text-[#248a3d] mt-1">含 {liveAvg.reportCount} 筆成交回報，已優先採計</p>
                    )}
                  </div>
                  <div className="bg-[#e3f2fd] rounded-2xl p-4">
                    <p className="text-[11px] text-[#6e6e73] mb-1 font-medium">{lowLiquidityIphone ? '市場狀態' : '平均折扣'}</p>
                    <p className="text-[22px] font-semibold text-[#0071e3] tracking-tight">{lowLiquidityIphone ? '低流動性' : discount != null ? `${discount}% off` : '—'}</p>
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

                {lowLiquidityIphone && lowLiquidityRange && (
                  <div className="border border-[#ffe0a3] rounded-2xl p-5 bg-[#fffaf0]">
                    <p className="text-[11px] font-semibold text-[#b36b00] uppercase tracking-wider">低流動性提醒</p>
                    <p className="text-[14px] text-[#1d1d1f] leading-relaxed mt-2">
                      這台手機行情低於 $3,000，市場通常不再適合用精準均價判斷。參考區間約 ${lowLiquidityRange.low.toLocaleString()} - ${lowLiquidityRange.high.toLocaleString()}；能賣就賣，外觀好、電池健康度高、功能正常才有溢價。
                    </p>
                  </div>
                )}

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
                          <Tooltip formatter={v => [lowLiquidityIphone ? formatMarketValue(selectedProduct, v) : formatMoney(v), '行情']} contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }} />
                          <Line type="monotone" dataKey="price" stroke="#ff3b30" strokeWidth={2.5} dot={{ r: 3, fill: '#ff3b30' }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">容量價差</p>
                        <p className="text-[13px] text-[#6e6e73] mt-1">官方參考價 vs 參考均價</p>
                      </div>
                      <Activity size={18} className="text-[#0071e3]" />
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={storageBars} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="storage" tick={{ fontSize: 11, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v / 1000)}k`} width={42} />
                          <Tooltip formatter={(v, name) => name === '行情' && lowLiquidityIphone ? formatMarketValue(selectedProduct, v) : formatMoney(v)} contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }} />
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
                        <p className="text-[13px] text-[#6e6e73] mt-1">
                          {priceBand.isWatch ? '手錶受電池、碰傷、錶帶與保固影響，價差較大' : '以目前均價估算合理買賣帶'}
                        </p>
                      </div>
                      <CircleDollarSign size={18} className="text-[#34c759]" />
                    </div>
                    <div className="relative h-3 rounded-full bg-[#f5f5f7] overflow-hidden">
                      <div className="absolute inset-y-0 left-[18%] right-[18%] bg-[#e8f5e9]" />
                      <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-[#34c759] rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div>
                        <p className="text-[11px] text-[#6e6e73]">{priceBand.isWatch ? '碰傷／低電池' : '好買價'}</p>
                        <p className="text-[15px] font-semibold text-[#34c759]">{formatMoney(priceBand.low)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-[#6e6e73]">均價</p>
                        <p className="text-[15px] font-semibold text-[#1d1d1f]">{formatMoney(priceBand.target)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-[#6e6e73]">{priceBand.isWatch ? '極新／保固完整' : '偏高價'}</p>
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
                        <p className="text-[11px] text-[#6e6e73] mb-1">官方參考價</p>
                        <p className="font-semibold text-[#1d1d1f] text-[14px]">
                          {formatMoney(displayRetail)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6e6e73] mb-1">目前折舊</p>
                        {lowLiquidityIphone ? (
                          <div>
                            <p className="font-semibold text-[#ff9500] text-[14px]">低流動性</p>
                            <p className="text-[11px] text-[#ff9500]">不適用精準折舊</p>
                          </div>
                        ) : (() => {
                          const launch = getLaunchPrice(selectedProduct, selectedStorage)
                          const launchWithAddOns = macEstimate?.estimatedRetail ?? launch
                          const current = displayAvgValue ?? selectedProduct.marketAvg[selectedStorage]
                          const drop = launchWithAddOns - current
                          const dropPct = Math.round((drop / launchWithAddOns) * 100)
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
