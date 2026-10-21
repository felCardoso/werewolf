import { ROLES } from '../game/roles'
import type { GameState } from '../game/types'

/** Todos os jogadores, com os mortos riscados (e a função, se as regras revelam). */
export function Roster({ game }: { game: GameState }) {
  const sorted = [...game.players].sort((a, b) => Number(b.alive) - Number(a.alive))
  return (
    <ul className="grid grid-cols-2 gap-2">
      {sorted.map((p) => (
        <li
          key={p.id}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 ${p.alive ? 'bg-night-800' : 'bg-black/20 text-slate-500'}`}
        >
          <span>{p.alive ? '🙂' : '☠️'}</span>
          <span className={`min-w-0 flex-1 truncate ${p.alive ? '' : 'line-through'}`}>{p.name}</span>
          {!p.alive && game.settings.revealRoleOnDeath && <span title={ROLES[p.role].name}>{ROLES[p.role].emoji}</span>}
        </li>
      ))}
    </ul>
  )
}
