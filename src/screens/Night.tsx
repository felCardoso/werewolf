import { useState } from 'react'
import { Handoff } from '../components/Handoff'
import { RoleCard } from '../components/RoleCard'
import { Button, Card, PlayerList, Screen } from '../components/ui'
import { currentNightPlayer, getPlayer, nightDone, nightTargets, resolveNight, submitNightAction } from '../game/engine'
import { ROLES } from '../game/roles'
import type { GameState, Player } from '../game/types'
import { useGame, useStore } from '../store'

export function Night() {
  const game = useGame()
  const update = useStore((s) => s.update)
  const actor = currentNightPlayer(game)

  if (nightDone(game) || !actor) {
    return (
      <Screen footer={<Button onClick={() => update((g) => resolveNight(g))}>☀️ Amanhecer</Button>}>
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="text-6xl">🌌</div>
          <h1 className="text-2xl font-bold">A noite acabou</h1>
          <p className="max-w-xs text-slate-400">Coloque o celular no centro da mesa e descubram juntos o que aconteceu.</p>
        </div>
      </Screen>
    )
  }

  // A key reinicia o estado local a cada novo jogador.
  return <NightTurn key={`${game.round}-${game.nightIndex}`} game={game} actor={actor} />
}

function NightTurn({ game, actor }: { game: GameState; actor: Player }) {
  const update = useStore((s) => s.update)
  const [stage, setStage] = useState<'handoff' | 'act' | 'result'>('handoff')
  const [selected, setSelected] = useState<string>()

  if (stage === 'handoff') {
    return <Handoff name={actor.name} hint={`Noite ${game.round}. Todos os outros de olhos fechados!`} onReady={() => setStage('act')} />
  }

  const submit = () => selected && update((g) => submitNightAction(g, selected))

  if (stage === 'result' && selected) {
    const target = getPlayer(game, selected)
    const guilty = target.role === 'assassin'
    return (
      <Screen title="Resultado da investigação" footer={<Button onClick={submit}>Esconder e passar</Button>}>
        <Card className={`text-center ${guilty ? 'border-2 border-blood' : ''}`}>
          <div className="text-6xl">{guilty ? '🔪' : '😇'}</div>
          <p className="mt-3 text-xl">
            <strong>{target.name}</strong> {guilty ? <span className="font-bold text-blood">É um assassino!</span> : 'não é assassino.'}
          </p>
        </Card>
      </Screen>
    )
  }

  const info = ROLES[actor.role]
  const confirm = () => (actor.role === 'detective' ? setStage('result') : submit())

  return (
    <Screen
      title={actor.name}
      subtitle={info.nightPrompt}
      footer={
        <Button disabled={!selected} onClick={confirm}>
          {actor.role === 'detective' ? 'Investigar' : 'Confirmar e passar'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <RoleCard role={actor.role} compact />
        <ActorHints game={game} actor={actor} />
        <PlayerList players={nightTargets(game, actor)} selectedId={selected} onSelect={setSelected} />
      </div>
    </Screen>
  )
}

function ActorHints({ game, actor }: { game: GameState; actor: Player }) {
  if (actor.role === 'assassin') {
    const partners = game.players.filter((p) => p.role === 'assassin' && p.id !== actor.id && p.alive)
    if (partners.length === 0) return null
    return (
      <Card className="text-sm">
        <p className="mb-1 font-semibold text-slate-300">Votos dos parceiros</p>
        {partners.map((p) => {
          const vote = game.night.assassinVotes[p.id]
          return (
            <p key={p.id} className="text-slate-400">
              {p.name}: {vote ? <strong className="text-blood">{getPlayer(game, vote).name}</strong> : 'ainda não votou'}
            </p>
          )
        })}
        <p className="mt-2 text-xs text-slate-500">O mais votado morre. Em caso de empate, sorteio.</p>
      </Card>
    )
  }
  if (actor.role === 'detective' && game.investigations.length > 0) {
    return (
      <Card className="text-sm">
        <p className="mb-1 font-semibold text-slate-300">Suas investigações</p>
        {game.investigations.map((inv) => (
          <p key={inv.round} className="text-slate-400">
            Noite {inv.round}: {getPlayer(game, inv.targetId).name} — {inv.isAssassin ? <strong className="text-blood">assassino</strong> : 'inocente'}
          </p>
        ))}
      </Card>
    )
  }
  if (actor.role === 'doctor' && game.lastProtectedId) {
    return <p className="text-center text-sm text-slate-400">Você protegeu {getPlayer(game, game.lastProtectedId).name} na noite passada e não pode repetir.</p>
  }
  return null
}
