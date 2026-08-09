import { NextResponse } from 'next/server'
import { z } from 'zod'

import { cotarFrete } from '@/lib/frete'
import { buscarProdutoPorSlug, obterConfiguracoes } from '@/lib/repo'

export const dynamic = 'force-dynamic'

const corpoSchema = z.object({
  cep: z.string(),
  itens: z.array(z.object({ slug: z.string(), quantidade: z.number().int().positive() })).min(1),
})

/**
 * Cotação de frete do checkout.
 *
 * O peso vem do catálogo no servidor — nunca do navegador — para o cliente não
 * conseguir forjar um frete mais barato. Na Fase 2 esta rota passa a consultar
 * o Melhor Envio e devolve as mesmas `OpcaoFrete`.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = corpoSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ erro: 'Dados inválidos para cotação.' }, { status: 400 })
  }

  const configuracoes = await obterConfiguracoes()

  const itens: { weightGrams: number; qty: number }[] = []
  let subtotal = 0

  for (const item of parsed.data.itens) {
    const produto = await buscarProdutoPorSlug(item.slug)
    if (!produto) continue
    itens.push({ weightGrams: produto.weightGrams, qty: item.quantidade })
    subtotal += (produto.salePrice ?? produto.price) * item.quantidade
  }

  if (itens.length === 0) {
    return NextResponse.json({ erro: 'Nenhum produto válido na sacola.' }, { status: 400 })
  }

  const opcoes = cotarFrete({
    cepDestino: parsed.data.cep,
    itens,
    subtotal,
    limiteFreteGratis: configuracoes.freeShippingThreshold,
  })

  return NextResponse.json({ opcoes })
}
