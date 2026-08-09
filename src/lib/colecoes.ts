/**
 * Coleções em destaque — as categorias que a loja realmente vende, com foto
 * própria, exibidas na home e navegáveis em `/loja?colecao=<slug>`.
 *
 * COMO O FILTRO FUNCIONA HOJE: cada coleção casa por `termos`, comparados por
 * OU contra nome, descrição e marca do produto (sem acento, sem caixa). É o que
 * permite as coleções funcionarem sem alterar o banco — basta o nome do produto
 * conter a palavra ("Kit Shorts Boss", "Camiseta Oversized").
 *
 * QUANDO CRESCER: o passo seguinte é um campo `colecao` na tabela `products`,
 * escolhido no painel. Aí o filtro vira exato e para de depender do nome. As
 * telas não mudam — só a origem do filtro.
 *
 * Para trocar uma foto, substitua o arquivo em `/public` mantendo o nome.
 */

export type Colecao = {
  slug: string
  titulo: string
  descricao: string
  imagem: string
  termos: string[]
}

export const COLECOES: Colecao[] = [
  {
    slug: 'kits-de-shorts',
    titulo: 'Kits de shorts',
    descricao: 'Combos com preço melhor',
    imagem: '/cat-kits-de-shorts.jpg',
    termos: ['kit de shorts', 'kit shorts', 'kits de shorts'],
  },
  {
    slug: 'shorts-sport',
    titulo: 'Shorts sport',
    descricao: 'Para treinar e para a rua',
    imagem: '/cat-shorts-sport.jpg',
    termos: ['short sport', 'shorts sport', 'sport'],
  },
  {
    slug: 'shorts',
    titulo: 'Shorts',
    descricao: 'Sarja, linho e tactel',
    imagem: '/cat-shorts.jpg',
    termos: ['short'],
  },
  {
    slug: 'kits',
    titulo: 'Kits',
    descricao: 'Peças que já vêm combinadas',
    imagem: '/cat-kits.jpg',
    termos: ['kit'],
  },
  {
    slug: 'camisetas',
    titulo: 'Camisetas',
    descricao: 'Estampadas e básicas',
    imagem: '/cat-camisetas.jpg',
    termos: ['camiseta', 't-shirt'],
  },
  {
    slug: 'conjuntos',
    titulo: 'Conjuntos',
    descricao: 'Look pronto, sem erro',
    imagem: '/cat-conjuntos.jpg',
    termos: ['conjunto'],
  },
]

export function buscarColecao(slug: string | undefined): Colecao | undefined {
  if (!slug) return undefined
  return COLECOES.find((c) => c.slug === slug)
}
