import type { RoleCounts, RoleId, Team } from './types'

export interface RoleInfo {
  id: RoleId
  name: string
  emoji: string
  team: Team
  description: string
  nightPrompt: string
}

export const ROLES: Record<RoleId, RoleInfo> = {
  assassin: {
    id: 'assassin',
    name: 'Assassino',
    emoji: '🔪',
    team: 'assassins',
    description: 'Toda noite, escolha alguém para eliminar junto com seus parceiros. Engane a cidade durante o dia.',
    nightPrompt: 'Quem você quer eliminar esta noite?',
  },
  detective: {
    id: 'detective',
    name: 'Detetive',
    emoji: '🔍',
    team: 'town',
    description: 'Toda noite, investigue um jogador e descubra se ele é um assassino.',
    nightPrompt: 'Quem você quer investigar?',
  },
  doctor: {
    id: 'doctor',
    name: 'Médico',
    emoji: '💉',
    team: 'town',
    description: 'Toda noite, proteja um jogador (pode ser você). Não pode proteger a mesma pessoa duas noites seguidas.',
    nightPrompt: 'Quem você quer proteger esta noite?',
  },
  citizen: {
    id: 'citizen',
    name: 'Cidadão',
    emoji: '🏠',
    team: 'town',
    description: 'Você não tem poderes especiais. Use a discussão e o voto para encontrar os assassinos.',
    nightPrompt: 'Em quem você desconfia? (só para disfarçar — não tem efeito)',
  },
}

export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 20

export function recommendedRoles(playerCount: number): RoleCounts {
  return {
    assassin: Math.max(1, Math.floor(playerCount / 4)),
    detective: playerCount >= 5 ? 1 : 0,
    doctor: 1,
  }
}

/** Retorna uma mensagem de erro, ou null se a configuração for válida. */
export function validateSetup(names: string[], counts: RoleCounts): string | null {
  const trimmed = names.map((n) => n.trim())
  if (trimmed.length < MIN_PLAYERS) return `São necessários pelo menos ${MIN_PLAYERS} jogadores.`
  if (trimmed.length > MAX_PLAYERS) return `Máximo de ${MAX_PLAYERS} jogadores.`
  if (trimmed.some((n) => n === '')) return 'Todos os jogadores precisam de um nome.'
  const unique = new Set(trimmed.map((n) => n.toLowerCase()))
  if (unique.size !== trimmed.length) return 'Os nomes precisam ser diferentes.'
  if (counts.assassin < 1) return 'É preciso pelo menos 1 assassino.'
  if (counts.assassin * 2 >= trimmed.length) return 'Assassinos demais: eles precisam ser menos da metade dos jogadores.'
  const special = counts.assassin + counts.detective + counts.doctor
  if (special > trimmed.length) return 'Há mais funções do que jogadores.'
  return null
}
