import { Routes, Route } from 'react-router'
import { Home } from '@/pages/Home'
import { Rules } from '@/pages/Rules/Rules'
import { PresetSelect } from '@/pages/PresetSelect/PresetSelect'
import { Battle } from '@/pages/Battle/Battle'
import { BattleResult } from '@/pages/BattleResult/BattleResult'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/preset" element={<PresetSelect />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/battle/result" element={<BattleResult />} />
    </Routes>
  )
}
