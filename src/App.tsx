import { PhaseBar } from './components/PhaseBar'
import { Rules } from './components/Rules'
import { useWakeLock } from './hooks/useWakeLock'
import { Day } from './screens/Day'
import { GameOver } from './screens/GameOver'
import { Morning } from './screens/Morning'
import { Night } from './screens/Night'
import { Reveal } from './screens/Reveal'
import { Setup } from './screens/Setup'
import { useStore } from './store'

const SCREENS = { reveal: Reveal, night: Night, morning: Morning, day: Day, over: GameOver }

export function App() {
  const game = useStore((s) => s.game)
  const showRules = useStore((s) => s.rulesOpen || !s.seenRules)
  const setRulesOpen = useStore((s) => s.setRulesOpen)
  const phase = game?.phase

  useWakeLock(phase !== undefined && phase !== 'over')

  const Current = phase ? SCREENS[phase] : Setup
  return (
    <div data-phase={phase ?? 'setup'} className="phase-bg flex h-full flex-col pt-[env(safe-area-inset-top)]">
      {game && <PhaseBar game={game} />}
      {/* A key reinicia a animação de entrada a cada troca de fase. */}
      <div key={phase} className="min-h-0 flex-1 animate-fade-in">
        <Current />
      </div>
      {showRules && <Rules onClose={() => setRulesOpen(false)} />}
    </div>
  )
}
