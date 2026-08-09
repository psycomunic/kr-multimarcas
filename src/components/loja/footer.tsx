import Link from 'next/link'
import { CreditCard, MapPin, MessageCircle, Truck } from 'lucide-react'

import { Logo } from '@/components/ui/logo'
import type { Colecao } from '@/lib/colecoes'
import { formatBRL } from '@/lib/format'
import type { Settings } from '@/lib/types'
import { linkWhatsApp, mensagemAtendimento } from '@/lib/whatsapp'

const COLUNA_AJUDA = {
    titulo: 'Ajuda',
    links: [
      { rotulo: 'Como comprar', href: '/loja' },
      { rotulo: 'Trocas e devoluções', href: '/loja' },
      { rotulo: 'Prazos de entrega', href: '/loja' },
      { rotulo: 'Formas de pagamento', href: '/loja' },
    ],
}

export function Footer({
  configuracoes,
  categorias,
}: {
  configuracoes: Settings
  categorias: Colecao[]
}) {
  const COLUNAS = [
    {
      titulo: 'Comprar',
      links: [
        ...categorias.map((c) => ({ rotulo: c.titulo, href: `/loja?colecao=${c.slug}` })),
        { rotulo: 'Ofertas', href: '/loja?ofertas=1' },
      ],
    },
    COLUNA_AJUDA,
  ]

  const whatsapp = linkWhatsApp(
    configuracoes.whatsapp,
    mensagemAtendimento(configuracoes.storeName),
  )
  const ano = new Date().getFullYear()

  return (
    <footer className="mt-20 bg-ink text-white">
      {/* Faixa de propostas de valor */}
      <div className="border-b border-white/10">
        <div className="container-kr grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { Icone: MessageCircle, titulo: 'Atendimento no WhatsApp', texto: 'Uma pessoa de verdade te ajuda a escolher.' },
            { Icone: Truck, titulo: 'Envio para todo o Brasil', texto: 'Correios e transportadoras com rastreio.' },
            { Icone: CreditCard, titulo: 'Pix ou cartão', texto: 'Parcelamento combinado no atendimento.' },
            { Icone: MapPin, titulo: 'Troca fácil', texto: 'Até 7 dias após o recebimento.' },
          ].map(({ Icone, titulo, texto }) => (
            <div key={titulo} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Icone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{titulo}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/60">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-kr grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo variante="clara" className="h-12" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Moda multimarcas para quem gosta de peça boa e atendimento direto. Escolha aqui,
            feche no WhatsApp.
          </p>
        </div>

        {COLUNAS.map((coluna) => (
          <nav key={coluna.titulo} aria-label={coluna.titulo}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              {coluna.titulo}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {coluna.links.map((link) => (
                <li key={link.rotulo}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-gold"
                  >
                    {link.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Contato</h3>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-gold-400"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
          <p className="mt-4 text-xs text-white/50">
            Frete grátis nas compras acima de {formatBRL(configuracoes.freeShippingThreshold)}.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-kr flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/45 sm:flex-row">
          <p>
            © {ano} {configuracoes.storeName}. Todos os direitos reservados.
          </p>
          <p>
            Pedidos finalizados via WhatsApp ·{' '}
            <Link href="/admin" className="transition-colors hover:text-gold">
              Painel da loja
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
