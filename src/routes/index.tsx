import { Routes, Route } from 'react-router'
import { Home } from '@/pages/Home'
import { Rules } from '@/pages/Rules/Rules'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rules" element={<Rules />} />
    </Routes>
  )
}
