import { Link, useLocation } from 'react-router-dom'
import { Apple } from 'lucide-react'
import ReportIssueButton from '../ReportIssueButton'

export default function Layout({ children }) {
  const { pathname } = useLocation()

  if (pathname === '/admin') return <>{children}</>

  const navItems = [
    { path: '/', label: '行情查詢' },
    { path: '/report', label: '成交回報' },
    { path: '/post', label: '貼文產生器' },
    { path: '/compare', label: '產品比較' },
  ]

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif" }}>
      <header className="sticky top-0 z-50 bg-[rgba(255,255,255,0.82)] backdrop-blur-2xl border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[980px] mx-auto px-5 flex items-center justify-between h-12">
          <Link to="/" className="flex items-center gap-2 text-[17px] font-semibold text-[#1d1d1f] tracking-tight hover:opacity-75 transition-opacity">
            <Apple size={18} strokeWidth={2} className="text-[#1d1d1f]" />
            蘋果二手行情
          </Link>
          <nav className="flex items-center gap-0">
            {navItems.map(({ path, label }) => (
              <Link key={path} to={path}
                className={`px-4 py-1 text-[13px] rounded-full transition-all duration-200 ${
                  pathname === path
                    ? 'bg-[#1d1d1f] text-white font-medium'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <ReportIssueButton />
    </div>
  )
}
