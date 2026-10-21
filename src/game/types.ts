export type RoleId = 'assassin' | 'detective' | 'doctor' | 'citizen'

export type Team = 'town' | 'assassins'

export type Phase = 'reveal' | 'night' | 'morning' | 'day' | 'over'

export interface Player {
  id: string
  name: string
  role: RoleId
  alive: boolean
}

export interface RoleCounts {
  assassin: number
  detective: number
  doctor: number
}

export interface Settings {
  /** Mostra a função de quem é eliminado na votação ou morto à noite. */
  revealRoleOnDeath: boolean
  /** Duração da discussão do dia, em segundos. 0 desativa o cronômetro. */
  discussionSeconds: number
}

export interface Investigation {
  round: number
  targetId: string
  isAssassin: boolean
}

export interface NightActions {
  /** Voto de cada assassino: id do assassino -> id do alvo. */
  assassinVotes: Record<string, string>
  doctorTargetId?: string
  detectiveTargetId?: string
}

export type GameEvent =
  | { round: number; type: 'killed'; playerId: string }
  | { round: number; type: 'quietNight' }
  | { round: number; type: 'eliminated'; playerId: string }
  | { round: number; type: 'noElimination' }

export interface GameState {
  phase: Phase
  players: Player[]
  settings: Settings
  /** Número da noite/dia atual, começando em 1. */
  round: number
  /** Índice do jogador vendo a própria função na fase de revelação. */
  revealIndex: number
  /** Ordem de passagem do celular durante a noite (ids de jogadores vivos). */
  nightOrder: string[]
  nightIndex: number
  night: NightActions
  /** Quem o médico protegeu na noite anterior (não pode repetir). */
  lastProtectedId?: string
  investigations: Investigation[]
  log: GameEvent[]
  winner?: Team
}
