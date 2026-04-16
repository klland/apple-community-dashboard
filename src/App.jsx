import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import QueryPage from './pages/QueryPage'
import ReportPage from './pages/ReportPage'
import PostPage from './pages/PostPage'
import ComparePage from './pages/ComparePage'
import AdminPage from './pages/AdminPage'

function AppRoutes() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<QueryPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return <AppRoutes />
}
