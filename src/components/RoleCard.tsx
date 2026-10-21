import { ROLES } from '../game/roles'
import type { RoleId } from '../game/types'

export function RoleCard({ role, compact = false }: { role: RoleId; compact?: boolean }) {
  const info = ROLES[role]
  const evil = info.team === 'assassins'
  return (
    <div className={`rounded-3xl border-2 p-6 text-center ${evil ? 'border-blood bg-red-950/40' : 'border-moon/60 bg-night-900'}`}>
      <div className={compact ? 'text-4xl' : 'text-7xl'}>{info.emoji}</div>
      <h2 className={`mt-2 font-bold ${compact ? 'text-xl' : 'text-3xl'} ${evil ? 'text-blood' : 'text-moon'}`}>{info.name}</h2>
      {!compact && <p className="mt-3 text-slate-300">{info.description}</p>}
    </div>
  )
}
