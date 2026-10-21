import { useEffect } from 'react'

/** Mantém a tela acesa enquanto `enabled` for true (quando o navegador suporta). */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        const next = await navigator.wakeLock.request('screen')
        if (cancelled) void next.release()
        else lock = next
      } catch {
        // Bateria fraca ou aba em segundo plano: tentamos de novo ao voltar.
      }
    }
    // O navegador solta o bloqueio quando a aba fica oculta.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void lock?.release()
    }
  }, [enabled])
}
