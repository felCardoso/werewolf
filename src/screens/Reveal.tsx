import { useState } from 'react'
import { Handoff } from '../components/Handoff'
import { RoleCard } from '../components/RoleCard'
import { Button, Screen } from '../components/ui'
import { nextReveal, revealDone, startNight } from '../game/engine'
import { useGame, useStore } from '../store'

export function Reveal() {
  const game = useGame()
  const update = useStore((s) => s.update)
  const [showing, setShowing] = useState(false)

  if (revealDone(game)) {
    return (
      <Screen footer={<Button onClick={() => update(startNight)}>Começar a primeira noite</Button>}>
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="text-6xl">🌙</div>
          <h1 className="text-2xl font-bold">Todos conhecem sua função</h1>
          <p className="max-w-xs text-slate-400">
            À noite, o celular passa por <strong>todos</strong> os jogadores vivos — assim ninguém descobre quem tem poderes.
          </p>
        </div>
      </Screen>
    )
  }

  const player = game.players[game.revealIndex]
  if (!showing) {
    return <Handoff name={player.name} hint="Garanta que ninguém mais está olhando para a tela." onReady={() => setShowing(true)} />
  }

  const partners = player.role === 'assassin' ? game.players.filter((p) => p.role === 'assassin' && p.id !== player.id) : []
  return (
    <Screen
      title={player.name}
      subtitle="Sua função secreta é"
      footer={
        <Button
          onClick={() => {
            setShowing(false)
            update(nextReveal)
          }}
        >
          Entendi — esconder
        </Button>
      }
    >
      <RoleCard role={player.role} />
      {partners.length > 0 && (
        <p className="mt-4 text-center text-slate-300">
          Seus parceiros: <strong className="text-blood">{partners.map((p) => p.name).join(', ')}</strong>
        </p>
      )}
    </Screen>
  )
}
