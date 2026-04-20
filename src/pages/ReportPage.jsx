import { useState } from 'react'
import { APPLE_PRODUCTS, TRADE_METHODS, PURCHASE_CHANNELS, WARRANTY_STATUS } from '../data/mockData'
import { submitTransaction } from '../lib/supabase'
import SelectOrInput from '../components/SelectOrInput'

const inputCls = "w-full px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.1)] text-[15px] bg-[#f5f5f7] focus:outline-none focus:border-[#0071e3] focus:bg-white text-[#1d1d1f] transition-all placeholder-[#6e6e73]"
const labelCls = "text-[13px] font-medium text-[#1d1d1f] block mb-1.5"

export default function ReportPage() {
  const [form, setForm] = useState({
    productId: '',
    customModel: '',
    storage: '',
    batteryHealth: '',
    purchaseChannel: '',
    warrantyStatus: '',
    warrantyMonthsLeft: '',
    price: '',
    tradeMethod: '',
    note: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedProduct = APPLE_PRODUCTS.find(p => p.id === form.productId)
  const isOtherModel = form.productId === '__other__'
  const isIphone = selectedProduct?.category === 'iPhone'
  const showWarrantyMonths = form.warrantyStatus === '原廠保固內' || form.warrantyStatus === '延長保固（AppleCare+）'

  function update(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'productId') { next.storage = ''; next.customModel = '' }
      return next
    })
  }

  function handleModelSelect(e) {
    const v = e.target.value
    setForm(prev => ({ ...prev, productId: v, storage: '', customModel: '' }))
  }

  const modelName = isOtherModel ? form.customModel : (selectedProduct?.name ?? '')
  const canSubmit = modelName && form.storage && form.price && form.tradeMethod && (!isOtherModel || form.customModel)

  function validatePrice() {
    const price = parseInt(form.price)
    if (!selectedProduct || !form.storage) return null
    const launch = selectedProduct.launchPrice?.[form.storage] || selectedProduct.basePrice[form.storage]
    if (!launch) return null
    if (price > launch * 1.2) return `價格偏高（超過官方售價 $${launch.toLocaleString()} 的 120%），請確認是否正確`
    if (price < launch * 0.3) return `價格偏低（低於官方售價 $${launch.toLocaleString()} 的 30%），請確認是否正確`
    return null
  }

  const priceWarning = form.price && selectedProduct && form.storage ? validatePrice() : null

  async function submit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      await submitTransaction({
        model: modelName,
        storage: form.storage,
        color: null,
        condition: null,
        battery_health: form.batteryHealth ? parseInt(form.batteryHealth) : null,
        has_damage: false,
        purchase_channel: form.purchaseChannel,
        warranty_status: form.warrantyStatus,
        warranty_months: form.warrantyMonthsLeft ? parseInt(form.warrantyMonthsLeft) : null,
        price: parseInt(form.price),
        trade_method: form.tradeMethod,
        location: '',
        source: 'report',
        note: form.note,
      })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 4000)
      setForm({
        productId: '', customModel: '', storage: '', batteryHealth: '',
        purchaseChannel: '', warrantyStatus: '', warrantyMonthsLeft: '',
        price: '', tradeMethod: '', note: '',
      })
    } catch (err) {
      setError('送出失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section className="bg-[#f5f5f7] pt-14 pb-12 text-center border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[560px] mx-auto px-5">
          <h1 className="text-[40px] font-semibold text-[#1d1d1f] leading-tight tracking-tight mb-2">成交回報</h1>
          <p className="text-[17px] text-[#6e6e73] font-light">填入你的成交資訊，幫助社員掌握真實行情</p>
        </div>
      </section>

      <div className="max-w-[560px] mx-auto px-5 py-12">
        {submitted && (
          <div className="mb-8 bg-[#e8f5e9] border border-[rgba(52,199,89,0.2)] rounded-2xl p-6 text-center">
            <p className="text-[32px] mb-2">✅</p>
            <p className="text-[15px] font-semibold text-[#1d8a3b]">感謝你的回報！</p>
            <p className="text-[13px] text-[#6e6e73] mt-1">資料已加入行情資料庫，幫助了其他社員</p>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-[#fce4ec] border border-[rgba(255,59,48,0.15)] rounded-2xl p-4 text-center">
            <p className="text-[14px] text-[#ff3b30]">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          {/* 產品型號 */}
          <div>
            <label className={labelCls}>產品型號 <span className="text-[#ff3b30]">*</span></label>
            <select
              required
              value={form.productId}
              onChange={handleModelSelect}
              className={inputCls}
            >
              <option value="">選擇型號</option>
              {['iPhone','MacBook','iPad','Apple Watch','AirPods','Mac','其他'].map(cat => (
                <optgroup key={cat} label={cat}>
                  {APPLE_PRODUCTS.filter(p => p.category === cat).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </optgroup>
              ))}
              <option value="__other__">其他（自填）</option>
            </select>
            {isOtherModel && (
              <input
                autoFocus
                required
                value={form.customModel}
                onChange={e => update('customModel', e.target.value)}
                placeholder="輸入型號，例如：iPhone 18 Pro"
                className={`${inputCls} mt-2`}
              />
            )}
          </div>

          {/* 容量 */}
          {(selectedProduct || isOtherModel) && (
            <div>
              <label className={labelCls}>容量／規格 <span className="text-[#ff3b30]">*</span></label>
              <SelectOrInput
                options={selectedProduct?.storages ?? []}
                value={form.storage}
                onChange={v => update('storage', v)}
                placeholder="輸入容量，例如：256G"
                required
              />
            </div>
          )}

          {/* 電池（iPhone 才顯示） */}
          {isIphone && (
            <div>
              <label className={labelCls}>電池健康度 <span className="text-[#ff3b30]">*</span></label>
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="100"
                  required
                  value={form.batteryHealth}
                  onChange={e => update('batteryHealth', e.target.value)}
                  placeholder="例如 92"
                  className="flex-1 px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.1)] text-[15px] bg-[#f5f5f7] focus:outline-none focus:border-[#0071e3] focus:bg-white text-[#1d1d1f] transition-all placeholder-[#6e6e73]" />
                <span className="text-[14px] text-[#6e6e73]">%</span>
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>購買管道</label>
            <SelectOrInput
              options={PURCHASE_CHANNELS}
              value={form.purchaseChannel}
              onChange={v => update('purchaseChannel', v)}
              placeholder="輸入購買管道"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>保固狀態</label>
              <SelectOrInput
                options={WARRANTY_STATUS}
                value={form.warrantyStatus}
                onChange={v => update('warrantyStatus', v)}
                placeholder="輸入保固狀態"
              />
            </div>
            {showWarrantyMonths && (
              <div>
                <label className={labelCls}>保固剩餘（月）</label>
                <input type="number" min="1" max="36"
                  value={form.warrantyMonthsLeft}
                  onChange={e => update('warrantyMonthsLeft', e.target.value)}
                  placeholder="例如 8"
                  className={inputCls} />
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>成交價格（TWD） <span className="text-[#ff3b30]">*</span></label>
            <input required type="number" value={form.price} onChange={e => update('price', e.target.value)}
              placeholder="例如 28500"
              className={inputCls} />
            {priceWarning && (
              <p className="mt-1.5 text-[13px] text-[#ff9500] flex items-center gap-1">
                ⚠️ {priceWarning}
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>交易方式 <span className="text-[#ff3b30]">*</span></label>
            <SelectOrInput
              options={TRADE_METHODS}
              value={form.tradeMethod}
              onChange={v => update('tradeMethod', v)}
              placeholder="輸入交易方式"
              required
            />
          </div>

          <div>
            <label className={labelCls}>備註 <span className="text-[#6e6e73]">（選填）</span></label>
            <input type="text" value={form.note} onChange={e => update('note', e.target.value)}
              placeholder="例如：附原廠盒、序號可查"
              className={inputCls} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#0071e3] text-white rounded-2xl text-[15px] font-medium hover:bg-[#0077ed] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 mt-2">
            {loading ? '送出中…' : '送出回報'}
          </button>
        </form>
      </div>
    </div>
  )
}
