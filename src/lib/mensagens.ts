/**
 * Modelos de mensagem para o cliente.
 *
 * A loja fala com o cliente pelo WhatsApp, então cada etapa do pedido tem um
 * texto pronto — sem depender de a pessoa lembrar o que escrever nem de
 * digitar código de rastreio errado.
 *
 * Não há envio automático: um link `wa.me` abre a conversa com o texto
 * preenchido e quem envia é o atendente. Envio automático exigiria a WhatsApp
 * Cloud API (conta Meta Business com o número verificado).
 */

import { formatBRL } from './format'
import type { Order, OrderStatus } from './types'

export type ModeloMensagem = {
  id: string
  titulo: string
  descricao: string
  /** Status que dispara a sugestão automática desta mensagem. */
  statusGatilho?: OrderStatus
  /** Marca o texto como incompleto (ex.: falta rastreio) para avisar na tela. */
  faltando?: (pedido: Order) => string | null
  corpo: (pedido: Order, loja: { storeName: string }) => string
}

const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0]

const listaItens = (pedido: Order) =>
  pedido.items
    .map((i) => `• ${i.qty}x ${i.name} — Tam ${i.size} · ${i.colorName}`)
    .join('\n')

export const MODELOS: ModeloMensagem[] = [
  {
    id: 'confirmacao',
    titulo: 'Confirmar pedido recebido',
    descricao: 'Primeira resposta assim que o pedido cai no painel.',
    statusGatilho: 'novo',
    corpo: (p, loja) =>
      [
        `Oi, ${primeiroNome(p.customerName)}! Aqui é da ${loja.storeName}. 😊`,
        '',
        `Recebemos seu pedido *#${p.code}*:`,
        listaItens(p),
        '',
        `Total: *${formatBRL(p.total)}*`,
        '',
        'Está tudo certo? Assim que você confirmar, já separo suas peças.',
      ].join('\n'),
  },
  {
    id: 'pagamento',
    titulo: 'Enviar dados de pagamento',
    descricao: 'Para combinar Pix ou link do cartão.',
    corpo: (p, loja) =>
      [
        `Oi, ${primeiroNome(p.customerName)}!`,
        '',
        `Pedido *#${p.code}* — total de *${formatBRL(p.total)}*.`,
        '',
        'Pode pagar por Pix na chave abaixo ou, se preferir cartão, eu te mando o link de pagamento.',
        '',
        '_(cole aqui a chave Pix da loja)_',
        '',
        `Me manda o comprovante que já dou baixa. Obrigado! — ${loja.storeName}`,
      ].join('\n'),
  },
  {
    id: 'pago',
    titulo: 'Confirmar pagamento',
    descricao: 'Avisa que o comprovante foi conferido.',
    statusGatilho: 'pago',
    corpo: (p, loja) =>
      [
        `${primeiroNome(p.customerName)}, pagamento confirmado! ✅`,
        '',
        `Pedido *#${p.code}* está pago e já entrou na fila de separação.`,
        'Assim que despachar, te mando o código de rastreio por aqui.',
        '',
        `Obrigado pela confiança! — ${loja.storeName}`,
      ].join('\n'),
  },
  {
    id: 'a-caminho',
    titulo: 'Pedido a caminho',
    descricao: 'Enviada quando o status vira Enviado. Inclui o rastreio.',
    statusGatilho: 'enviado',
    faltando: (p) =>
      p.trackingCode?.trim()
        ? null
        : 'Sem código de rastreio — preencha o campo acima antes de enviar.',
    corpo: (p, loja) => {
      const linhas = [
        `Boa notícia, ${primeiroNome(p.customerName)}! 📦`,
        '',
        `Seu pedido *#${p.code}* saiu para entrega e já está a caminho.`,
        '',
        listaItens(p),
        '',
        `*Entrega em:* ${p.customerAddress} — ${p.customerCity}, CEP ${p.customerCep}`,
      ]

      if (p.trackingCode?.trim()) {
        linhas.push(
          '',
          `*Código de rastreio:* ${p.trackingCode.trim()}`,
          'Acompanhe em: https://rastreamento.correios.com.br/app/index.php',
        )
      }

      linhas.push(
        '',
        'Qualquer coisa é só chamar por aqui. 🛍️',
        `— ${loja.storeName}`,
      )
      return linhas.join('\n')
    },
  },
  {
    id: 'entregue',
    titulo: 'Confirmar entrega',
    descricao: 'Fecha o atendimento e pede retorno.',
    statusGatilho: 'entregue',
    corpo: (p, loja) =>
      [
        `${primeiroNome(p.customerName)}, o pedido *#${p.code}* consta como entregue! 🎉`,
        '',
        'Deu tudo certo? Se o tamanho não servir, a troca é fácil — é só me chamar em até 7 dias.',
        '',
        `Se curtir, manda uma foto usando: a gente adora ver. Obrigado! — ${loja.storeName}`,
      ].join('\n'),
  },
  {
    id: 'cancelado',
    titulo: 'Avisar cancelamento',
    descricao: 'Quando o pedido não vai seguir.',
    statusGatilho: 'cancelado',
    corpo: (p, loja) =>
      [
        `Oi, ${primeiroNome(p.customerName)}.`,
        '',
        `O pedido *#${p.code}* foi cancelado.`,
        'Se foi engano ou se quiser retomar, me avisa que eu reservo as peças de novo.',
        '',
        `— ${loja.storeName}`,
      ].join('\n'),
  },
  {
    id: 'sem-estoque',
    titulo: 'Item sem estoque',
    descricao: 'Quando uma peça do pedido acabou.',
    corpo: (p, loja) =>
      [
        `Oi, ${primeiroNome(p.customerName)}, tudo bem?`,
        '',
        `Sobre o pedido *#${p.code}*: infelizmente uma das peças acabou de sair do estoque.`,
        '',
        'Posso trocar por outra cor/tamanho, ou devolver o valor da peça e enviar o restante. Como prefere?',
        '',
        `— ${loja.storeName}`,
      ].join('\n'),
  },
]

/** Modelo sugerido automaticamente ao mudar o pedido para um status. */
export function modeloDoStatus(status: OrderStatus): ModeloMensagem | undefined {
  return MODELOS.find((m) => m.statusGatilho === status)
}

export function buscarModelo(id: string): ModeloMensagem | undefined {
  return MODELOS.find((m) => m.id === id)
}
