import { Info } from 'lucide-react'

import { dbAtivo } from '@/lib/db'

/**
 * Avisa que a loja está rodando sem banco. Some sozinho assim que
 * `DATABASE_URL` é configurada.
 */
export function AvisoDemonstracao({ contexto = 'loja' }: { contexto?: 'loja' | 'admin' }) {
  if (dbAtivo) return null

  return (
    <div className="border-b border-warning/30 bg-warning/10">
      <div className="container-kr flex items-start gap-2.5 py-2.5 text-xs text-ink-text">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Modo demonstração:</strong>{' '}
          {contexto === 'admin'
            ? 'as alterações ficam apenas na memória do servidor e se perdem ao reiniciar. '
            : 'catálogo e pedidos são de exemplo e não são persistidos. '}
          Configure <code className="rounded bg-ink/5 px-1 py-0.5 font-mono">DATABASE_URL</code> no{' '}
          <code className="rounded bg-ink/5 px-1 py-0.5 font-mono">.env</code> para conectar ao
          Supabase.
        </p>
      </div>
    </div>
  )
}
