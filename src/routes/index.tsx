import { Routes, Route } from 'react-router'
import { Home } from '@/pages/Home'
import { Rules } from '@/pages/Rules/Rules'
import { PresetSelect } from '@/pages/PresetSelect/PresetSelect'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/preset" element={<PresetSelect />} />
    </Routes>
  )
}
