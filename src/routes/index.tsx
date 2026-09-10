import { Routes, Route } from 'react-router'
import { Home } from '@/pages/Home/Home'
import { Rules } from '@/pages/Rules/Rules'
import { PresetSelect } from '@/pages/PresetSelect/PresetSelect'
import { Battle } from '@/pages/Battle/Battle'
import { BattleResult } from '@/pages/BattleResult/BattleResult'
import { ScrollToTop } from '@/routes/ScrollToTop'

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/preset" element={<PresetSelect />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/battle/result" element={<BattleResult />} />
      </Routes>
    </>
  )
}
