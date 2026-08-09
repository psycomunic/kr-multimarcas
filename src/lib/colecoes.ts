/**
 * Categorias da loja — as que a KR realmente vende, com foto própria.
 *
 * Cada produto guarda o slug da sua categoria no campo `colecao` (tabela
 * `products`), escolhido num select do painel. O filtro é exato: nada de
 * adivinhar pelo nome do produto.
 *
 * Para criar uma categoria nova, acrescente um item nesta lista com uma foto
 * em `/public` — ela passa a aparecer no select do painel, no menu da loja e
 * na home automaticamente.
 *
 * A home só exibe categorias que tenham pelo menos um produto ativo, para não
 * levar o cliente a uma página vazia.
 */

export type Colecao = {
  slug: string
  titulo: string
  descricao: string
  imagem: string
}

export const COLECOES: Colecao[] = [
  {
    slug: 'bones',
    titulo: 'Bonés',
    descricao: 'Aba curva, tamanho único',
    imagem: '/produtos/bones/bone-nike-sb.jpeg',
  },
  {
    slug: 'camisetas',
    titulo: 'Camisetas',
    descricao: 'Estampadas e básicas',
    imagem: '/cat-camisetas.jpg',
  },
  {
    slug: 'regatas',
    titulo: 'Regatas',
    descricao: 'Americana e cavada',
    imagem: '/produtos/regata-americana/preta.jpeg',
  },
  {
    slug: 'shorts',
    titulo: 'Shorts',
    descricao: 'Sarja, linho e tactel',
    imagem: '/cat-shorts.jpg',
  },
  {
    slug: 'shorts-sport',
    titulo: 'Shorts sport',
    descricao: 'Para treinar e para a rua',
    imagem: '/cat-shorts-sport.jpg',
  },
  {
    slug: 'kits-de-shorts',
    titulo: 'Kits de shorts',
    descricao: 'Combos com preço melhor',
    imagem: '/cat-kits-de-shorts.jpg',
  },
  {
    slug: 'kits',
    titulo: 'Kits',
    descricao: 'Peças que já vêm combinadas',
    imagem: '/cat-kits.jpg',
  },
  {
    slug: 'conjuntos',
    titulo: 'Conjuntos',
    descricao: 'Look pronto, sem erro',
    imagem: '/cat-conjuntos.jpg',
  },
]

export function buscarColecao(slug: string | null | undefined): Colecao | undefined {
  if (!slug) return undefined
  return COLECOES.find((c) => c.slug === slug)
}

/** Rótulo da categoria para exibição (ou traço quando não houver). */
export function tituloColecao(slug: string | null | undefined): string {
  return buscarColecao(slug)?.titulo ?? '—'
}
