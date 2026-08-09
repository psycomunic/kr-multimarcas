'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Minus, Plus } from 'lucide-react'
import { useState, useTransition } from 'react'

import { ajustarEstoqueAcao } from '@/app/admin/acoes'
import { cn } from '@/lib/cn'
import { estoqueTotal, type Product } from '@/lib/types'

const LIMITE_BAIXO = 6

export function GerenciadorEstoque({ produtos }: { produtos: Product[] }) {
  const [somenteBaixo, setSomenteBaixo] = useState(false)

  const visiveis = somenteBaixo
    ? produtos.filter((p) => estoqueTotal(p) <= LIMITE_BAIXO)
    : produtos

  return (
    <>
      <label className="mb-5 inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink-text">
        <input
          type="checkbox"
          checked={somenteBaixo}
          onChange={(e) => setSomenteBaixo(e.target.checked)}
          className="h-4 w-4 accent-gold"
        />
        Mostrar só o que está acabando (≤ {LIMITE_BAIXO} un.)
      </label>

      <div className="space-y-4">
        {visiveis.map((produto) => (
          <section key={produto.id} className="rounded-2xl border border-line bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div className="min-w-0">
                <Link
                  href={`/admin/produtos/${produto.id}`}
                  className="block truncate font-medium hover:text-gold-600"
                >
                  {produto.name}
                </Link>
                <p className="text-xs text-ink-muted">
                  {produto.brand} · <span className="font-mono">{produto.sku}</span>
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  estoqueTotal(produto) === 0
                    ? 'bg-danger/10 text-danger'
                    : estoqueTotal(produto) <= LIMITE_BAIXO
                      ? 'bg-warning/12 text-warning'
                      : 'bg-success/12 text-success',
                )}
              >
                {estoqueTotal(produto)} un. no total
              </span>
            </header>

            <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {produto.variants.map((variacao) => (
                <LinhaVariacao
                  key={variacao.id}
                  id={variacao.id}
                  rotulo={`Tam ${variacao.size} · ${variacao.colorName}`}
                  cor={variacao.colorHex}
                  estoqueInicial={variacao.stock}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

function LinhaVariacao({
  id,
  rotulo,
  cor,
  estoqueInicial,
}: {
  id: string
  rotulo: string
  cor: string
  estoqueInicial: number
}) {
  const router = useRouter()
  const [valor, setValor] = useState(estoqueInicial)
  const [salvo, setSalvo] = useState(false)
  const [pendente, iniciar] = useTransition()

  /** Grava e sincroniza o total do produto no servidor. */
  function gravar(novo: number) {
    const seguro = Math.max(0, novo)
    setValor(seguro)
    iniciar(async () => {
      await ajustarEstoqueAcao(id, seguro)
      setSalvo(true)
      router.refresh()
      setTimeout(() => setSalvo(false), 1500)
    })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3 transition',
        valor === 0 ? 'border-danger/30 bg-danger/5' : 'border-line',
      )}
    >
      <span
        className="h-6 w-6 shrink-0 rounded-full border border-ink/10"
        style={{ backgroundColor: cor }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate text-sm">{rotulo}</span>

      <div className="flex items-center rounded-lg border border-line bg-white">
        <button
          type="button"
          onClick={() => gravar(valor - 1)}
          disabled={valor <= 0 || pendente}
          className="p-1.5 text-ink-text transition hover:text-ink disabled:opacity-30"
          aria-label={`Diminuir estoque de ${rotulo}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          min={0}
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          onBlur={(e) => gravar(Number(e.target.value))}
          className="w-12 border-0 bg-transparent p-0 text-center text-sm font-semibold focus:outline-none"
          aria-label={`Estoque de ${rotulo}`}
        />
        <button
          type="button"
          onClick={() => gravar(valor + 1)}
          disabled={pendente}
          className="p-1.5 text-ink-text transition hover:text-ink disabled:opacity-30"
          aria-label={`Aumentar estoque de ${rotulo}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <Check
        className={cn(
          'h-4 w-4 shrink-0 text-success transition-opacity',
          salvo ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden="true"
      />
    </div>
  )
}
