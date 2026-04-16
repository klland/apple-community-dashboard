import { useState } from 'react'
import { APPLE_PRODUCTS, CONDITIONS, TRADE_METHODS, LOCATIONS, MRT_STATIONS, PURCHASE_CHANNELS, COSMETIC_CONDITIONS, WARRANTY_STATUS } from '../data/mockData'

export default function PostPage() {
  const [form, setForm] = useState({
    type: 'sell',
    productId: '',
    storage: '',
    color: '',
    condition: '',
    batteryHealth: '',
    cosmeticCondition: '',
    warrantyStatus: '',
    warrantyMonthsLeft: '',
    purchaseChannel: '',
    price: '',
    tradeMethod: '',
    location: '',
    mrtStation: '',
    contact: '',
    note: '',
  })
  const [generated, setGenerated] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

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

  function generate() {
    if (!form.productId || !form.storage) return
    setLoading(true)
    setTimeout(() => {
      const product = selectedProduct
      const isSell = form.type === 'sell'
      const priceStr = form.price ? `$${Number(form.price).toLocaleString()}` : '面議'
      const locationStr = [form.location, form.mrtStation].filter(Boolean).join(' ')

      const batteryLine = form.batteryHealth ? `\n電池健康度：${form.batteryHealth}%` : ''
      const cosmeticLine = form.cosmeticCondition ? `\n外觀狀況：${form.cosmeticCondition}` : ''
      const warrantyLine = form.warrantyStatus
        ? `\n保固：${form.warrantyStatus}${form.warrantyMonthsLeft ? `（剩餘約 ${form.warrantyMonthsLeft} 個月）` : ''}`
        : ''
      const channelLine = form.purchaseChannel ? `\n購買管道：${form.purchaseChannel}` : ''
      const noteLine = form.note ? `\n備註：${form.note}` : ''

      let post = ''
      if (isSell) {
        post = `【出售】${product.name} ${form.storage}${form.color ? ' ' + form.color : ''}

成色：${form.condition || '9成新'}${batteryLine}${cosmeticLine}${warrantyLine}${channelLine}
售價：${priceStr}（可小議）
交易方式：${form.tradeMethod || '面議'}${locationStr ? '\n面交地點：' + locationStr : ''}${noteLine}

聯絡：${form.contact || '請私訊'}

⚠️ 個人閒置出售，非商家廣告`
      } else {
        const budget = form.price
          ? `$${Math.round(Number(form.price) * 0.9).toLocaleString()}–$${Number(form.price).toLocaleString()}`
          : '面議'
        post = `【收購】${product.name} ${form.storage}${form.color ? ' ' + form.color : ''}

成色需求：${form.condition || '9成新'}以上${form.batteryHealth ? `\n電池健康度需求：${form.batteryHealth}% 以上` : ''}${form.warrantyStatus ? `\n保固：${form.warrantyStatus}` : ''}
預算：${budget}
交易方式：${form.tradeMethod || '面議'}${locationStr ? '\n面交地點：' + locationStr : ''}${noteLine}

聯絡：${form.contact || '請私訊'}
有意出售請附照片及開價，謝謝！`
      }

      setGenerated(post)
      setLoading(false)
    }, 800)
  }

  function copy() {
    navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">貼文產生器</h1>
      <p className="text-gray-500 mb-8 text-sm">填入資訊，自動生成符合社團格式的貼文</p>

      <div className="space-y-5">
        {/* 類型 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">類型</label>
          <div className="flex gap-2">
            {[['sell','出售'],['buy','收購']].map(([val, label]) => (
              <button key={val} onClick={() => update('type', val)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition ${form.type === val ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 產品 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">產品型號 *</label>
          <select value={form.productId} onChange={e => update('productId', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
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
              <label className="text-sm font-medium text-gray-700 block mb-2">容量／規格</label>
              <select value={form.storage} onChange={e => update('storage', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
                <option value="">選擇容量</option>
                {selectedProduct.storages.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">顏色</label>
              <select value={form.color} onChange={e => update('color', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
                <option value="">選擇顏色</option>
                {selectedProduct.colors.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">成色</label>
            <select value={form.condition} onChange={e => update('condition', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
              <option value="">選擇成色</option>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              電池健康度{isIphone ? '' : '（選填）'}
            </label>
            <div className="flex items-center gap-2">
              <input type="number" min="1" max="100"
                value={form.batteryHealth}
                onChange={e => update('batteryHealth', e.target.value)}
                placeholder="例如 92"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none" />
              <span className="text-sm text-gray-400">%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">外觀損傷狀況</label>
          <select value={form.cosmeticCondition} onChange={e => update('cosmeticCondition', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
            <option value="">選擇損傷狀況</option>
            {COSMETIC_CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none" />
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">購買管道（選填）</label>
          <select value={form.purchaseChannel} onChange={e => update('purchaseChannel', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
            <option value="">選擇購買管道</option>
            {PURCHASE_CHANNELS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">價格（TWD）</label>
            <input type="number" value={form.price} onChange={e => update('price', e.target.value)}
              placeholder="例如 28000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">交易方式</label>
            <select value={form.tradeMethod} onChange={e => update('tradeMethod', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
              <option value="">選擇方式</option>
              {TRADE_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
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
          <label className="text-sm font-medium text-gray-700 block mb-2">聯絡方式</label>
          <input type="text" value={form.contact} onChange={e => update('contact', e.target.value)}
            placeholder="例如：請私訊 / Line: abc123"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">備註（選填）</label>
          <input type="text" value={form.note} onChange={e => update('note', e.target.value)}
            placeholder="例如：附原廠盒、序號可查"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none" />
        </div>

        <button onClick={generate} disabled={!form.productId || !form.storage || loading}
          className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
          {loading ? '生成中...' : '✨ 生成貼文草稿'}
        </button>
      </div>

      {generated && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">生成結果</p>
            <button onClick={copy}
              className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1 rounded-full transition">
              {copied ? '已複製！' : '複製'}
            </button>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{generated}</pre>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">請確認內容後再發佈到社團</p>
        </div>
      )}
    </div>
  )
}
