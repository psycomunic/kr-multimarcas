'use client'

import { useRouter } from 'next/navigation'
import { Check, Save } from 'lucide-react'
import { useState, useTransition } from 'react'

import { atualizarPedidoAcao } from '@/app/admin/acoes'
import { Botao } from '@/components/ui/botao'
import { LABEL_STATUS, STATUS_PEDIDO, type Order, type OrderStatus } from '@/lib/types'

export function AcoesPedido({ pedido }: { pedido: Order }) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(pedido.status)
  const [rastreio, setRastreio] = useState(pedido.trackingCode ?? '')
  const [salvo, setSalvo] = useState(false)
  const [pendente, iniciar] = useTransition()

  const mudou = status !== pedido.status || rastreio !== (pedido.trackingCode ?? '')

  function salvar() {
    iniciar(async () => {
      await atualizarPedidoAcao(pedido.id, {
        status,
        trackingCode: rastreio.trim() || null,
      })
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
        />
        <p className="mt-1 text-xs text-ink-muted">
          Envie o código para o cliente no WhatsApp assim que despachar.
        </p>
      </div>

      <Botao onClick={salvar} disabled={!mudou} carregando={pendente} className="w-full">
        {salvo ? (
          <>
            <Check className="h-4 w-4" />
            Salvo!
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Salvar alterações
          </>
        )}
      </Botao>
    </div>
  )
}
