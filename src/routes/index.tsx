import { Routes, Route } from 'react-router'
import { Home } from '@/pages/Home/Home'
import { Rules } from '@/pages/Rules/Rules'
import { PresetSelect } from '@/pages/PresetSelect/PresetSelect'
import { Battle } from '@/pages/Battle/Battle'
import { BattleResult } from '@/pages/BattleResult/BattleResult'
import { NotFound } from '@/pages/NotFound/NotFound'
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
        {/*
          キャッチオール。**消すと存在しないパスが空の画面になる（Issue #154）。**
          vercel.json のSPAフォールバック（Issue #150）でサーバーが404を返さなくなったため、
          どのルートにもマッチしないことをアプリ側で受け止める必要がある。

          react-router v7 の Routes は記述順ではなく**具体度**でマッチを決めるので、
          この行の位置は結果に影響しない（順序依存は v5 の Switch の挙動）。
          読みやすさのために末尾に置いているだけ。
        */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
