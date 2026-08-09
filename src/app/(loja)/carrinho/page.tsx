import type { Metadata } from 'next'

import { ConteudoCarrinho } from '@/components/loja/conteudo-carrinho'

export const metadata: Metadata = {
  title: 'Sua sacola',
  description: 'Revise os itens da sua sacola antes de finalizar o pedido pelo WhatsApp.',
  robots: { index: false },
}

export default function PaginaCarrinho() {
  return (
    <div className="container-kr py-8 sm:py-12">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Sua sacola</h1>
      <ConteudoCarrinho />
    </div>
  )
}
