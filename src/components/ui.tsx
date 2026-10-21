import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-moon text-night-950 active:bg-amber-100',
  secondary: 'bg-night-800 text-slate-100 active:bg-night-700',
  danger: 'bg-blood text-white active:bg-red-700',
  ghost: 'bg-transparent text-slate-300 active:bg-night-800',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`min-h-12 w-full rounded-2xl px-4 py-3 text-lg font-semibold transition-colors disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

/** Layout de tela cheia: conteúdo rolável e ações fixas no rodapé. */
export function Screen({ title, subtitle, children, footer }: { title?: ReactNode; subtitle?: ReactNode; children?: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-4 pt-2">
      {(title || subtitle) && (
        <header className="pb-4 pt-2 text-center">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {subtitle && <p className="mt-1 text-slate-400">{subtitle}</p>}
        </header>
      )}
      <main className="flex-1 overflow-y-auto pb-4">{children}</main>
      {footer && <footer className="flex flex-col gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">{footer}</footer>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-night-900 p-4 ${className}`}>{children}</div>
}

export function PlayerList<T extends { id: string; name: string }>({
  players,
  selectedId,
  onSelect,
  render,
}: {
  players: T[]
  selectedId?: string
  onSelect: (id: string) => void
  render?: (p: T) => ReactNode
}) {
  return (
    <ul className="flex flex-col gap-2">
      {players.map((p) => (
        <li key={p.id}>
          <button
            onClick={() => onSelect(p.id)}
            className={`flex min-h-14 w-full items-center justify-between rounded-2xl px-4 text-left text-lg transition-colors ${
              selectedId === p.id ? 'bg-moon font-semibold text-night-950' : 'bg-night-900 active:bg-night-800'
            }`}
          >
            <span>{p.name}</span>
            {render?.(p)}
          </button>
        </li>
      ))}
    </ul>
  )
}
