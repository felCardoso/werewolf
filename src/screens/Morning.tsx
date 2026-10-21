import { RoleCard } from '../components/RoleCard'
import { Button, Screen } from '../components/ui'
import { getPlayer, lastNightEvent, startDay } from '../game/engine'
import { useGame, useStore } from '../store'

export function Morning() {
  const game = useGame()
  const update = useStore((s) => s.update)
  const event = lastNightEvent(game)
  const victim = event?.type === 'killed' ? getPlayer(game, event.playerId) : undefined

  return (
    <Screen
      title={`☀️ Dia ${game.round}`}
      subtitle="A cidade acorda..."
      footer={<Button onClick={() => update(startDay)}>{game.winner ? 'Ver resultado' : 'Começar discussão'}</Button>}
    >
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        {victim ? (
          <>
            <div className="text-6xl">⚰️</div>
            <p className="text-2xl">
              <strong className="text-blood">{victim.name}</strong> foi encontrado morto.
            </p>
            {game.settings.revealRoleOnDeath && (
              <div className="w-full">
                <p className="mb-2 text-slate-400">Era...</p>
                <RoleCard role={victim.role} compact />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-6xl">🕊️</div>
            <p className="text-2xl">A noite foi tranquila. Ninguém morreu.</p>
          </>
        )}
      </div>
    </Screen>
  )
}
