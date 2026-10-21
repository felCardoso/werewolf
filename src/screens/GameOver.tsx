import { Button, Card, Screen } from '../components/ui'
import { getPlayer } from '../game/engine'
import { ROLES } from '../game/roles'
import type { GameEvent, GameState } from '../game/types'
import { useGame, useStore } from '../store'

function describe(game: GameState, e: GameEvent) {
  switch (e.type) {
    case 'killed':
      return `🌙 Noite ${e.round}: ${getPlayer(game, e.playerId).name} foi morto`
    case 'quietNight':
      return `🌙 Noite ${e.round}: ninguém morreu`
    case 'eliminated':
      return `☀️ Dia ${e.round}: ${getPlayer(game, e.playerId).name} foi eliminado`
    case 'noElimination':
      return `☀️ Dia ${e.round}: ninguém foi eliminado`
  }
}

export function GameOver() {
  const game = useGame()
  const { startGame, quitGame } = useStore()
  const town = game.winner === 'town'

  return (
    <Screen
      footer={
        <>
          <Button onClick={startGame}>Jogar de novo (mesmos jogadores)</Button>
          <Button variant="secondary" onClick={quitGame}>
            Voltar ao início
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="py-6 text-center">
          <div className="text-7xl">{town ? '🏆' : '🔪'}</div>
          <h1 className={`mt-3 text-3xl font-bold ${town ? 'text-moon' : 'text-blood'}`}>{town ? 'A cidade venceu!' : 'Os assassinos venceram!'}</h1>
        </div>
        <Card>
          <h2 className="mb-2 font-semibold text-slate-300">Funções</h2>
          <ul className="flex flex-col gap-1">
            {game.players.map((p) => (
              <li key={p.id} className={`flex justify-between ${p.alive ? '' : 'text-slate-500 line-through'}`}>
                <span>{p.name}</span>
                <span>
                  {ROLES[p.role].emoji} {ROLES[p.role].name}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold text-slate-300">Histórico</h2>
          <ul className="flex flex-col gap-1 text-sm text-slate-400">
            {game.log.map((e, i) => (
              <li key={i}>{describe(game, e)}</li>
            ))}
          </ul>
        </Card>
      </div>
    </Screen>
  )
}
