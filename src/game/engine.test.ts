import { describe, expect, it } from 'vitest'
import {
  assassinsTarget,
  createGame,
  currentNightPlayer,
  eliminate,
  getWinner,
  nightDone,
  nightTargets,
  resolveNight,
  startDay,
  startNight,
  submitNightAction,
} from './engine'
import { recommendedRoles, validateSetup } from './roles'
import type { GameState, RoleId } from './types'

const NAMES = ['Ana', 'Bruno', 'Carla', 'Davi', 'Eva', 'Fábio']

/** Cria um jogo com funções fixas, na ordem dos nomes. */
function fixedGame(roles: RoleId[]): GameState {
  const g = createGame(NAMES.slice(0, roles.length), { assassin: 0, detective: 0, doctor: 0 })
  return { ...g, players: g.players.map((p, i) => ({ ...p, role: roles[i] })) }
}

/** Joga a noite inteira: cada jogador escolhe o alvo indicado ou o primeiro válido. */
function playNight(s: GameState, choices: Record<string, string>): GameState {
  let g = startNight(s)
  while (!nightDone(g)) {
    const actor = currentNightPlayer(g)!
    g = submitNightAction(g, choices[actor.id] ?? nightTargets(g, actor)[0].id)
  }
  return g
}

describe('setup', () => {
  it('distribui exatamente as funções pedidas', () => {
    const g = createGame(NAMES, { assassin: 2, detective: 1, doctor: 1 })
    const count = (r: RoleId) => g.players.filter((p) => p.role === r).length
    expect(count('assassin')).toBe(2)
    expect(count('detective')).toBe(1)
    expect(count('doctor')).toBe(1)
    expect(count('citizen')).toBe(2)
    expect(g.phase).toBe('reveal')
  })

  it('recomenda funções conforme o número de jogadores', () => {
    expect(recommendedRoles(4)).toEqual({ assassin: 1, detective: 0, doctor: 1 })
    expect(recommendedRoles(8)).toEqual({ assassin: 2, detective: 1, doctor: 1 })
  })

  it('valida configurações inválidas', () => {
    expect(validateSetup(['a', 'b', 'c'], { assassin: 1, detective: 0, doctor: 0 })).toMatch(/pelo menos/)
    expect(validateSetup(['a', 'b', 'c', 'A'], { assassin: 1, detective: 0, doctor: 0 })).toMatch(/diferentes/)
    expect(validateSetup(['a', 'b', 'c', 'd'], { assassin: 2, detective: 0, doctor: 0 })).toMatch(/demais/)
    expect(validateSetup(['a', 'b', 'c', 'd'], { assassin: 1, detective: 1, doctor: 1 })).toBeNull()
  })
})

describe('noite', () => {
  // p1 assassino, p2 detetive, p3 médico, p4..p6 cidadãos
  const base = fixedGame(['assassin', 'detective', 'doctor', 'citizen', 'citizen', 'citizen'])

  it('todos os vivos passam pelo celular, na ordem', () => {
    const g = startNight(base)
    expect(g.nightOrder).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'])
  })

  it('assassino mata o alvo quando o médico não protege', () => {
    const g = resolveNight(playNight(base, { p1: 'p4', p3: 'p5' }))
    expect(g.players.find((p) => p.id === 'p4')!.alive).toBe(false)
    expect(g.log.at(-1)).toEqual({ round: 1, type: 'killed', playerId: 'p4' })
  })

  it('médico salva o alvo', () => {
    const g = resolveNight(playNight(base, { p1: 'p4', p3: 'p4' }))
    expect(g.players.every((p) => p.alive)).toBe(true)
    expect(g.log.at(-1)).toEqual({ round: 1, type: 'quietNight' })
    expect(g.lastProtectedId).toBe('p4')
  })

  it('médico não pode proteger a mesma pessoa duas noites seguidas', () => {
    const afterFirst = { ...resolveNight(playNight(base, { p1: 'p4', p3: 'p4' })), phase: 'day' as const }
    const night2 = startNight(afterFirst)
    const doctor = night2.players.find((p) => p.role === 'doctor')!
    expect(nightTargets(night2, doctor).map((p) => p.id)).not.toContain('p4')
  })

  it('assassino não pode mirar outro assassino', () => {
    const g = startNight(fixedGame(['assassin', 'assassin', 'doctor', 'citizen', 'citizen', 'citizen']))
    expect(nightTargets(g, g.players[0]).map((p) => p.id)).toEqual(['p3', 'p4', 'p5', 'p6'])
    expect(() => submitNightAction(g, 'p2')).toThrow(/inválido/)
  })

  it('detetive descobre se o alvo é assassino', () => {
    let g = startNight(base)
    g = submitNightAction(g, 'p4') // assassino
    g = submitNightAction(g, 'p1') // detetive investiga o assassino
    expect(g.investigations).toEqual([{ round: 1, targetId: 'p1', isAssassin: true }])
  })

  it('assassinos decidem pelo voto da maioria; empate é sorteado', () => {
    const g = startNight(fixedGame(['assassin', 'assassin', 'assassin', 'citizen', 'citizen', 'citizen', 'citizen']))
    const voted = { ...g, night: { assassinVotes: { p1: 'p4', p2: 'p5', p3: 'p5' } } }
    expect(assassinsTarget(voted)).toBe('p5')
    const tie = { ...g, night: { assassinVotes: { p1: 'p4', p2: 'p5' } } }
    expect(assassinsTarget(tie, () => 0)).toBe('p4')
    expect(assassinsTarget(tie, () => 0.99)).toBe('p5')
  })
})

describe('dia e vitória', () => {
  it('cidade vence quando o último assassino é eliminado', () => {
    const g = startDay(resolveNight(playNight(fixedGame(['assassin', 'doctor', 'citizen', 'citizen']), { p1: 'p3', p2: 'p4' })))
    const end = eliminate(g, 'p1')
    expect(end.phase).toBe('over')
    expect(end.winner).toBe('town')
  })

  it('assassinos vencem quando igualam os demais', () => {
    // 1 assassino x 3: mata 1 à noite (2 restantes), cidade elimina um inocente -> 1x1
    const g = startDay(resolveNight(playNight(fixedGame(['assassin', 'doctor', 'citizen', 'citizen']), { p1: 'p3', p2: 'p2' })))
    expect(g.phase).toBe('day')
    const end = eliminate(g, 'p4')
    expect(end.winner).toBe('assassins')
  })

  it('sem vencedor, o jogo segue para a próxima noite', () => {
    const g = startDay(resolveNight(playNight(fixedGame(['assassin', 'doctor', 'citizen', 'citizen', 'citizen', 'citizen']), {})))
    const next = eliminate(g, null)
    expect(next.phase).toBe('night')
    expect(next.round).toBe(2)
    expect(next.log.at(-1)).toEqual({ round: 1, type: 'noElimination' })
    expect(getWinner(next)).toBeUndefined()
  })

  it('morte na noite pode encerrar o jogo antes do dia', () => {
    const g = resolveNight(playNight(fixedGame(['assassin', 'doctor', 'citizen']), { p1: 'p3', p2: 'p2' }))
    expect(g.winner).toBe('assassins')
    expect(startDay(g).phase).toBe('over')
  })
})
