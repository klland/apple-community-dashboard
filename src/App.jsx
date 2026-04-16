import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import QueryPage from './pages/QueryPage'
import ReportPage from './pages/ReportPage'
import PostPage from './pages/PostPage'
import ComparePage from './pages/ComparePage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<QueryPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/post" element={<PostPage />} />
            <Route path="/compare" element={<ComparePage />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}
