import { useState } from 'react'
import { APPLE_PRODUCTS, TRADE_METHODS, PURCHASE_CHANNELS, COSMETIC_CONDITIONS, WARRANTY_STATUS } from '../data/mockData'
import { submitTransaction } from '../lib/supabase'
import SelectOrInput from '../components/SelectOrInput'

const inputCls = "w-full px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.1)] text-[15px] bg-[#f5f5f7] focus:outline-none focus:border-[#0071e3] focus:bg-white text-[#1d1d1f] transition-all placeholder-[#6e6e73]"
const labelCls = "text-[13px] font-medium text-[#1d1d1f] block mb-1.5"

function QuickTemplate({ label, text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-start justify-between gap-3 bg-[#f5f5f7] rounded-2xl px-4 py-3.5 border border-[rgba(0,0,0,0.05)]">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1d1d1f] mb-1">{label}</p>
        <p className="text-[12px] text-[#6e6e73] leading-relaxed line-clamp-2">{text}</p>
      </div>
      <button onClick={copy}
        className={`shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
          copied
            ? 'bg-[#34c759] text-white'
            : 'bg-white text-[#0071e3] border border-[rgba(0,113,227,0.3)] hover:border-[#0071e3]'
        }`}>
        {copied ? '已複製' : '複製'}
      </button>
    </div>
  )
}

export default function PostPage() {
  const [form, setForm] = useState({
    type: 'sell',
    productId: '',
    customModel: '',
    storage: '',
    color: '',
    batteryHealth: '',
    cosmeticCondition: '',
    warrantyStatus: '',
    warrantyMonthsLeft: '',
    purchaseChannel: '',
    price: '',
    tradeMethod: '',
    contact: '',
    note: '',
  })
  const [generated, setGenerated] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectedProduct = APPLE_PRODUCTS.find(p => p.id === form.productId)
  const isOtherModel = form.productId === '__other__'
  const isIphone = selectedProduct?.category === 'iPhone'
  const showWarrantyMonths = form.warrantyStatus === '原廠保固內' || form.warrantyStatus === '延長保固（AppleCare+）'
  const modelName = isOtherModel ? form.customModel : (selectedProduct?.name ?? '')
  const canGenerate = modelName && form.storage && !loading

  function update(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'productId') { next.storage = ''; next.color = ''; next.customModel = '' }
      return next
    })
  }

  function handleModelSelect(e) {
    const v = e.target.value
    setForm(prev => ({ ...prev, productId: v, storage: '', color: '', customModel: '' }))
  }

  async function generate() {
    if (!canGenerate) return
    setLoading(true)
    const isSell = form.type === 'sell'

    if (form.price && isSell && selectedProduct) {
      submitTransaction({
        model: modelName,
        storage: form.storage,
        color: form.color || null,
        condition: null,
        battery_health: form.batteryHealth ? parseInt(form.batteryHealth) : null,
        has_damage: form.cosmeticCondition !== '' && form.cosmeticCondition !== '無損傷',
        purchase_channel: form.purchaseChannel,
        warranty_status: form.warrantyStatus,
        warranty_months: form.warrantyMonthsLeft ? parseInt(form.warrantyMonthsLeft) : null,
        price: parseInt(form.price),
        trade_method: form.tradeMethod,
        location: '',
        source: 'post',
        note: form.note,
      }).catch(() => {})
    }

    setTimeout(() => {
      const priceStr = form.price ? `$${Number(form.price).toLocaleString()}` : '面議'
      const batteryLine = form.batteryHealth ? `\n電池健康度：${form.batteryHealth}%` : ''
      const cosmeticLine = form.cosmeticCondition ? `\n外觀狀況：${form.cosmeticCondition}` : ''
      const warrantyLine = form.warrantyStatus
        ? `\n保固：${form.warrantyStatus}${form.warrantyMonthsLeft ? `（剩餘約 ${form.warrantyMonthsLeft} 個月）` : ''}`
        : ''
      const channelLine = form.purchaseChannel ? `\n購買管道：${form.purchaseChannel}` : ''
      const noteLine = form.note ? `\n備註：${form.note}` : ''

      let post = ''
      if (isSell) {
        post = `【出售】${modelName} ${form.storage}${form.color ? ' ' + form.color : ''}
${batteryLine}${cosmeticLine}${warrantyLine}${channelLine}
售價：${priceStr}（可小議）
交易方式：${form.tradeMethod || '面議'}${noteLine}

聯絡：${form.contact || '請私訊'}

⚠️ 個人閒置出售，非商家廣告`
      } else {
        const budget = form.price
          ? `$${Math.round(Number(form.price) * 0.9).toLocaleString()}–$${Number(form.price).toLocaleString()}`
          : '面議'
        post = `【收購】${modelName} ${form.storage}${form.color ? ' ' + form.color : ''}
${form.batteryHealth ? `\n電池健康度需求：${form.batteryHealth}% 以上` : ''}${form.warrantyStatus ? `\n保固：${form.warrantyStatus}` : ''}
預算：${budget}
交易方式：${form.tradeMethod || '面議'}${noteLine}

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
    <div>
      <section className="bg-[#f5f5f7] pt-14 pb-12 text-center border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[560px] mx-auto px-5">
          <h1 className="text-[40px] font-semibold text-[#1d1d1f] leading-tight tracking-tight mb-2">貼文產生器</h1>
          <p className="text-[17px] text-[#6e6e73] font-light">填入資訊，自動生成符合社團格式的貼文</p>
        </div>
      </section>

      <div className="max-w-[560px] mx-auto px-5 py-12">
        {/* 快速範本庫 */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-3">快速範本（一鍵複製）</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              {
                label: '🎨 指定收購特定顏色',
                text: '【收購】指定收購 iPhone ＿ 系列，顏色限定＿色，容量 ＿G，電池 85% 以上。有意出售者請附照片、電池健康度截圖及開價，謝謝！',
              },
              {
                label: '📱 收購近期型號',
                text: '【收購】徵 iPhone 15 系列以後機型，任何顏色容量皆可，電池健康度 85% 以上，有保固更佳。請附照片及開價，價格合理秒回，謝謝！',
              },
            ].map(({ label, text }) => (
              <QuickTemplate key={label} label={label} text={text} />
            ))}
          </div>
        </div>

        <div className="border-t border-[rgba(0,0,0,0.06)] mb-8" />

        <div className="space-y-5">
          {/* 類型 */}
          <div>
            <label className={labelCls}>類型</label>
            <div className="flex gap-2 p-1 bg-[#f5f5f7] rounded-2xl">
              {[['sell','出售'],['buy','收購']].map(([val, label]) => (
                <button key={val} onClick={() => update('type', val)}
                  className={`flex-1 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                    form.type === val
                      ? 'bg-white text-[#1d1d1f] shadow-sm'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 產品型號 */}
          <div>
            <label className={labelCls}>產品型號 <span className="text-[#ff3b30]">*</span></label>
            <select value={form.productId} onChange={handleModelSelect} className={inputCls}>
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

          {/* 容量 + 顏色 */}
          {(selectedProduct || isOtherModel) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>容量／規格</label>
                <SelectOrInput
                  options={selectedProduct?.storages ?? []}
                  value={form.storage}
                  onChange={v => update('storage', v)}
                  placeholder="輸入容量，例如：256G"
                />
              </div>
              <div>
                <label className={labelCls}>顏色</label>
                <SelectOrInput
                  options={selectedProduct?.colors ?? []}
                  value={form.color}
                  onChange={v => update('color', v)}
                  placeholder="輸入顏色，例如：天藍色"
                />
              </div>
            </div>
          )}

          {/* 電池（iPhone 才顯示） */}
          {isIphone && (
            <div>
              <label className={labelCls}>電池健康度 <span className="text-[#6e6e73]">（選填）</span></label>
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="100"
                  value={form.batteryHealth}
                  onChange={e => update('batteryHealth', e.target.value)}
                  placeholder="例如 92"
                  className="flex-1 px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.1)] text-[15px] bg-[#f5f5f7] focus:outline-none focus:border-[#0071e3] focus:bg-white text-[#1d1d1f] transition-all placeholder-[#6e6e73]" />
                <span className="text-[14px] text-[#6e6e73]">%</span>
              </div>
            </div>
          )}

          {/* 外觀損傷 */}
          <div>
            <label className={labelCls}>外觀損傷狀況</label>
            <SelectOrInput
              options={COSMETIC_CONDITIONS}
              value={form.cosmeticCondition}
              onChange={v => update('cosmeticCondition', v)}
              placeholder="輸入外觀狀況"
            />
          </div>

          {/* 保固 */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* 購買管道 */}
          <div>
            <label className={labelCls}>購買管道 <span className="text-[#6e6e73]">（選填）</span></label>
            <SelectOrInput
              options={PURCHASE_CHANNELS}
              value={form.purchaseChannel}
              onChange={v => update('purchaseChannel', v)}
              placeholder="輸入購買管道"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>價格（TWD）</label>
              <input type="number" value={form.price} onChange={e => update('price', e.target.value)}
                placeholder="例如 28000"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>交易方式</label>
              <SelectOrInput
                options={TRADE_METHODS}
                value={form.tradeMethod}
                onChange={v => update('tradeMethod', v)}
                placeholder="輸入交易方式"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>聯絡方式</label>
            <input type="text" value={form.contact} onChange={e => update('contact', e.target.value)}
              placeholder="例如：請私訊 / Line: abc123"
              className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>備註 <span className="text-[#6e6e73]">（選填）</span></label>
            <input type="text" value={form.note} onChange={e => update('note', e.target.value)}
              placeholder="例如：附原廠盒、序號可查"
              className={inputCls} />
          </div>

          <button onClick={generate} disabled={!canGenerate}
            className="w-full py-3.5 bg-[#0071e3] text-white rounded-2xl text-[15px] font-medium hover:bg-[#0077ed] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
            {loading ? '生成中…' : '生成貼文草稿'}
          </button>
        </div>

        {generated && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-[#1d1d1f]">生成結果</p>
              <button onClick={copy}
                className={`text-[13px] font-medium border px-4 py-1.5 rounded-full transition-all duration-200 ${
                  copied
                    ? 'bg-[#34c759] text-white border-[#34c759]'
                    : 'text-[#0071e3] border-[rgba(0,113,227,0.3)] hover:border-[#0071e3]'
                }`}>
                {copied ? '已複製！' : '複製'}
              </button>
            </div>
            <div className="bg-[#f5f5f7] rounded-2xl p-5 border border-[rgba(0,0,0,0.06)]">
              <pre className="text-[14px] text-[#1d1d1f] whitespace-pre-wrap font-sans leading-relaxed">{generated}</pre>
            </div>
            <p className="text-[12px] text-[#6e6e73] mt-3 text-center">請確認內容後再發佈到社團</p>
          </div>
        )}
      </div>
    </div>
  )
}
