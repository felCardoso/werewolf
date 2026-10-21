import { useState, type ReactNode } from 'react'

/** Mostra o conteúdo só enquanto o jogador mantém o dedo na tela. */
export function HoldToReveal({ children, onReveal }: { children: ReactNode; onReveal?: () => void }) {
  const [holding, setHolding] = useState(false)
  const hide = () => setHolding(false)

  return (
    <div
      role="button"
      aria-label="Segure para ver sua função"
      className="grid min-h-80 cursor-pointer touch-none select-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        setHolding(true)
        onReveal?.()
      }}
      onPointerUp={hide}
      onPointerCancel={hide}
      onContextMenu={(e) => e.preventDefault()}
    >
      {holding ? (
        <div className="animate-fade-in">{children}</div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-night-700 bg-night-900 p-6 text-center">
          <div className="text-6xl">👆</div>
          <p className="text-xl font-semibold">Segure aqui para ver</p>
          <p className="text-sm text-slate-400">Solte para esconder de novo.</p>
        </div>
      )}
    </div>
  )
}
