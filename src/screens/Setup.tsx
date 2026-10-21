import { useState } from 'react'
import { Button, Card, Screen } from '../components/ui'
import { MAX_PLAYERS, ROLES, validateSetup } from '../game/roles'
import type { RoleCounts } from '../game/types'
import { useStore } from '../store'

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-lg">{label}</span>
      <div className="flex items-center gap-3">
        <button className="size-10 rounded-full bg-night-800 text-xl disabled:opacity-30" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`Menos ${label}`}>
          −
        </button>
        <span className="w-6 text-center text-xl font-semibold">{value}</span>
        <button className="size-10 rounded-full bg-night-800 text-xl disabled:opacity-30" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`Mais ${label}`}>
          +
        </button>
      </div>
    </div>
  )
}

export function Setup() {
  const { setup, updateSetup, startGame } = useStore()
  const { names, counts, autoCounts, settings } = setup
  const [tried, setTried] = useState(false)
  const error = validateSetup(names, counts)
  const citizens = names.length - counts.assassin - counts.detective - counts.doctor

  const setName = (i: number, v: string) => updateSetup({ names: names.map((n, j) => (j === i ? v : n)) })
  const setCount = (role: keyof RoleCounts, v: number) => updateSetup({ autoCounts: false, counts: { ...counts, [role]: v } })

  return (
    <Screen
      title="🌙 Cidade Dorme"
      subtitle="Um celular, todo mundo junto na mesa."
      footer={
        <>
          {tried && error && <p className="text-center text-sm text-blood">{error}</p>}
          <Button onClick={() => (error ? setTried(true) : startGame())}>Começar jogo</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-300">Jogadores ({names.length})</h2>
          <ul className="flex flex-col gap-2">
            {names.map((name, i) => (
              <li key={i} className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder={`Jogador ${i + 1}`}
                  maxLength={20}
                  enterKeyHint="next"
                  className="min-h-12 min-w-0 flex-1 rounded-xl bg-night-800 px-4 text-lg outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-moon"
                />
                <button
                  className="size-12 shrink-0 rounded-xl bg-night-800 text-slate-400"
                  onClick={() => updateSetup({ names: names.filter((_, j) => j !== i) })}
                  aria-label={`Remover jogador ${i + 1}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          {names.length < MAX_PLAYERS && (
            <Button variant="secondary" className="mt-3" onClick={() => updateSetup({ names: [...names, ''] })}>
              + Adicionar jogador
            </Button>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-semibold text-slate-300">Funções</h2>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" checked={autoCounts} onChange={(e) => updateSetup({ autoCounts: e.target.checked })} className="size-4 accent-amber-200" />
              Automático
            </label>
          </div>
          <Stepper label={`${ROLES.assassin.emoji} Assassinos`} value={counts.assassin} min={1} max={Math.max(1, Math.ceil(names.length / 2) - 1)} onChange={(v) => setCount('assassin', v)} />
          <Stepper label={`${ROLES.detective.emoji} Detetive`} value={counts.detective} min={0} max={1} onChange={(v) => setCount('detective', v)} />
          <Stepper label={`${ROLES.doctor.emoji} Médico`} value={counts.doctor} min={0} max={1} onChange={(v) => setCount('doctor', v)} />
          <div className="flex items-center justify-between py-2 text-slate-400">
            <span className="text-lg">{ROLES.citizen.emoji} Cidadãos</span>
            <span className="w-[6.5rem] text-center text-xl font-semibold">{Math.max(0, citizens)}</span>
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 font-semibold text-slate-300">Regras</h2>
          <label className="flex items-center justify-between py-2">
            <span>Revelar função de quem morre</span>
            <input
              type="checkbox"
              checked={settings.revealRoleOnDeath}
              onChange={(e) => updateSetup({ settings: { ...settings, revealRoleOnDeath: e.target.checked } })}
              className="size-5 accent-amber-200"
            />
          </label>
          <label className="flex items-center justify-between py-2">
            <span>Tempo de discussão</span>
            <select
              value={settings.discussionSeconds}
              onChange={(e) => updateSetup({ settings: { ...settings, discussionSeconds: Number(e.target.value) } })}
              className="rounded-lg bg-night-800 px-3 py-2"
            >
              <option value={0}>Sem limite</option>
              {[60, 120, 180, 300, 600].map((s) => (
                <option key={s} value={s}>
                  {s / 60} min
                </option>
              ))}
            </select>
          </label>
        </Card>
      </div>
    </Screen>
  )
}
