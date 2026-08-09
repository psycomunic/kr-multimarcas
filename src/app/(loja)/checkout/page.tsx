import type { Metadata } from 'next'
import Link from 'next/link'

import { FormularioCheckout } from '@/components/loja/formulario-checkout'

export const metadata: Metadata = {
  title: 'Finalizar pedido',
  description: 'Preencha seus dados e finalize o pedido pelo WhatsApp.',
  robots: { index: false },
}

export default function PaginaCheckout() {
  return (
    <div className="container-kr py-8 sm:py-12">
      <nav aria-label="Trilha de navegação" className="mb-4 text-xs text-ink-muted">
        <Link href="/carrinho" className="transition hover:text-ink">
          Sacola
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-text">Finalizar</span>
      </nav>

      <h1 className="font-display text-2xl font-bold sm:text-3xl">Finalizar pedido</h1>
      <p className="mt-1.5 text-sm text-ink-text">
        Preencha seus dados. O pedido chega prontinho na nossa conversa do WhatsApp.
      </p>

      <FormularioCheckout />
    </div>
  )
}
