import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchX } from 'lucide-react'

import { CardProduto } from '@/components/loja/card-produto'
import { FiltrosCatalogo } from '@/components/loja/filtros-catalogo'
import { BotaoLink } from '@/components/ui/botao'
import { cn } from '@/lib/cn'
import { buscarColecao, COLECOES } from '@/lib/colecoes'
import { listarCatalogo, type Ordenacao } from '@/lib/repo'
import {
  CATEGORIAS,
  GENEROS,
  LABEL_CATEGORIA,
  LABEL_GENERO,
  type Category,
  type Gender,
} from '@/lib/types'

// A página inteira depende de searchParams — sempre renderizada sob demanda.
export const dynamic = 'force-dynamic'

type Busca = Record<string, string | string[] | undefined>

const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

function lerFiltros(searchParams: Busca) {
  const genero = primeiro(searchParams.genero)
  const categoria = primeiro(searchParams.categoria)
  const ordem = primeiro(searchParams.ordem)
  const colecao = buscarColecao(primeiro(searchParams.colecao))

  return {
    colecao: colecao?.slug,
    dadosColecao: colecao,
    genero: GENEROS.includes(genero as Gender) ? (genero as Gender) : undefined,
    categoria: CATEGORIAS.includes(categoria as Category) ? (categoria as Category) : undefined,
    busca: primeiro(searchParams.q) || undefined,
    tamanhos: (primeiro(searchParams.tamanhos) ?? '').split(',').filter(Boolean),
    precoMax: primeiro(searchParams.max) ? Number(primeiro(searchParams.max)) : undefined,
    somenteOfertas: primeiro(searchParams.ofertas) === '1',
    ordenacao: (['relevancia', 'novidades', 'menor-preco', 'maior-preco'].includes(ordem ?? '')
      ? ordem
      : 'relevancia') as Ordenacao,
    pagina: Math.max(1, Number(primeiro(searchParams.pagina) ?? 1) || 1),
    porPagina: 12,
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Busca
}): Promise<Metadata> {
  const f = lerFiltros(searchParams)
  const partes = [
    f.genero ? LABEL_GENERO[f.genero] : null,
    f.categoria ? LABEL_CATEGORIA[f.categoria] : null,
  ].filter(Boolean)

  const titulo = f.dadosColecao
    ? f.dadosColecao.titulo
    : f.busca
      ? `Busca por "${f.busca}"`
      : partes.length
        ? partes.join(' · ')
        : 'Catálogo completo'

  return {
    title: titulo,
    description: `Confira ${titulo.toLowerCase()} na KR Multimarcas. Escolha no site e finalize pelo WhatsApp.`,
    alternates: { canonical: '/loja' },
  }
}

export default async function PaginaCatalogo({ searchParams }: { searchParams: Busca }) {
  const filtros = lerFiltros(searchParams)
  const resultado = await listarCatalogo(filtros)

  const tituloPagina =
    filtros.dadosColecao?.titulo ??
    (filtros.busca
      ? `Resultados para “${filtros.busca}”`
      : [
          filtros.genero ? LABEL_GENERO[filtros.genero] : null,
          filtros.categoria ? LABEL_CATEGORIA[filtros.categoria] : null,
        ]
          .filter(Boolean)
          .join(' · ') || (filtros.somenteOfertas ? 'Ofertas' : 'Todo o catálogo'))

  /** Constrói o href de uma página mantendo os filtros atuais. */
  function hrefPagina(pagina: number) {
    const params = new URLSearchParams()
    for (const [chave, valor] of Object.entries(searchParams)) {
      const v = primeiro(valor)
      if (v) params.set(chave, v)
    }
    params.set('pagina', String(pagina))
    return `/loja?${params}`
  }

  return (
    <div className="container-kr py-8 sm:py-12">
      <nav aria-label="Trilha de navegação" className="mb-4 text-xs text-ink-muted">
        <Link href="/" className="transition hover:text-ink">
          Início
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-text">{tituloPagina}</span>
      </nav>

      <h1 className="font-display text-2xl font-bold sm:text-3xl">{tituloPagina}</h1>
      {filtros.dadosColecao && (
        <p className="mt-1.5 text-sm text-ink-text">{filtros.dadosColecao.descricao}</p>
      )}

      {/* Trilho de coleções — atalho entre as categorias da loja */}
      <nav
        aria-label="Coleções"
        className="scroll-suave -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        {COLECOES.map((colecao) => {
          const ativa = filtros.colecao === colecao.slug
          return (
            <Link
              key={colecao.slug}
              href={ativa ? '/loja' : `/loja?colecao=${colecao.slug}`}
              aria-current={ativa ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 shrink-0 items-center rounded-xl border px-3.5 text-sm font-medium transition',
                ativa
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white text-ink-text hover:border-ink/30',
              )}
            >
              {colecao.titulo}
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <FiltrosCatalogo
            facetas={{ tamanhos: resultado.tamanhos, precoMaximo: resultado.precoMaximo }}
            total={resultado.total}
          />
        </div>

        <div>
          {resultado.itens.length === 0 ? (
            <div className="card-kr flex flex-col items-center gap-4 px-6 py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
                <SearchX className="h-7 w-7 text-ink-muted" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold">Nada encontrado por aqui</p>
                <p className="mt-1.5 max-w-sm text-sm text-ink-text">
                  Tente remover alguns filtros ou buscar por outro termo. Se quiser, a gente procura
                  para você no WhatsApp.
                </p>
              </div>
              <BotaoLink href="/loja" variante="contorno">
                Limpar filtros
              </BotaoLink>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
                {resultado.itens.map((produto, i) => (
                  <CardProduto key={produto.id} produto={produto} prioridade={i < 3} />
                ))}
              </div>

              {resultado.totalPaginas > 1 && (
                <nav
                  aria-label="Paginação"
                  className="mt-12 flex items-center justify-center gap-1.5"
                >
                  {Array.from({ length: resultado.totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <Link
                      key={pagina}
                      href={hrefPagina(pagina)}
                      aria-current={pagina === resultado.pagina ? 'page' : undefined}
                      className={cn(
                        'flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition',
                        pagina === resultado.pagina
                          ? 'border-ink bg-ink text-white'
                          : 'border-line bg-white text-ink-text hover:border-ink/30',
                      )}
                    >
                      {pagina}
                    </Link>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
