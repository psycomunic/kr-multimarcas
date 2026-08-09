import { NextResponse } from 'next/server'

import { formatCEP, formatTelefone } from '@/lib/format'
import { cotarFrete } from '@/lib/frete'
import { buscarProdutoPorSlug, criarPedido, obterConfiguracoes } from '@/lib/repo'
import { precoFinal } from '@/lib/types'
import { pedidoRequestSchema } from '@/lib/validacao'
import { linkWhatsApp, mensagemPedido } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

/**
 * Fecha o pedido: valida, RECALCULA preços a partir do catálogo, grava com
 * status `novo` e devolve o link do WhatsApp já montado.
 *
 * Ponto sensível: nada de preço, nome ou frete vindo do navegador entra no
 * pedido. O corpo da requisição só informa QUAL produto/variação e a
 * quantidade — todo o resto é resolvido aqui.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = pedidoRequestSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 },
    )
  }

  const dados = parsed.data
  const configuracoes = await obterConfiguracoes()

  const itensPedido: {
    productId: string | null
    slug: string | null
    name: string
    brand: string
    size: string
    colorName: string
    qty: number
    unitPrice: number
  }[] = []
  const itensFrete: { weightGrams: number; qty: number }[] = []
  let subtotal = 0

  for (const item of dados.itens) {
    const produto = await buscarProdutoPorSlug(item.slug)
    if (!produto || !produto.active) {
      return NextResponse.json(
        { erro: `O produto "${item.slug}" não está mais disponível. Atualize a sacola.` },
        { status: 409 },
      )
    }

    const variacao = produto.variants.find(
      (v) => v.size === item.tamanho && v.colorHex === item.corHex,
    )
    if (!variacao) {
      return NextResponse.json(
        { erro: `A variação escolhida de "${produto.name}" não existe mais.` },
        { status: 409 },
      )
    }
    if (variacao.stock < item.quantidade) {
      return NextResponse.json(
        {
          erro: `Restam apenas ${variacao.stock} unidade(s) de "${produto.name}" no tamanho ${variacao.size}.`,
        },
        { status: 409 },
      )
    }

    const unitPrice = precoFinal(produto)
    subtotal += unitPrice * item.quantidade

    itensPedido.push({
      productId: produto.id.startsWith('demo-') ? null : produto.id,
      slug: produto.slug,
      name: produto.name,
      brand: produto.brand,
      size: variacao.size,
      colorName: variacao.colorName,
      qty: item.quantidade,
      unitPrice,
    })
    itensFrete.push({ weightGrams: produto.weightGrams, qty: item.quantidade })
  }

  const opcoes = cotarFrete({
    cepDestino: dados.cep,
    itens: itensFrete,
    subtotal,
    limiteFreteGratis: configuracoes.freeShippingThreshold,
  })
  const escolhida = opcoes.find((o) => o.id === dados.opcaoFrete) ?? opcoes[0]
  const frete = escolhida?.preco ?? 0

  const pedido = await criarPedido({
    customerName: dados.nome,
    customerPhone: formatTelefone(dados.telefone),
    customerCep: formatCEP(dados.cep),
    customerAddress: dados.endereco,
    customerCity: dados.cidade,
    paymentMethod: dados.pagamento,
    note: dados.observacao || null,
    shipping: frete,
    items: itensPedido,
  })

  return NextResponse.json({
    code: pedido.code,
    whatsappUrl: linkWhatsApp(configuracoes.whatsapp, mensagemPedido(pedido)),
  })
}
