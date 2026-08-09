import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, MessageCircle, Phone } from 'lucide-react'

import { AcoesPedido } from '@/components/admin/acoes-pedido'
import { MensagensPedido } from '@/components/admin/mensagens-pedido'
import { CartaoPainel } from '@/components/admin/ui-painel'
import { SeloStatus } from '@/components/ui/selo'
import { formatBRL, formatData } from '@/lib/format'
import { modeloDoStatus } from '@/lib/mensagens'
import { obterConfiguracoes, obterPedido } from '@/lib/repo'
import { LABEL_PAGAMENTO } from '@/lib/types'
import { linkWhatsApp, mensagemParaCliente, mensagemPedido } from '@/lib/whatsapp'

export default async function PaginaPedido({ params }: { params: { id: string } }) {
  const [pedido, configuracoes] = await Promise.all([obterPedido(params.id), obterConfiguracoes()])
  if (!pedido) notFound()

  // Conversa com o cliente (número dele), não com a loja.
  const conversaCliente = linkWhatsApp(`55${pedido.customerPhone}`, mensagemParaCliente(pedido))

  return (
    <>
      <Link
        href="/admin/pedidos"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para pedidos
      </Link>

      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">#{pedido.code}</h1>
            <SeloStatus status={pedido.status} />
          </div>
          <p className="mt-1 text-sm text-ink-text">
            Recebido em {formatData(pedido.createdAt)} · canal {pedido.channel}
          </p>
        </div>

        <a
          href={conversaCliente}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-[#052E16] transition hover:bg-[#1FBF5B]"
        >
          <MessageCircle className="h-4 w-4" />
          Falar com o cliente
        </a>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <CartaoPainel titulo="Itens do pedido">
            <ul className="divide-y divide-line">
              {pedido.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium">
                      {item.qty}x {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {item.brand} · Tam {item.size} · {item.colorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatBRL(item.qty * item.unitPrice)}</p>
                    <p className="text-xs text-ink-muted">{formatBRL(item.unitPrice)} un.</p>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-text">Subtotal</dt>
                <dd>{formatBRL(pedido.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-text">Frete</dt>
                <dd>{pedido.shipping === 0 ? 'Grátis' : formatBRL(pedido.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="font-display">{formatBRL(pedido.total)}</dd>
              </div>
            </dl>
          </CartaoPainel>

          <CartaoPainel titulo="Dados do cliente">
            <dl className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-muted">Nome</dt>
                <dd className="mt-0.5 text-sm font-medium">{pedido.customerName}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-muted">
                  <Phone className="h-3 w-3" /> WhatsApp
                </dt>
                <dd className="mt-0.5 text-sm font-medium">{pedido.customerPhone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-muted">
                  <MapPin className="h-3 w-3" /> Entrega
                </dt>
                <dd className="mt-0.5 text-sm">
                  {pedido.customerAddress}
                  <br />
                  {pedido.customerCity} · CEP {pedido.customerCep}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-muted">Pagamento</dt>
                <dd className="mt-0.5 text-sm">{LABEL_PAGAMENTO[pedido.paymentMethod]}</dd>
              </div>
              {pedido.note && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-ink-muted">Observação</dt>
                  <dd className="mt-0.5 whitespace-pre-line text-sm">{pedido.note}</dd>
                </div>
              )}
            </dl>
          </CartaoPainel>
        </div>

        <div className="space-y-6">
          <CartaoPainel titulo="Gestão">
            <div className="p-5">
              <AcoesPedido pedido={pedido} nomeLoja={configuracoes.storeName} />
            </div>
          </CartaoPainel>

          <CartaoPainel titulo="Mensagens para o cliente">
            <MensagensPedido
              pedido={pedido}
              nomeLoja={configuracoes.storeName}
              destaque={modeloDoStatus(pedido.status)?.id}
            />
          </CartaoPainel>

          <CartaoPainel titulo="Mensagem enviada pelo cliente">
            <pre className="scroll-suave overflow-x-auto whitespace-pre-wrap break-words p-5 font-mono text-[11px] leading-relaxed text-ink-text">
              {mensagemPedido(pedido)}
            </pre>
          </CartaoPainel>
        </div>
      </div>
    </>
  )
}
