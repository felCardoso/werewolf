import type { ReactNode } from 'react'
import { ROLES } from '../game/roles'
import { Sheet } from './Sheet'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 font-semibold text-moon">{title}</h3>
      <div className="flex flex-col gap-2 text-slate-300">{children}</div>
    </section>
  )
}

export function Rules({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="📖 Como jogar" onClose={onClose}>
      <Section title="Objetivo">
        <p>
          Assassinos se escondem entre os cidadãos. A <strong>cidade</strong> vence quando elimina todos os assassinos. Os{' '}
          <strong className="text-blood">assassinos</strong> vencem quando ficam em número igual ou maior que os demais vivos.
        </p>
      </Section>

      <Section title="Funções">
        {Object.values(ROLES).map((r) => (
          <p key={r.id}>
            <span className="text-lg">{r.emoji}</span> <strong className={r.team === 'assassins' ? 'text-blood' : ''}>{r.name}</strong> — {r.description}
          </p>
        ))}
      </Section>

      <Section title="Como uma rodada funciona">
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li>
            <strong>Revelação:</strong> o celular passa de mão em mão. Cada um <em>segura</em> a carta para ver a própria função, sem mostrar a ninguém.
          </li>
          <li>
            <strong>🌙 Noite:</strong> o celular passa por <em>todos</em> os vivos, um de cada vez, enquanto os outros fecham os olhos. Cada um escolhe alguém — cidadãos também, para ninguém descobrir quem tem poderes.
          </li>
          <li>
            <strong>🌅 Amanhecer:</strong> coloquem o celular no centro da mesa e vejam quem morreu.
          </li>
          <li>
            <strong>☀️ Dia:</strong> discutam quem parece suspeito. Depois votem de mão levantada e marquem no app quem foi eliminado (ou ninguém).
          </li>
        </ol>
        <p>As rodadas se repetem até um dos times vencer.</p>
      </Section>

      <Section title="Dicas">
        <p>• Quem morre não pode mais falar sobre o jogo — vira espectador.</p>
        <p>• Na sua vez à noite, demore mais ou menos o mesmo tempo que os outros para não se entregar.</p>
        <p>• Assassinos: combinem um alvo pelo olhar durante o dia e vejam os votos dos parceiros à noite.</p>
        <p>• Se a página recarregar, o jogo continua de onde parou.</p>
      </Section>
    </Sheet>
  )
}
