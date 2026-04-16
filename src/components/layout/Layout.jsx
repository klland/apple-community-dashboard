import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const navItems = [
    { path: '/', label: '行情查詢' },
    { path: '/report', label: '成交回報' },
    { path: '/post', label: '貼文產生器' },
    { path: '/compare', label: '產品比較' },
  ]
  return (
    <div className="min-h-screen bg-white" style={{fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"}}>
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-lg"> 蘋果二手行情</span>
          </div>
          <nav className="flex gap-1">
            {navItems.map(({ path, label }) => (
              <Link key={path} to={path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${pathname === path ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
