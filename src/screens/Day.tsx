import { useEffect, useState } from 'react'
import { RoleCard } from '../components/RoleCard'
import { Button, Card, PlayerList, Screen } from '../components/ui'
import { alivePlayers, eliminate, getPlayer } from '../game/engine'
import { useGame, useStore } from '../store'

const NOBODY = 'nobody'

function Timer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running || left <= 0) return
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
  }, [running, left])

  useEffect(() => {
    if (left === 0) navigator.vibrate?.([200, 100, 200])
  }, [left])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return (
    <button onClick={() => setRunning((r) => !r)} className="w-full rounded-2xl bg-night-900 py-6 text-center">
      <div className={`text-6xl font-bold tabular-nums ${left === 0 ? 'text-blood' : ''}`}>
        {mm}:{ss}
      </div>
      <div className="mt-1 text-sm text-slate-400">{left === 0 ? 'Tempo esgotado!' : running ? 'Toque para pausar' : 'Pausado — toque para continuar'}</div>
    </button>
  )
}

export function Day() {
  const game = useGame()
  const update = useStore((s) => s.update)
  const [stage, setStage] = useState<'discuss' | 'vote' | 'reveal'>('discuss')
  const [selected, setSelected] = useState<string>()
  const alive = alivePlayers(game)

  const finish = () => update((g) => eliminate(g, selected === NOBODY || !selected ? null : selected))

  if (stage === 'discuss') {
    return (
      <Screen
        title={`💬 Discussão — Dia ${game.round}`}
        subtitle="Quem são os assassinos?"
        footer={<Button onClick={() => setStage('vote')}>Ir para a votação</Button>}
      >
        <div className="flex flex-col gap-4">
          {game.settings.discussionSeconds > 0 && <Timer seconds={game.settings.discussionSeconds} />}
          <Card>
            <p className="mb-2 font-semibold text-slate-300">Vivos ({alive.length})</p>
            <p className="text-slate-400">{alive.map((p) => p.name).join(' · ')}</p>
          </Card>
        </div>
      </Screen>
    )
  }

  if (stage === 'reveal' && selected && selected !== NOBODY) {
    const p = getPlayer(game, selected)
    return (
      <Screen title={`${p.name} foi eliminado`} footer={<Button onClick={finish}>Continuar</Button>}>
        <div className="flex h-full flex-col justify-center">
          <RoleCard role={p.role} />
        </div>
      </Screen>
    )
  }

  const choice = selected === NOBODY ? 'Ninguém será eliminado' : selected ? `Eliminar ${getPlayer(game, selected).name}` : 'Escolha alguém'
  return (
    <Screen
      title="🗳️ Votação"
      subtitle="Votem juntos (mão levantada) e marquem o resultado."
      footer={
        <>
          <Button variant="secondary" onClick={() => setStage('discuss')}>
            Voltar à discussão
          </Button>
          <Button
            variant={selected && selected !== NOBODY ? 'danger' : 'primary'}
            disabled={!selected}
            onClick={() => (selected !== NOBODY && game.settings.revealRoleOnDeath ? setStage('reveal') : finish())}
          >
            {choice}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <PlayerList players={alive} selectedId={selected} onSelect={setSelected} />
        <PlayerList players={[{ id: NOBODY, name: '🤷 Ninguém (empate / pular)' }]} selectedId={selected} onSelect={setSelected} />
      </div>
    </Screen>
  )
}
