import type { ReactNode } from 'react'

/** Painel que sobe do rodapé, sobre a tela atual. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-end bg-black/60 animate-fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="mx-auto flex max-h-[90%] w-full max-w-md flex-col rounded-t-3xl bg-night-900 pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-night-800 px-4 py-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="size-10 rounded-full bg-night-800 text-slate-400" aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
