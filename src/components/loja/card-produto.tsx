import Link from 'next/link'

import { ImagemProduto } from '@/components/loja/imagem-produto'
import { Selo } from '@/components/ui/selo'
import { cn } from '@/lib/cn'
import { formatBRL } from '@/lib/format'
import { estoqueTotal, percentualDesconto, precoFinal, type Product } from '@/lib/types'

export function CardProduto({
  produto,
  prioridade = false,
  className,
}: {
  produto: Product
  prioridade?: boolean
  className?: string
}) {
  const final = precoFinal(produto)
  const desconto = percentualDesconto(produto)
  const esgotado = estoqueTotal(produto) === 0
  const cores = Array.from(new Set(produto.variants.map((v) => v.colorHex))).slice(0, 4)

  return (
    <article className={cn('group', className)}>
      <Link href={`/produto/${produto.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-line/50">
          <ImagemProduto
            src={produto.images[0]?.url}
            alt={produto.name}
            priority={prioridade}
            className="transition-transform duration-500 group-hover:scale-[1.04]"
          />

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {desconto > 0 && <Selo tom="ouro">-{desconto}%</Selo>}
            {produto.featured && !esgotado && <Selo tom="escuro">Destaque</Selo>}
          </div>

          {esgotado && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
              <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink">
                Esgotado
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {produto.brand}
          </p>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink transition-colors group-hover:text-gold-600">
            {produto.name}
          </h3>

          <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
            <span className="font-display text-base font-semibold text-ink">
              {formatBRL(final)}
            </span>
            {desconto > 0 && (
              <span className="text-xs text-ink-muted line-through">{formatBRL(produto.price)}</span>
            )}
          </div>

          {cores.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {cores.map((hex) => (
                <span
                  key={hex}
                  className="h-3 w-3 rounded-full border border-ink/15"
                  style={{ backgroundColor: hex }}
                  aria-hidden="true"
                />
              ))}
              {produto.variants.length > cores.length && (
                <span className="text-[11px] text-ink-muted">
                  +{new Set(produto.variants.map((v) => v.colorHex)).size - cores.length}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

export function GradeProdutos({
  produtos,
  className,
}: {
  produtos: Product[]
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {produtos.map((p, i) => (
        <CardProduto key={p.id} produto={p} prioridade={i < 4} />
      ))}
    </div>
  )
}
