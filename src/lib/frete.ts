/**
 * Frete — Fase 1.
 *
 * Regra provisória: grátis acima do limite configurado, senão uma tabela
 * simples por região (derivada do primeiro dígito do CEP). Na Fase 2 este
 * módulo é substituído pela cotação real do Melhor Envio, mantendo a mesma
 * assinatura para não mexer no checkout.
 */

import { somenteDigitos } from './format'

export type OpcaoFrete = {
  id: string
  nome: string
  transportadora: string
  preco: number
  prazoDias: number
}

/** Faixas de CEP por região (primeiro dígito). */
function regiaoPorCep(cep: string): 'sudeste' | 'sul' | 'centro-oeste' | 'nordeste' | 'norte' {
  const d = Number(somenteDigitos(cep).charAt(0))
  if (d <= 3) return 'sudeste'
  if (d === 4 || d === 5 || d === 6) return 'nordeste'
  if (d === 7) return 'centro-oeste'
  if (d === 8 || d === 9) return 'sul'
  return 'norte'
}

const TABELA: Record<string, { pac: number; sedex: number; prazoPac: number; prazoSedex: number }> = {
  sudeste: { pac: 24.9, sedex: 39.9, prazoPac: 6, prazoSedex: 3 },
  sul: { pac: 21.9, sedex: 34.9, prazoPac: 5, prazoSedex: 2 },
  'centro-oeste': { pac: 29.9, sedex: 46.9, prazoPac: 8, prazoSedex: 4 },
  nordeste: { pac: 34.9, sedex: 54.9, prazoPac: 10, prazoSedex: 5 },
  norte: { pac: 39.9, sedex: 64.9, prazoPac: 12, prazoSedex: 6 },
}

export type ItemFrete = { weightGrams: number; qty: number }

/**
 * Cotação local. `subtotal` entra no cálculo porque o frete grátis é uma
 * política comercial da loja, não uma característica da transportadora.
 */
export function cotarFrete(params: {
  cepDestino: string
  itens: ItemFrete[]
  subtotal: number
  limiteFreteGratis: number
}): OpcaoFrete[] {
  const cep = somenteDigitos(params.cepDestino)
  if (cep.length !== 8) return []

  const tabela = TABELA[regiaoPorCep(cep)]
  const pesoKg = params.itens.reduce((acc, i) => acc + (i.weightGrams * i.qty) / 1000, 0)
  // Acréscimo por peso acima de 2kg, arredondado por quilo iniciado.
  const excedente = Math.max(0, Math.ceil(pesoKg - 2)) * 6

  const gratis = params.limiteFreteGratis > 0 && params.subtotal >= params.limiteFreteGratis

  return [
    {
      id: 'pac',
      nome: 'PAC',
      transportadora: 'Correios',
      preco: gratis ? 0 : tabela.pac + excedente,
      prazoDias: tabela.prazoPac,
    },
    {
      id: 'sedex',
      nome: 'SEDEX',
      transportadora: 'Correios',
      preco: tabela.sedex + excedente,
      prazoDias: tabela.prazoSedex,
    },
  ]
}

/** Quanto falta para o cliente ganhar frete grátis. */
export function faltaParaFreteGratis(subtotal: number, limite: number): number {
  if (limite <= 0) return 0
  return Math.max(0, limite - subtotal)
}
