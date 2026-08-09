'use client'

import { useRouter } from 'next/navigation'
import { Check, CircleAlert, Save } from 'lucide-react'
import { useState, useTransition } from 'react'

import { atualizarPedidoAcao } from '@/app/admin/acoes'
import { Botao } from '@/components/ui/botao'
import { modeloDoStatus } from '@/lib/mensagens'
import { LABEL_STATUS, STATUS_PEDIDO, type Order, type OrderStatus } from '@/lib/types'
import { linkWhatsApp } from '@/lib/whatsapp'

export function AcoesPedido({ pedido, nomeLoja }: { pedido: Order; nomeLoja: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(pedido.status)
  const [rastreio, setRastreio] = useState(pedido.trackingCode ?? '')
  const [salvo, setSalvo] = useState(false)
  const [pendente, iniciar] = useTransition()

  const mudou = status !== pedido.status || rastreio !== (pedido.trackingCode ?? '')
  const modelo = modeloDoStatus(status)
  const trocouStatus = status !== pedido.status

  // Enviar sem rastreio é possível, mas o cliente fica sem acompanhar.
  const faltaRastreio = status === 'enviado' && !rastreio.trim()

  function salvar() {
    // Abre a aba do WhatsApp já no clique — depois do await o bloqueador de
    // pop-up barraria. Se não houver mensagem para o novo status, fecha.
    const avisar = trocouStatus && Boolean(modelo)
    const janela = avisar ? window.open('', '_blank') : null

    iniciar(async () => {
      const resultado = await atualizarPedidoAcao(pedido.id, {
        status,
        trackingCode: rastreio.trim() || null,
      })

      if (!resultado.ok) {
        janela?.close()
        return
      }

      if (janela && modelo) {
        // Texto montado com os dados já atualizados (rastreio recém-digitado).
        const atualizado: Order = { ...pedido, status, trackingCode: rastreio.trim() || null }
        janela.location.href = linkWhatsApp(
          `55${pedido.customerPhone}`,
          modelo.corpo(atualizado, { storeName: nomeLoja }),
        )
      }

      setSalvo(true)
      router.refresh()
      setTimeout(() => setSalvo(false), 2500)
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label-kr" htmlFor="status">
          Status do pedido
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="input-kr"
        >
          {STATUS_PEDIDO.map((s) => (
            <option key={s} value={s}>
              {LABEL_STATUS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-kr" htmlFor="rastreio">
          Código de rastreio
        </label>
        <input
          id="rastreio"
          value={rastreio}
          onChange={(e) => setRastreio(e.target.value.toUpperCase())}
          placeholder="AA123456789BR"
          className="input-kr font-mono"
          aria-invalid={faltaRastreio}
        />
        {faltaRastreio ? (
          <p className="erro-campo">
            Sem rastreio o cliente não consegue acompanhar a entrega. Você ainda pode salvar.
          </p>
        ) : (
          <p className="mt-1 text-xs text-ink-muted">
            Entra automaticamente na mensagem de “pedido a caminho”.
          </p>
        )}
      </div>

      {trocouStatus && modelo && (
        <p className="flex items-start gap-2 rounded-xl bg-gold/10 p-3 text-xs leading-relaxed text-ink-text">
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
          Ao salvar, o WhatsApp do cliente abre numa nova aba com a mensagem{' '}
          <strong className="font-semibold">“{modelo.titulo}”</strong> pronta para enviar.
        </p>
      )}

      <Botao onClick={salvar} disabled={!mudou} carregando={pendente} className="w-full">
        {salvo ? (
          <>
            <Check className="h-4 w-4" />
            Salvo!
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {trocouStatus && modelo ? 'Salvar e avisar cliente' : 'Salvar alterações'}
          </>
        )}
      </Botao>
    </div>
  )
}
