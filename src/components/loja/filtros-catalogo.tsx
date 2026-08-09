'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Funnel, X } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Botao } from '@/components/ui/botao'
import { cn } from '@/lib/cn'
import { formatBRL } from '@/lib/format'
import { CATEGORIAS, GENEROS, LABEL_CATEGORIA, LABEL_GENERO } from '@/lib/types'

export type FacetasCatalogo = {
  tamanhos: string[]
  precoMaximo: number
}

const ORDENACOES = [
  { valor: 'relevancia', rotulo: 'Relevância' },
  { valor: 'novidades', rotulo: 'Novidades' },
  { valor: 'menor-preco', rotulo: 'Menor preço' },
  { valor: 'maior-preco', rotulo: 'Maior preço' },
]

export function FiltrosCatalogo({ facetas, total }: { facetas: FacetasCatalogo; total: number }) {
  const router = useRouter()
  const params = useSearchParams()
  const [abertoMobile, setAbertoMobile] = useState(false)

  const tamanhosSelecionados = (params.get('tamanhos') ?? '').split(',').filter(Boolean)

  /** Atualiza a URL preservando os demais filtros; volta sempre para a página 1. */
  const definir = useCallback(
    (mudancas: Record<string, string | null>) => {
      const novos = new URLSearchParams(params.toString())
      for (const [chave, valor] of Object.entries(mudancas)) {
        if (valor === null || valor === '') novos.delete(chave)
        else novos.set(chave, valor)
      }
      novos.delete('pagina')
      router.push(`/loja${novos.toString() ? `?${novos}` : ''}`, { scroll: false })
    },
    [params, router],
  )

  function alternarTamanho(tamanho: string) {
    const atual = new Set(tamanhosSelecionados)
    if (atual.has(tamanho)) atual.delete(tamanho)
    else atual.add(tamanho)
    definir({ tamanhos: Array.from(atual).join(',') })
  }

  const temFiltro =
    Boolean(params.get('genero')) ||
    Boolean(params.get('categoria')) ||
    Boolean(params.get('q')) ||
    Boolean(params.get('ofertas')) ||
    Boolean(params.get('max')) ||
    tamanhosSelecionados.length > 0

  const precoMax = Number(params.get('max') || facetas.precoMaximo)
  const tetoSlider = Math.max(100, Math.ceil(facetas.precoMaximo / 50) * 50)

  const painel = (
    <div className="space-y-7">
      <Grupo titulo="Gênero">
        <div className="flex flex-wrap gap-2">
          {GENEROS.map((genero) => (
            <Pilula
              key={genero}
              ativo={params.get('genero') === genero}
              onClick={() =>
                definir({ genero: params.get('genero') === genero ? null : genero })
              }
            >
              {LABEL_GENERO[genero]}
            </Pilula>
          ))}
        </div>
      </Grupo>

      <Grupo titulo="Categoria">
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((categoria) => (
            <Pilula
              key={categoria}
              ativo={params.get('categoria') === categoria}
              onClick={() =>
                definir({ categoria: params.get('categoria') === categoria ? null : categoria })
              }
            >
              {LABEL_CATEGORIA[categoria]}
            </Pilula>
          ))}
        </div>
      </Grupo>

      {facetas.tamanhos.length > 0 && (
        <Grupo titulo="Tamanho">
          <div className="flex flex-wrap gap-2">
            {facetas.tamanhos.map((tamanho) => (
              <Pilula
                key={tamanho}
                ativo={tamanhosSelecionados.includes(tamanho)}
                onClick={() => alternarTamanho(tamanho)}
                className="min-w-11 justify-center"
              >
                {tamanho}
              </Pilula>
            ))}
          </div>
        </Grupo>
      )}

      <Grupo titulo="Preço até">
        <input
          type="range"
          min={50}
          max={tetoSlider}
          step={50}
          defaultValue={precoMax}
          onMouseUp={(e) => definir({ max: (e.target as HTMLInputElement).value })}
          onTouchEnd={(e) => definir({ max: (e.target as HTMLInputElement).value })}
          className="w-full accent-gold"
          aria-label="Preço máximo"
        />
        <p className="mt-1.5 text-sm font-medium text-ink">{formatBRL(precoMax)}</p>
      </Grupo>

      <Grupo titulo="Promoções">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-text">
          <input
            type="checkbox"
            checked={params.get('ofertas') === '1'}
            onChange={(e) => definir({ ofertas: e.target.checked ? '1' : null })}
            className="h-4 w-4 rounded border-line accent-gold"
          />
          Mostrar só ofertas
        </label>
      </Grupo>

      {temFiltro && (
        <Botao variante="contorno" tamanho="sm" onClick={() => router.push('/loja')} className="w-full">
          <X className="h-3.5 w-3.5" />
          Limpar filtros
        </Botao>
      )}
    </div>
  )

  return (
    <>
      {/* Barra de controle (mobile + ordenação) */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-text">
          <strong className="font-semibold text-ink">{total}</strong>{' '}
          {total === 1 ? 'produto' : 'produtos'}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAbertoMobile(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-medium lg:hidden"
          >
            <Funnel className="h-4 w-4" />
            Filtros
            {temFiltro && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
          </button>

          <label className="sr-only" htmlFor="ordenacao">
            Ordenar por
          </label>
          <select
            id="ordenacao"
            value={params.get('ordem') ?? 'relevancia'}
            onChange={(e) => definir({ ordem: e.target.value })}
            className="h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            {ORDENACOES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Painel fixo no desktop */}
      <aside className="hidden lg:block">{painel}</aside>

      {/* Painel deslizante no mobile */}
      {abertoMobile && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setAbertoMobile(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Filtros</h2>
              <button
                type="button"
                onClick={() => setAbertoMobile(false)}
                className="rounded-lg p-2 text-ink-muted hover:bg-canvas"
                aria-label="Fechar filtros"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {painel}
            <Botao onClick={() => setAbertoMobile(false)} className="mt-6 w-full" tamanho="lg">
              Ver {total} {total === 1 ? 'produto' : 'produtos'}
            </Botao>
          </div>
        </div>
      )}
    </>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {titulo}
      </h3>
      {children}
    </div>
  )
}

function Pilula({
  ativo,
  onClick,
  children,
  className,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        'inline-flex h-9 items-center rounded-xl border px-3.5 text-sm font-medium transition',
        ativo
          ? 'border-ink bg-ink text-white'
          : 'border-line bg-white text-ink-text hover:border-ink/30',
        className,
      )}
    >
      {children}
    </button>
  )
}
