import { useState, useMemo } from 'react'
import { APPLE_PRODUCTS, CATEGORIES, CONDITIONS } from '../data/mockData'

function DepreciationBadge({ pct }) {
  const color = pct >= 40 ? 'text-red-500 bg-red-50' : pct >= 25 ? 'text-orange-500 bg-orange-50' : 'text-green-600 bg-green-50'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      -{pct}%
    </span>
  )
}

export default function ComparePage() {
  const [category, setCategory] = useState('iPhone')
  const [slots, setSlots] = useState([null, null])
  const [storages, setStorages] = useState(['', ''])
  const [search, setSearch] = useState(['', ''])

  const categories = CATEGORIES.filter(c => c !== '全部')

  function selectProduct(slotIdx, product) {
    const newSlots = [...slots]
    const newStorages = [...storages]
    newSlots[slotIdx] = product
    newStorages[slotIdx] = product.storages[0]
    setSlots(newSlots)
    setStorages(newStorages)
  }

  function setStorage(slotIdx, storage) {
    const newStorages = [...storages]
    newStorages[slotIdx] = storage
    setStorages(newStorages)
  }

  function clearSlot(slotIdx) {
    const newSlots = [...slots]
    const newStorages = [...storages]
    newSlots[slotIdx] = null
    newStorages[slotIdx] = ''
    setSlots(newSlots)
    setStorages(newStorages)
  }

  const filteredProducts = useMemo(() =>
    APPLE_PRODUCTS.filter(p =>
      p.category === category &&
      (search[0] === '' || p.name.toLowerCase().includes(search[0].toLowerCase()))
    ), [category, search])

  function getDepreciation(product, storage) {
    if (!product || !storage) return null
    const launch = product.launchPrice?.[storage] || product.basePrice[storage]
    const current = product.marketAvg[storage]
    const drop = launch - current
    const pct = Math.round((drop / launch) * 100)
    const monthsOld = Math.floor((new Date() - new Date(product.launchDate)) / (1000*60*60*24*30))
    return { launch, current, drop, pct, monthsOld }
  }

  const depA = getDepreciation(slots[0], storages[0])
  const depB = getDepreciation(slots[1], storages[1])

  const comparisonRows = [
    { label: '社團均價', getValue: (p, s) => p?.marketAvg[s] ? `$${p.marketAvg[s].toLocaleString()}` : '—', better: 'lower' },
    { label: '原廠售價', getValue: (p, s) => { const v = p?.launchPrice?.[s] || p?.basePrice[s]; return v ? `$${v.toLocaleString()}` : '—' }, better: 'none' },
    { label: '折舊金額', getValue: (_, __, dep) => dep ? `-$${dep.drop.toLocaleString()}` : '—', better: 'lower', useDep: true },
    { label: '折舊幅度', getValue: (_, __, dep) => dep ? `${dep.pct}%` : '—', better: 'lower', useDep: true },
    { label: '上市時間', getValue: (p) => p?.launchDate || '—', better: 'none' },
    { label: '上市月數', getValue: (_, __, dep) => dep ? `${dep.monthsOld} 個月` : '—', better: 'none', useDep: true },
    { label: '可選容量', getValue: (p) => p?.storages.join(' / ') || '—', better: 'none' },
    { label: '可選顏色', getValue: (p) => p?.colors.length ? `${p.colors.length} 色` : '—', better: 'none' },
  ]

  function getBetterIdx(row) {
    if (row.better === 'none') return -1
    const getVal = (idx) => {
      const dep = idx === 0 ? depA : depB
      const p = slots[idx]
      const s = storages[idx]
      if (!p || !s) return null
      if (row.useDep) {
        if (!dep) return null
        return row.label === '折舊幅度' ? dep.pct : dep.drop
      }
      return p.marketAvg[s]
    }
    const a = getVal(0)
    const b = getVal(1)
    if (a === null || b === null) return -1
    return row.better === 'lower' ? (a <= b ? 0 : 1) : (a >= b ? 0 : 1)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">產品比較</h1>
      <p className="text-gray-500 mb-8 text-sm">最多比較兩款產品的行情與折舊狀況</p>

      {/* Category selector */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${category === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Two slot selectors */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {[0, 1].map(idx => (
          <div key={idx} className="border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 mb-3">產品 {idx + 1}</p>

            {slots[idx] ? (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{slots[idx].name}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {slots[idx].storages.map(s => (
                        <button key={s} onClick={() => setStorage(idx, s)}
                          className={`px-3 py-1 rounded-full text-xs border transition ${storages[idx] === s ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => clearSlot(idx)} className="text-xs text-gray-400 hover:text-gray-700 ml-2">✕</button>
                </div>
                {storages[idx] && (() => {
                  const dep = idx === 0 ? depA : depB
                  return dep ? (
                    <div className="bg-gray-50 rounded-xl p-3 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500 text-xs">社團均價</span>
                        <span className="font-bold text-gray-900">${dep.current.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">折舊</span>
                        <DepreciationBadge pct={dep.pct} />
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            ) : (
              <div>
                <input
                  value={search[idx]}
                  onChange={e => { const s = [...search]; s[idx] = e.target.value; setSearch(s) }}
                  placeholder="搜尋產品..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none mb-2"
                />
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredProducts.map(p => (
                    <button key={p.id} onClick={() => selectProduct(idx, p)}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-100 text-gray-700 transition">
                      {p.name}
                      <span className="text-xs text-gray-400 ml-2">均價 ${p.marketAvg[p.storages[0]]?.toLocaleString()}+</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {slots[0] && slots[1] && (
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-500">
            <div>比較項目</div>
            <div className="text-center">{slots[0].name}<br/><span className="text-gray-400 font-normal">{storages[0]}</span></div>
            <div className="text-center">{slots[1].name}<br/><span className="text-gray-400 font-normal">{storages[1]}</span></div>
          </div>
          {comparisonRows.map((row, i) => {
            const betterIdx = getBetterIdx(row)
            return (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 text-sm border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="text-gray-500 text-xs self-center">{row.label}</div>
                {[0, 1].map(idx => {
                  const dep = idx === 0 ? depA : depB
                  const val = row.getValue(slots[idx], storages[idx], dep)
                  const isBetter = betterIdx === idx
                  return (
                    <div key={idx} className={`text-center font-medium ${isBetter ? 'text-green-600' : 'text-gray-900'}`}>
                      {val}
                      {isBetter && <span className="ml-1 text-xs">✓</span>}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {(!slots[0] || !slots[1]) && (
        <div className="text-center py-12 text-gray-300 text-sm">
          選擇兩款產品開始比較
        </div>
      )}
    </div>
  )
}
