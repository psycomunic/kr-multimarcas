/**
 * Montagem das mensagens de WhatsApp — o canal onde a venda é fechada.
 *
 * O formato do pedido é fixo e propositalmente legível no app: negrito com
 * asteriscos, um bloco por item e o resumo do cliente no fim.
 */

import { formatNumeroBRL, somenteDigitos } from './format'
import { LABEL_PAGAMENTO, type Order, type Product } from './types'
import { precoFinal } from './types'

/** Monta a URL wa.me com a mensagem já codificada. */
export function linkWhatsApp(numero: string, mensagem: string): string {
  const destino = somenteDigitos(numero)
  return `https://wa.me/${destino}?text=${encodeURIComponent(mensagem)}`
}

/**
 * URL pública do site. Precisa ser um domínio real para o WhatsApp conseguir
 * ler a página e montar a prévia — `localhost` nunca gera imagem.
 */
const urlBase = process.env.NEXT_PUBLIC_SITE_URL || ''

/**
 * Mensagem completa do pedido, no formato oficial da KR Multimarcas.
 *
 * SOBRE A FOTO DO PRODUTO: um link `wa.me?text=` só transporta texto — a API
 * não permite anexar arquivo. A imagem chega pela *prévia de link*: o WhatsApp
 * busca o primeiro link da mensagem, lê as tags Open Graph da página e mostra
 * um cartão com a foto. Por isso cada item leva a URL do seu produto, e a do
 * primeiro item é a que vira a imagem da mensagem.
 */
export function mensagemPedido(pedido: Order): string {
  const linhas: string[] = []

  linhas.push('*NOVO PEDIDO — KR Multimarcas*')
  linhas.push(`#${pedido.code}`)
  linhas.push('')

  for (const item of pedido.items) {
    const totalItem = item.qty * item.unitPrice
    linhas.push(`• ${item.qty}x ${item.name} (${item.brand})`)
    linhas.push(`   Tam ${item.size} · cor ${item.colorName} — R$ ${formatNumeroBRL(totalItem)}`)
    if (item.slug && urlBase) linhas.push(`   ${urlBase}/produto/${item.slug}`)
  }

  linhas.push('')
  linhas.push(`*Subtotal:* R$ ${formatNumeroBRL(pedido.subtotal)}`)
  // O template oficial vai de Subtotal direto para Total; a linha de frete só
  // aparece quando há valor, para o total nunca ficar inexplicado.
  if (pedido.shipping > 0) linhas.push(`*Frete:* R$ ${formatNumeroBRL(pedido.shipping)}`)
  linhas.push(`*Total:* R$ ${formatNumeroBRL(pedido.total)}`)
  linhas.push('')
  linhas.push(`*Cliente:* ${pedido.customerName}`)
  linhas.push(`*WhatsApp:* ${pedido.customerPhone}`)
  linhas.push(`*CEP:* ${pedido.customerCep}`)
  linhas.push(`*Endereço:* ${pedido.customerAddress}`)
  linhas.push(`*Cidade:* ${pedido.customerCity}`)
  linhas.push(`*Pagamento:* ${LABEL_PAGAMENTO[pedido.paymentMethod]}`)
  if (pedido.note?.trim()) linhas.push(`*Obs:* ${pedido.note.trim()}`)
  linhas.push('')
  linhas.push('Aguardo a confirmação. Obrigado! 🛍️')

  return linhas.join('\n')
}

/** "Perguntar no WhatsApp" a partir da página de produto. */
export function mensagemProduto(produto: Product, url?: string): string {
  const preco = formatNumeroBRL(precoFinal(produto))
  const linhas = [
    `Olá! Tenho interesse neste produto da KR Multimarcas:`,
    '',
    `*${produto.name}* (${produto.brand})`,
    `SKU: ${produto.sku}`,
    `Preço: R$ ${preco}`,
  ]
  if (url) linhas.push(url)
  linhas.push('', 'Pode me ajudar com tamanho e disponibilidade?')
  return linhas.join('\n')
}

/** Mensagem genérica do botão flutuante / banner de atendimento. */
export function mensagemAtendimento(nomeLoja = 'KR Multimarcas'): string {
  return `Olá! Vim pelo site da ${nomeLoja} e gostaria de atendimento. 😊`
}

/** Atalho do painel para falar com o cliente de um pedido. */
export function mensagemParaCliente(pedido: Order): string {
  return `Olá, ${pedido.customerName.split(' ')[0]}! Aqui é da KR Multimarcas falando sobre o pedido #${pedido.code}.`
}
