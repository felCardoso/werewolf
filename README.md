# 🌙 Cidade Dorme

Jogo de dedução social no estilo *Werewolf / Cidade Dorme*, feito como **PWA mobile-first**.
A primeira versão é **multiplayer local**: um único celular passa de mão em mão na mesa.

## Funções

| Função | Time | Ação noturna |
| --- | --- | --- |
| 🔪 Assassino | Assassinos | Escolhe quem morre (com os parceiros; o mais votado morre, empate é sorteado). |
| 🔍 Detetive | Cidade | Investiga um jogador e descobre se é assassino. |
| 💉 Médico | Cidade | Protege um jogador (pode ser ele mesmo), mas não o mesmo duas noites seguidas. |
| 🏠 Cidadão | Cidade | Nenhuma — escolhe um "suspeito" só para disfarçar. |

**Vitória:** a cidade vence quando não sobra nenhum assassino; os assassinos vencem quando são
pelo menos tantos quanto os demais vivos.

## Como funciona no mesmo celular

1. **Configuração** — nomes dos jogadores (4–20), quantidade de cada função (automática ou manual) e regras.
2. **Revelação** — o celular passa por cada jogador, que **segura** a carta para ver a própria função (soltou, escondeu).
3. **Noite** — o celular passa por **todos os jogadores vivos**. Cada um faz sua ação (cidadãos
   também tocam em alguém), então ninguém descobre quem tem poderes pelo tempo ou pela ordem.
4. **Manhã** — o celular vai para o centro da mesa e revela quem morreu.
5. **Dia** — discussão com cronômetro e votação aberta (mão levantada); o resultado é marcado no app.

Durante a partida a tela fica acesa (Wake Lock), uma barra no topo mostra a fase e quantos estão vivos,
o fundo muda entre noite e dia e os mortos aparecem riscados. As regras abrem sozinhas na primeira
visita e ficam no menu ☰.

A partida fica salva no `localStorage`: se a página recarregar, o jogo continua de onde parou
(sempre numa tela neutra de "passe o celular").

## Stack

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Build | **Vite** | Dev server instantâneo, build enxuto. |
| UI | **React 19 + TypeScript** | Ecossistema enorme; tipos protegem as regras do jogo. |
| Estilo | **Tailwind CSS v4** | Mobile-first rápido, sem CSS espalhado. |
| Estado | **Zustand** (`persist`) | Store mínima, persistência em `localStorage` em uma linha. |
| PWA | **vite-plugin-pwa** (Workbox) | Manifest + service worker: instalável e 100% offline. |
| Testes | **Vitest** | Testa o motor do jogo sem navegador. |

O ponto central da arquitetura é o **motor do jogo puro** em [`src/game/engine.ts`](src/game/engine.ts):
funções `(estado, ação) → novo estado`, sem React nem I/O. A UI só chama essas funções.

### Caminho para o online

Como o motor é puro, o mesmo código roda depois num servidor autoritativo:

- **PartyKit / Cloudflare Durable Objects** (uma "sala" por partida, WebSocket) — encaixe mais natural; ou
- **Supabase Realtime** + Edge Functions, se quiser também contas e histórico em Postgres.

Nesse modo o servidor guarda o estado completo e envia a cada jogador apenas a sua visão
(sem as funções dos outros), e cada um joga no próprio celular.

## Desenvolvimento

```bash
npm install
npm run dev        # abre em http://localhost:5173 (e na rede local, para testar no celular)
npm test           # testes do motor
npm run build      # build de produção + service worker
npm run preview    # serve o build (PWA instalável)
```

## Estrutura

```
src/
  game/        motor puro: tipos, funções, regras e testes
  store.ts     Zustand: rascunho da configuração + partida em andamento (persistidos)
  components/  UI compartilhada (botões, tela de "passe o celular", carta de função)
  screens/     uma tela por fase: Setup, Reveal, Night, Morning, Day, GameOver
```
