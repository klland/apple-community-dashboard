import { useState } from 'react'
import { AlertCircle, X, Send, ChevronDown } from 'lucide-react'
import { submitReport } from '../lib/supabase'
import { APPLE_PRODUCTS } from '../data/mockData'

const ISSUE_TYPES = ['價格有誤', '產品資訊錯誤', '回收價有誤', '產品不存在', '其他問題']

export default function ReportIssueButton() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ product: '', issueType: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setForm({ product: '', issueType: '', description: '' })
    setDone(false)
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.issueType) return
    setLoading(true)
    setError('')
    try {
      await submitReport({
        product: form.product || null,
        issue_type: form.issueType,
        description: form.description || null,
        resolved: false,
      })
      setDone(true)
      setTimeout(() => { setOpen(false); reset() }, 2500)
    } catch {
      setError('送出失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 浮動按鈕 */}
      <button
        onClick={() => { setOpen(true); reset() }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-200"
      >
        <AlertCircle size={15} className="text-orange-400" />
        發現錯誤？
      </button>

      {/* 遮罩 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) { setOpen(false); reset() } }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-400" />
                <p className="text-[15px] font-semibold text-[#1d1d1f]">回報問題</p>
              </div>
              <button onClick={() => { setOpen(false); reset() }}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {done ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-3">✅</p>
                <p className="text-[15px] font-semibold text-green-700">感謝你的回報！</p>
                <p className="text-[13px] text-gray-400 mt-1">我們會盡快確認並修正</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                {/* 產品（選填） */}
                <div>
                  <label className="text-[12px] font-medium text-gray-500 block mb-1.5">相關產品（選填）</label>
                  <div className="relative">
                    <select
                      value={form.product}
                      onChange={e => setForm(p => ({ ...p, product: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] bg-[#f5f5f7] focus:outline-none focus:border-[#0071e3] focus:bg-white text-[#1d1d1f] appearance-none pr-8"
                    >
                      <option value="">不指定產品</option>
                      {['iPhone','MacBook','iPad','Apple Watch','AirPods','Mac','其他'].map(cat => (
                        <optgroup key={cat} label={cat}>
                          {APPLE_PRODUCTS.filter(p => p.category === cat).map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* 問題類型（必填） */}
                <div>
                  <label className="text-[12px] font-medium text-gray-500 block mb-1.5">問題類型 <span className="text-red-400">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {ISSUE_TYPES.map(t => (
                      <button type="button" key={t}
                        onClick={() => setForm(p => ({ ...p, issueType: t }))}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                          form.issueType === t
                            ? 'bg-[#0071e3] text-white border-[#0071e3]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 描述（選填） */}
                <div>
                  <label className="text-[12px] font-medium text-gray-500 block mb-1.5">補充說明（選填）</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="例如：iPhone 16 Pro 的回收價應該是 NT$20,100"
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] bg-[#f5f5f7] focus:outline-none focus:border-[#0071e3] focus:bg-white text-[#1d1d1f] resize-none placeholder-gray-400"
                  />
                </div>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <button type="submit"
                  disabled={!form.issueType || loading}
                  className="w-full py-3 bg-[#0071e3] text-white rounded-2xl text-[14px] font-medium hover:bg-[#0077ed] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  <Send size={14} />
                  {loading ? '送出中…' : '送出回報'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
