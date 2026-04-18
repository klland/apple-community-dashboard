import { useState } from 'react'
import { APPLE_PRODUCTS, TRADE_METHODS, PURCHASE_CHANNELS, WARRANTY_STATUS } from '../data/mockData'
import { submitTransaction } from '../lib/supabase'

export default function ReportPage() {
  const [form, setForm] = useState({
    productId: '',
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
  const isIphone = selectedProduct?.category === 'iPhone'
  const showWarrantyMonths = form.warrantyStatus === '原廠保固內' || form.warrantyStatus === '延長保固（AppleCare+）'

  function update(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'productId') { next.storage = '' }
      return next
    })
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const product = selectedProduct
      await submitTransaction({
        model: product.name,
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
        productId: '', storage: '', batteryHealth: '',
        purchaseChannel: '', warrantyStatus: '', warrantyMonthsLeft: '',
        price: '', tradeMethod: '', note: '',
      })
    } catch (err) {
      setError('送出失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.1)] text-[15px] bg-[#f5f5f7] focus:outline-none focus:border-[#0071e3] focus:bg-white text-[#1d1d1f] transition-all placeholder-[#6e6e73]"
  const labelCls = "text-[13px] font-medium text-[#1d1d1f] block mb-1.5"

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#f5f5f7] pt-14 pb-12 text-center border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[560px] mx-auto px-5">
          <h1 className="text-[40px] font-semibold text-[#1d1d1f] leading-tight tracking-tight mb-2">
            成交回報
          </h1>
          <p className="text-[17px] text-[#6e6e73] font-light">
            填入你的成交資訊，幫助社員掌握真實行情
          </p>
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
            <select required value={form.productId} onChange={e => update('productId', e.target.value)} className={inputCls}>
              <option value="">選擇型號</option>
              {['iPhone','MacBook','iPad','Apple Watch','AirPods','Mac','其他'].map(cat => (
                <optgroup key={cat} label={cat}>
                  {APPLE_PRODUCTS.filter(p => p.category === cat).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div>
              <label className={labelCls}>容量／規格 <span className="text-[#ff3b30]">*</span></label>
              <select required value={form.storage} onChange={e => update('storage', e.target.value)} className={inputCls}>
                <option value="">選擇容量</option>
                {selectedProduct.storages.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}

          {isIphone && (
            <div>
              <label className={labelCls}>電池健康度 <span className="text-[#ff3b30]">*</span></label>
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="100"
                  required={isIphone}
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
            <select value={form.purchaseChannel} onChange={e => update('purchaseChannel', e.target.value)} className={inputCls}>
              <option value="">選擇購買管道</option>
              {PURCHASE_CHANNELS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>保固狀態</label>
              <select value={form.warrantyStatus} onChange={e => update('warrantyStatus', e.target.value)} className={inputCls}>
                <option value="">選擇保固狀態</option>
                {WARRANTY_STATUS.map(w => <option key={w}>{w}</option>)}
              </select>
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
          </div>

          <div>
            <label className={labelCls}>交易方式 <span className="text-[#ff3b30]">*</span></label>
            <select required value={form.tradeMethod} onChange={e => update('tradeMethod', e.target.value)} className={inputCls}>
              <option value="">選擇方式</option>
              {TRADE_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
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
