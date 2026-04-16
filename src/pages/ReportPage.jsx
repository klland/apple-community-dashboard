import { useState } from 'react'
import { APPLE_PRODUCTS, CONDITIONS, TRADE_METHODS, LOCATIONS, MRT_STATIONS, PURCHASE_CHANNELS, COSMETIC_CONDITIONS, WARRANTY_STATUS } from '../data/mockData'

export default function ReportPage() {
  const [form, setForm] = useState({
    productId: '',
    storage: '',
    color: '',
    condition: '',
    batteryHealth: '',
    purchaseChannel: '',
    cosmeticCondition: '',
    warrantyStatus: '',
    warrantyMonthsLeft: '',
    price: '',
    tradeMethod: '',
    location: '',
    mrtStation: '',
    note: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const selectedProduct = APPLE_PRODUCTS.find(p => p.id === form.productId)
  const isIphone = selectedProduct?.category === 'iPhone'
  const showWarrantyMonths = form.warrantyStatus === '原廠保固內' || form.warrantyStatus === '延長保固（AppleCare+）'
  const showMRT = form.tradeMethod === '面交' || form.tradeMethod === '面交或郵寄皆可'

  function update(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'productId') { next.storage = ''; next.color = '' }
      return next
    })
  }

  function submit(e) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
    setForm({
      productId: '', storage: '', color: '', condition: '', batteryHealth: '',
      purchaseChannel: '', cosmeticCondition: '', warrantyStatus: '', warrantyMonthsLeft: '',
      price: '', tradeMethod: '', location: '', mrtStation: '', note: '',
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">成交回報</h1>
      <p className="text-gray-500 mb-8 text-sm">填入你的成交資訊，幫助社員掌握真實行情</p>

      {submitted && (
        <div className="mb-6 bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-sm font-semibold text-green-800">感謝你的回報！</p>
          <p className="text-xs text-green-600 mt-1">資料已加入行情資料庫，幫助了其他社員</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        {/* 產品 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">產品型號 *</label>
          <select required value={form.productId} onChange={e => update('productId', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-gray-400">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">容量／規格 *</label>
              <select required value={form.storage} onChange={e => update('storage', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
                <option value="">選擇容量</option>
                {selectedProduct.storages.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">顏色 *</label>
              <select required value={form.color} onChange={e => update('color', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
                <option value="">選擇顏色</option>
                {selectedProduct.colors.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">成色 *</label>
            <select required value={form.condition} onChange={e => update('condition', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
              <option value="">選擇成色</option>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              電池健康度 {isIphone ? '*' : '（選填）'}
            </label>
            <div className="flex items-center gap-2">
              <input type="number" min="1" max="100"
                required={isIphone}
                value={form.batteryHealth}
                onChange={e => update('batteryHealth', e.target.value)}
                placeholder="例如 92"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-gray-400" />
              <span className="text-sm text-gray-400">%</span>
            </div>
          </div>
        </div>

        {/* 外觀損傷 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">外觀損傷狀況</label>
          <select value={form.cosmeticCondition} onChange={e => update('cosmeticCondition', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
            <option value="">選擇損傷狀況</option>
            {COSMETIC_CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* 購買管道 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">購買管道</label>
          <select value={form.purchaseChannel} onChange={e => update('purchaseChannel', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
            <option value="">選擇購買管道</option>
            {PURCHASE_CHANNELS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* 保固 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">保固狀態</label>
            <select value={form.warrantyStatus} onChange={e => update('warrantyStatus', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
              <option value="">選擇保固狀態</option>
              {WARRANTY_STATUS.map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
          {showWarrantyMonths && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">保固剩餘（月）</label>
              <input type="number" min="1" max="36"
                value={form.warrantyMonthsLeft}
                onChange={e => update('warrantyMonthsLeft', e.target.value)}
                placeholder="例如 8"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-gray-400" />
            </div>
          )}
        </div>

        {/* 成交價 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">成交價格（TWD）*</label>
          <input required type="number" value={form.price} onChange={e => update('price', e.target.value)}
            placeholder="例如 28500"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-gray-400" />
        </div>

        {/* 交易方式 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">交易方式 *</label>
          <select required value={form.tradeMethod} onChange={e => update('tradeMethod', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
            <option value="">選擇方式</option>
            {TRADE_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {showMRT && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">面交縣市</label>
              <select value={form.location} onChange={e => update('location', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
                <option value="">選擇縣市</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">面交地點</label>
              <select value={form.mrtStation} onChange={e => update('mrtStation', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
                <option value="">選擇地點</option>
                {MRT_STATIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">備註（選填）</label>
          <input type="text" value={form.note} onChange={e => update('note', e.target.value)}
            placeholder="例如：附原廠盒、序號可查"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-gray-400" />
        </div>

        <button type="submit"
          className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition">
          送出回報
        </button>
      </form>
    </div>
  )
}
