import { Day } from './screens/Day'
import { GameOver } from './screens/GameOver'
import { Morning } from './screens/Morning'
import { Night } from './screens/Night'
import { Reveal } from './screens/Reveal'
import { Setup } from './screens/Setup'
import { useStore } from './store'

const SCREENS = { reveal: Reveal, night: Night, morning: Morning, day: Day, over: GameOver }

export function App() {
  const phase = useStore((s) => s.game?.phase)
  const quitGame = useStore((s) => s.quitGame)

  if (!phase) return <Setup />
  const Current = SCREENS[phase]
  return (
    <>
      {phase !== 'over' && (
        <button
          onClick={() => confirm('Encerrar a partida atual?') && quitGame()}
          className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 size-9 rounded-full bg-night-900/80 text-slate-500"
          aria-label="Encerrar partida"
        >
          ✕
        </button>
      )}
      <Current />
    </>
  )
}
