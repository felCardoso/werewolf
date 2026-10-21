import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as engine from './game/engine'
import { recommendedRoles } from './game/roles'
import type { GameState, RoleCounts, Settings } from './game/types'

interface SetupDraft {
  names: string[]
  counts: RoleCounts
  /** Quando true, as funções acompanham o número de jogadores automaticamente. */
  autoCounts: boolean
  settings: Settings
}

interface Store {
  setup: SetupDraft
  game: GameState | null
  /** Já viu as regras alguma vez (abre sozinho na primeira visita). */
  seenRules: boolean
  rulesOpen: boolean
  setRulesOpen: (open: boolean) => void
  updateSetup: (patch: Partial<SetupDraft>) => void
  startGame: () => void
  update: (fn: (g: GameState) => GameState) => void
  quitGame: () => void
}

const DEFAULT_NAMES = ['', '', '', '', '']

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      setup: {
        names: DEFAULT_NAMES,
        counts: recommendedRoles(DEFAULT_NAMES.length),
        autoCounts: true,
        settings: engine.DEFAULT_SETTINGS,
      },
      game: null,
      seenRules: false,
      rulesOpen: false,
      setRulesOpen: (open) => set(open ? { rulesOpen: true } : { rulesOpen: false, seenRules: true }),
      updateSetup: (patch) =>
        set(({ setup }) => {
          const next = { ...setup, ...patch }
          if (next.autoCounts) next.counts = recommendedRoles(next.names.length)
          return { setup: next }
        }),
      startGame: () => {
        const { names, counts, settings } = get().setup
        set({ game: engine.createGame(names, counts, settings) })
      },
      update: (fn) => {
        const { game } = get()
        if (game) set({ game: fn(game) })
      },
      quitGame: () => set({ game: null }),
    }),
    {
      name: 'cidade-dorme',
      version: 1,
      partialize: ({ setup, game, seenRules }) => ({ setup, game, seenRules }),
    },
  ),
)

/** Jogo em andamento; só use em telas renderizadas com um jogo ativo. */
export function useGame(): GameState {
  const game = useStore((s) => s.game)
  if (!game) throw new Error('Nenhum jogo em andamento.')
  return game
}
