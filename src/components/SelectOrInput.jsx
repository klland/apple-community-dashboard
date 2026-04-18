import { useState, useEffect } from 'react'

const inputCls = "w-full px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.1)] text-[15px] bg-[#f5f5f7] focus:outline-none focus:border-[#0071e3] focus:bg-white text-[#1d1d1f] transition-all placeholder-[#6e6e73]"

// select + 「其他」自填輸入框二合一元件
// options: string[]  value/onChange: 外部 state  placeholder: 自填提示文字
export default function SelectOrInput({ options, value, onChange, placeholder = '請輸入', required = false }) {
  const isOther = value !== '' && !options.includes(value)
  const [showInput, setShowInput] = useState(isOther)

  useEffect(() => {
    // 外部 reset（value 變回 ''）時收起輸入框
    if (value === '') setShowInput(false)
  }, [value])

  function handleSelect(e) {
    const v = e.target.value
    if (v === '__other__') {
      setShowInput(true)
      onChange('')
    } else {
      setShowInput(false)
      onChange(v)
    }
  }

  return (
    <div className="space-y-2">
      <select
        value={showInput ? '__other__' : value}
        onChange={handleSelect}
        required={required && !showInput}
        className={inputCls}
      >
        <option value="">請選擇</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__other__">其他（自填）</option>
      </select>
      {showInput && (
        <input
          autoFocus
          required={required}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
    </div>
  )
}
