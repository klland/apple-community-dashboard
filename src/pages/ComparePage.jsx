import { useState, useMemo } from 'react'
import { APPLE_PRODUCTS, CATEGORIES, CONDITIONS } from '../data/mockData'

function DepreciationBadge({ pct }) {
  const color = pct >= 40 ? 'text-[#ff3b30] bg-[#fce4ec]' : pct >= 25 ? 'text-[#ff9500] bg-[#fff3e0]' : 'text-[#34c759] bg-[#e8f5e9]'
  return (
    <span className={`text-[12px] px-2.5 py-0.5 rounded-full font-medium ${color}`}>
      -{pct}%
    </span>
  )
}

function getOfficialPrice(product, storage) {
  return product?.currentOfficialPrice?.[storage] ?? product?.basePrice?.[storage]
}

function getLaunchPrice(product, storage) {
  return product?.launchPrice?.[storage] ?? product?.basePrice?.[storage]
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
    const launch = getLaunchPrice(product, storage)
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
    { label: '官方參考價', getValue: (p, s) => { const v = getOfficialPrice(p, s); return v ? `$${v.toLocaleString()}` : '—' }, better: 'none' },
    { label: '上市價', getValue: (p, s) => { const v = getLaunchPrice(p, s); return v ? `$${v.toLocaleString()}` : '—' }, better: 'none' },
    { label: '折舊金額（越大越省）', getValue: (_, __, dep) => dep ? `-$${dep.drop.toLocaleString()}` : '—', better: 'higher', useDep: true },
    { label: '折舊幅度（越大越省）', getValue: (_, __, dep) => dep ? `${dep.pct}%` : '—', better: 'higher', useDep: true },
    { label: '上市日期', getValue: (p) => p?.launchDate || '—', better: 'none' },
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
    <div>
      {/* Hero */}
      <section className="bg-[#f5f5f7] pt-14 pb-12 text-center border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[740px] mx-auto px-5">
          <h1 className="text-[40px] font-semibold text-[#1d1d1f] leading-tight tracking-tight mb-2">
            產品比較
          </h1>
          <p className="text-[17px] text-[#6e6e73] font-light">
            最多比較兩款產品的行情與折舊狀況
          </p>
        </div>
      </section>

      <div className="max-w-[740px] mx-auto px-5 py-10">
        {/* Category selector */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                category === cat
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed] border border-[rgba(0,0,0,0.06)]'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Slot selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {[0, 1].map(idx => (
            <div key={idx} className="border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 bg-white">
              <p className="text-[11px] font-semibold text-[#6e6e73] mb-3 uppercase tracking-wider">產品 {idx + 1}</p>

              {slots[idx] ? (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-[15px] text-[#1d1d1f]">{slots[idx].name}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {slots[idx].storages.map(s => (
                          <button key={s} onClick={() => setStorage(idx, s)}
                            className={`px-3 py-1 rounded-full text-[12px] border transition-all duration-200 ${
                              storages[idx] === s
                                ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white'
                                : 'border-[rgba(0,0,0,0.15)] text-[#1d1d1f] hover:border-[#1d1d1f]'
                            }`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => clearSlot(idx)} className="text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition">✕</button>
                  </div>
                  {storages[idx] && (() => {
                    const dep = idx === 0 ? depA : depB
                    return dep ? (
                      <div className="bg-[#f5f5f7] rounded-xl p-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-[12px] text-[#6e6e73]">社團均價</span>
                          <span className="font-bold text-[#1d1d1f] text-[15px]">${dep.current.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[12px] text-[#6e6e73]">折舊</span>
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
                    placeholder="搜尋產品…"
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(0,0,0,0.1)] text-[14px] bg-[#f5f5f7] focus:outline-none focus:border-[#0071e3] focus:bg-white text-[#1d1d1f] transition-all placeholder-[#6e6e73] mb-2.5"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {filteredProducts.map(p => (
                      <button key={p.id} onClick={() => selectProduct(idx, p)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-[14px] hover:bg-[#f5f5f7] text-[#1d1d1f] transition-all">
                        {p.name}
                        <span className="text-[12px] text-[#6e6e73] ml-2">參考均價 ${p.marketAvg[p.storages[0]]?.toLocaleString()}+</span>
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
          <div className="border border-[rgba(0,0,0,0.08)] rounded-2xl overflow-hidden bg-white">
            <div className="grid grid-cols-3 bg-[#f5f5f7] px-5 py-4">
              <div className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">比較項目</div>
              {[0, 1].map(idx => (
                <div key={idx} className="text-center">
                  <p className="text-[13px] font-semibold text-[#1d1d1f]">{slots[idx].name}</p>
                  <p className="text-[12px] text-[#6e6e73]">{storages[idx]}</p>
                </div>
              ))}
            </div>
            {comparisonRows.map((row, i) => {
              const betterIdx = getBetterIdx(row)
              return (
                <div key={i} className={`grid grid-cols-3 px-5 py-3.5 border-t border-[rgba(0,0,0,0.05)] ${i % 2 === 0 ? 'bg-white' : 'bg-[#f5f5f7]/40'}`}>
                  <div className="text-[13px] text-[#6e6e73] self-center">{row.label}</div>
                  {[0, 1].map(idx => {
                    const dep = idx === 0 ? depA : depB
                    const val = row.getValue(slots[idx], storages[idx], dep)
                    const isBetter = betterIdx === idx
                    return (
                      <div key={idx} className={`text-center font-semibold text-[14px] ${isBetter ? 'text-[#34c759]' : 'text-[#1d1d1f]'}`}>
                        {val}
                        {isBetter && <span className="ml-1 text-[12px]">✓</span>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {(!slots[0] || !slots[1]) && (
          <div className="text-center py-16 text-[#6e6e73] text-[15px]">
            選擇兩款產品開始比較
          </div>
        )}
      </div>
    </div>
  )
}
