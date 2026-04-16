import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import QueryPage from './pages/QueryPage'
import ReportPage from './pages/ReportPage'
import PostPage from './pages/PostPage'
import ComparePage from './pages/ComparePage'

export default function App() {
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
