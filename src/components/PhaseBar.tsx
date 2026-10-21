import { useState } from 'react'
import { alivePlayers } from '../game/engine'
import type { GameState } from '../game/types'
import { useStore } from '../store'
import { Sheet } from './Sheet'
import { Button } from './ui'

function phaseLabel(game: GameState) {
  switch (game.phase) {
    case 'reveal':
      return '🎭 Distribuindo funções'
    case 'night':
      return `🌙 Noite ${game.round}`
    case 'morning':
      return `🌅 Amanhecer · Dia ${game.round}`
    case 'day':
      return `☀️ Dia ${game.round}`
    case 'over':
      return '🏁 Fim de jogo'
  }
}

/** Barra fixa no topo: fase atual, jogadores vivos e menu. */
export function PhaseBar({ game }: { game: GameState }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { quitGame, setRulesOpen } = useStore()

  return (
    <>
      <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 pt-2">
        <span className="rounded-full bg-black/30 px-3 py-1.5 text-sm font-semibold">{phaseLabel(game)}</span>
        <span className="text-sm text-slate-400">
          {alivePlayers(game).length}/{game.players.length} vivos
        </span>
        <button onClick={() => setMenuOpen(true)} className="ml-auto size-9 rounded-full bg-black/30 text-lg text-slate-300" aria-label="Menu">
          ☰
        </button>
      </div>
      {menuOpen && (
        <Sheet title="Menu" onClose={() => setMenuOpen(false)}>
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setMenuOpen(false)
                setRulesOpen(true)
              }}
            >
              📖 Como jogar
            </Button>
            {game.phase !== 'over' && (
              <Button variant="danger" onClick={() => confirm('Encerrar a partida atual?') && quitGame()}>
                Encerrar partida
              </Button>
            )}
          </div>
        </Sheet>
      )}
    </>
  )
}
