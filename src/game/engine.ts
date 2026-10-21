import { ROLES } from './roles'
import type { GameState, Player, RoleCounts, RoleId, Settings, Team } from './types'

export type Rng = () => number

export const DEFAULT_SETTINGS: Settings = {
  revealRoleOnDeath: true,
  discussionSeconds: 180,
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function createGame(
  names: string[],
  counts: RoleCounts,
  settings: Settings = DEFAULT_SETTINGS,
  rng: Rng = Math.random,
): GameState {
  const roles: RoleId[] = [
    ...Array<RoleId>(counts.assassin).fill('assassin'),
    ...Array<RoleId>(counts.detective).fill('detective'),
    ...Array<RoleId>(counts.doctor).fill('doctor'),
  ]
  while (roles.length < names.length) roles.push('citizen')
  const dealt = shuffle(roles, rng)

  const players: Player[] = names.map((name, i) => ({
    id: `p${i + 1}`,
    name: name.trim(),
    role: dealt[i],
    alive: true,
  }))

  return {
    phase: 'reveal',
    players,
    settings,
    round: 1,
    revealIndex: 0,
    nightOrder: [],
    nightIndex: 0,
    night: { assassinVotes: {} },
    investigations: [],
    log: [],
  }
}

export const alivePlayers = (s: GameState) => s.players.filter((p) => p.alive)

export const getPlayer = (s: GameState, id: string) => {
  const p = s.players.find((pl) => pl.id === id)
  if (!p) throw new Error(`Jogador desconhecido: ${id}`)
  return p
}

export function getWinner(s: GameState): Team | undefined {
  const alive = alivePlayers(s)
  const assassins = alive.filter((p) => ROLES[p.role].team === 'assassins').length
  if (assassins === 0) return 'town'
  if (assassins >= alive.length - assassins) return 'assassins'
  return undefined
}

// ---------- Revelação ----------

export function nextReveal(s: GameState): GameState {
  return { ...s, revealIndex: s.revealIndex + 1 }
}

export const revealDone = (s: GameState) => s.revealIndex >= s.players.length

// ---------- Noite ----------

export function startNight(s: GameState): GameState {
  return {
    ...s,
    phase: 'night',
    nightOrder: alivePlayers(s).map((p) => p.id),
    nightIndex: 0,
    night: { assassinVotes: {} },
  }
}

export function currentNightPlayer(s: GameState): Player | undefined {
  const id = s.nightOrder[s.nightIndex]
  return id ? getPlayer(s, id) : undefined
}

/** Alvos válidos para a ação noturna do jogador. */
export function nightTargets(s: GameState, actor: Player): Player[] {
  const alive = alivePlayers(s)
  switch (actor.role) {
    case 'assassin':
      return alive.filter((p) => p.role !== 'assassin')
    case 'doctor':
      return alive.filter((p) => p.id !== s.lastProtectedId)
    case 'detective':
    case 'citizen':
      return alive.filter((p) => p.id !== actor.id)
  }
}

/** Registra a ação do jogador da vez e passa para o próximo. */
export function submitNightAction(s: GameState, targetId: string): GameState {
  const actor = currentNightPlayer(s)
  if (s.phase !== 'night' || !actor) throw new Error('Não é a vez de ninguém agir.')
  if (!nightTargets(s, actor).some((p) => p.id === targetId)) throw new Error('Alvo inválido.')

  let next: GameState = { ...s, nightIndex: s.nightIndex + 1 }
  switch (actor.role) {
    case 'assassin':
      next.night = { ...s.night, assassinVotes: { ...s.night.assassinVotes, [actor.id]: targetId } }
      break
    case 'doctor':
      next.night = { ...s.night, doctorTargetId: targetId }
      break
    case 'detective':
      next.night = { ...s.night, detectiveTargetId: targetId }
      next.investigations = [
        ...s.investigations,
        { round: s.round, targetId, isAssassin: getPlayer(s, targetId).role === 'assassin' },
      ]
      break
    case 'citizen':
      break
  }
  return next
}

export const nightDone = (s: GameState) => s.nightIndex >= s.nightOrder.length

/** Alvo escolhido pelos assassinos: o mais votado; empate é sorteado. */
export function assassinsTarget(s: GameState, rng: Rng = Math.random): string | undefined {
  const tally = new Map<string, number>()
  for (const target of Object.values(s.night.assassinVotes)) {
    tally.set(target, (tally.get(target) ?? 0) + 1)
  }
  if (tally.size === 0) return undefined
  const max = Math.max(...tally.values())
  const top = [...tally.entries()].filter(([, n]) => n === max).map(([id]) => id)
  return top[Math.floor(rng() * top.length)]
}

export function resolveNight(s: GameState, rng: Rng = Math.random): GameState {
  const target = assassinsTarget(s, rng)
  const saved = target !== undefined && target === s.night.doctorTargetId
  const killed = target !== undefined && !saved ? target : undefined

  const next: GameState = {
    ...s,
    phase: 'morning',
    lastProtectedId: s.night.doctorTargetId,
    players: s.players.map((p) => (p.id === killed ? { ...p, alive: false } : p)),
    log: [
      ...s.log,
      killed ? { round: s.round, type: 'killed', playerId: killed } : { round: s.round, type: 'quietNight' },
    ],
  }
  return { ...next, winner: getWinner(next) }
}

/** Evento da última noite resolvida. */
export function lastNightEvent(s: GameState) {
  return [...s.log].reverse().find((e) => e.type === 'killed' || e.type === 'quietNight')
}

// ---------- Dia ----------

export function startDay(s: GameState): GameState {
  return s.winner ? { ...s, phase: 'over' } : { ...s, phase: 'day' }
}

/** Elimina o jogador votado (ou ninguém, com `null`) e encerra o dia. */
export function eliminate(s: GameState, playerId: string | null): GameState {
  if (s.phase !== 'day') throw new Error('A votação só acontece durante o dia.')
  if (playerId !== null && !getPlayer(s, playerId).alive) throw new Error('Jogador já está fora do jogo.')

  const next: GameState = {
    ...s,
    players: s.players.map((p) => (p.id === playerId ? { ...p, alive: false } : p)),
    log: [
      ...s.log,
      playerId ? { round: s.round, type: 'eliminated', playerId } : { round: s.round, type: 'noElimination' },
    ],
  }
  const winner = getWinner(next)
  if (winner) return { ...next, winner, phase: 'over' }
  return startNight({ ...next, round: s.round + 1 })
}
