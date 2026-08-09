import type { Metadata } from 'next'
import { CircleCheck, MessageCircle } from 'lucide-react'
import { notFound } from 'next/navigation'

import { BotaoLink } from '@/components/ui/botao'
import { formatBRL } from '@/lib/format'
import { obterConfiguracoes, obterPedidoPorCodigo } from '@/lib/repo'
import { LABEL_PAGAMENTO } from '@/lib/types'
import { linkWhatsApp, mensagemPedido } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pedido enviado',
  robots: { index: false },
}

export default async function PaginaSucesso({ params }: { params: { code: string } }) {
  const [pedido, configuracoes] = await Promise.all([
    obterPedidoPorCodigo(params.code),
    obterConfiguracoes(),
  ])

  if (!pedido) notFound()

  // Reconstruído no servidor: o link continua válido se o cliente recarregar a
  // página ou fechar a aba do WhatsApp sem querer.
  const whatsapp = linkWhatsApp(configuracoes.whatsapp, mensagemPedido(pedido))

  return (
    <div className="container-kr flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-xl">
        <div className="card-kr overflow-hidden">
          <div className="bg-ink-gradient px-6 py-10 text-center text-white">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold">
              <CircleCheck className="h-8 w-8 text-ink" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold">Pedido enviado!</h1>
            <p className="mt-2 text-sm text-white/70">
              Registramos seu pedido{' '}
              <strong className="font-semibold text-gold">#{pedido.code}</strong>. Agora é só
              confirmar com a gente no WhatsApp.
            </p>
          </div>

          <div className="p-6">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] text-sm font-semibold text-[#052E16] transition hover:bg-[#1FBF5B]"
            >
              <MessageCircle className="h-5 w-5" />
              Abrir conversa no WhatsApp
            </a>
            <p className="mt-2.5 text-center text-xs text-ink-muted">
              A conversa já abriu em outra aba? Este botão é o plano B.
            </p>

            <ul className="mt-7 divide-y divide-line border-y border-line">
              {pedido.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {item.qty}x {item.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {item.brand} · Tam {item.size} · {item.colorName}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium">
                    {formatBRL(item.qty * item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 text-sm">
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
              <div className="flex justify-between pt-1 text-xs text-ink-muted">
                <dt>Pagamento</dt>
                <dd>{LABEL_PAGAMENTO[pedido.paymentMethod]}</dd>
              </div>
              <div className="flex justify-between text-xs text-ink-muted">
                <dt>Entrega</dt>
                <dd className="text-right">
                  {pedido.customerAddress} — {pedido.customerCity}, {pedido.customerCep}
                </dd>
              </div>
            </dl>

            <BotaoLink href="/loja" variante="contorno" className="mt-6 w-full">
              Continuar comprando
            </BotaoLink>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-ink-muted">
          Guarde o número <strong className="font-semibold text-ink-text">#{pedido.code}</strong>{' '}
          para acompanhar seu pedido no atendimento.
        </p>
      </div>
    </div>
  )
}
