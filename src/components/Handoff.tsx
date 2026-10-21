import { Button, Screen } from './ui'

/** Tela neutra exibida entre jogadores, para ninguém ver a tela do outro. */
export function Handoff({ name, hint, onReady }: { name: string; hint?: string; onReady: () => void }) {
  return (
    <Screen footer={<Button onClick={onReady}>Sou {name} — continuar</Button>}>
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl">📱</div>
        <p className="text-slate-400">Passe o celular para</p>
        <p className="text-4xl font-bold text-moon">{name}</p>
        {hint && <p className="max-w-xs text-sm text-slate-500">{hint}</p>}
      </div>
    </Screen>
  )
}
