'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ItemCarrinho = {
  /** Identidade da linha do carrinho: produto + tamanho + cor. */
  chave: string
  produtoId: string
  slug: string
  sku: string
  nome: string
  marca: string
  imagem: string
  tamanho: string
  corNome: string
  corHex: string
  precoUnitario: number
  precoOriginal: number
  quantidade: number
  estoqueMax: number
  pesoGramas: number
}

type EstadoCarrinho = {
  itens: ItemCarrinho[]
  gavetaAberta: boolean
  adicionar: (item: Omit<ItemCarrinho, 'chave'>) => void
  alterarQuantidade: (chave: string, quantidade: number) => void
  remover: (chave: string) => void
  limpar: () => void
  abrirGaveta: () => void
  fecharGaveta: () => void
}

export const chaveDoItem = (produtoId: string, tamanho: string, corHex: string) =>
  `${produtoId}::${tamanho}::${corHex}`

export const useCarrinho = create<EstadoCarrinho>()(
  persist(
    (set) => ({
      itens: [],
      gavetaAberta: false,

      adicionar: (novo) =>
        set((estado) => {
          const chave = chaveDoItem(novo.produtoId, novo.tamanho, novo.corHex)
          const existente = estado.itens.find((i) => i.chave === chave)

          if (existente) {
            // Nunca ultrapassa o estoque da variação.
            const quantidade = Math.min(existente.quantidade + novo.quantidade, novo.estoqueMax)
            return {
              gavetaAberta: true,
              itens: estado.itens.map((i) => (i.chave === chave ? { ...i, quantidade } : i)),
            }
          }

          return {
            gavetaAberta: true,
            itens: [...estado.itens, { ...novo, chave }],
          }
        }),

      alterarQuantidade: (chave, quantidade) =>
        set((estado) => ({
          itens: estado.itens.map((i) =>
            i.chave === chave
              ? { ...i, quantidade: Math.max(1, Math.min(quantidade, i.estoqueMax)) }
              : i,
          ),
        })),

      remover: (chave) =>
        set((estado) => ({ itens: estado.itens.filter((i) => i.chave !== chave) })),

      limpar: () => set({ itens: [] }),
      abrirGaveta: () => set({ gavetaAberta: true }),
      fecharGaveta: () => set({ gavetaAberta: false }),
    }),
    {
      name: 'kr-carrinho',
      // O estado da gaveta é efêmero — só os itens são persistidos.
      partialize: (estado) => ({ itens: estado.itens }),
    },
  ),
)

export const subtotalCarrinho = (itens: ItemCarrinho[]) =>
  itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0)

export const quantidadeCarrinho = (itens: ItemCarrinho[]) =>
  itens.reduce((acc, i) => acc + i.quantidade, 0)
