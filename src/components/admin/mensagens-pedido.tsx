'use client'

import { Check, CircleAlert, Copy, MessageCircle } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/cn'
import { MODELOS, type ModeloMensagem } from '@/lib/mensagens'
import type { Order } from '@/lib/types'
import { linkWhatsApp } from '@/lib/whatsapp'

/**
 * Mensagens prontas para o cliente. Cada modelo abre a conversa no WhatsApp já
 * com o texto preenchido — o atendente só confere e envia.
 */
export function MensagensPedido({
  pedido,
  nomeLoja,
  destaque,
}: {
  pedido: Order
  nomeLoja: string
  /** id do modelo sugerido pelo status atual, exibido aberto no topo. */
  destaque?: string
}) {
  const [aberto, setAberto] = useState<string | null>(destaque ?? null)
  const [copiado, setCopiado] = useState<string | null>(null)

  // O cliente informa o telefone com DDD; o link precisa do DDI na frente.
  const numeroCliente = `55${pedido.customerPhone}`

  async function copiar(modelo: ModeloMensagem, texto: string) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(modelo.id)
      setTimeout(() => setCopiado(null), 2000)
    } catch {
      // Área de transferência bloqueada: o texto continua visível para seleção.
    }
  }

  return (
    <ul className="divide-y divide-line">
      {MODELOS.map((modelo) => {
        const texto = modelo.corpo(pedido, { storeName: nomeLoja })
        const pendencia = modelo.faltando?.(pedido) ?? null
        const expandido = aberto === modelo.id
        const sugerido = destaque === modelo.id

        return (
          <li key={modelo.id} className={cn(sugerido && 'bg-gold/5')}>
            <button
              type="button"
              onClick={() => setAberto(expandido ? null : modelo.id)}
              aria-expanded={expandido}
              className="flex w-full items-start justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-canvas"
            >
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{modelo.titulo}</span>
                  {sugerido && (
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-ink">
                      SUGERIDA AGORA
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-ink-muted">{modelo.descricao}</span>
              </span>
              <span className="shrink-0 pt-0.5 text-xs text-ink-muted">
                {expandido ? 'fechar' : 'ver'}
              </span>
            </button>

            {expandido && (
              <div className="px-5 pb-4">
                {pendencia && (
                  <p className="mb-3 flex items-start gap-2 rounded-xl bg-warning/10 p-3 text-xs text-ink-text">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    {pendencia}
                  </p>
                )}

                <pre className="scroll-suave max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-canvas p-3.5 font-sans text-xs leading-relaxed text-ink-text">
                  {texto}
                </pre>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={linkWhatsApp(numeroCliente, texto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-[#052E16] transition hover:bg-[#1FBF5B]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar no WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => copiar(modelo, texto)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-medium transition hover:border-ink/30"
                  >
                    {copiado === modelo.id ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar texto
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
