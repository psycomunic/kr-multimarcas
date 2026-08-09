'use client'

import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'

import { ImagemProduto } from '@/components/loja/imagem-produto'
import { useConfiguracoes } from '@/components/providers/configuracoes-provider'
import { BotaoLink } from '@/components/ui/botao'
import { formatBRL } from '@/lib/format'
import { faltaParaFreteGratis } from '@/lib/frete'
import { useHidratado } from '@/lib/hooks'
import { subtotalCarrinho, useCarrinho } from '@/store/carrinho'

export function ConteudoCarrinho() {
  const hidratado = useHidratado()
  const { freeShippingThreshold } = useConfiguracoes()

  const itens = useCarrinho((e) => e.itens)
  const alterarQuantidade = useCarrinho((e) => e.alterarQuantidade)
  const remover = useCarrinho((e) => e.remover)
  const limpar = useCarrinho((e) => e.limpar)

  if (!hidratado) {
    return (
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  if (itens.length === 0) {
    return (
      <div className="card-kr mt-8 flex flex-col items-center gap-4 px-6 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
          <ShoppingBag className="h-7 w-7 text-ink-muted" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold">Sua sacola está vazia</p>
          <p className="mt-1.5 text-sm text-ink-text">
            Que tal dar uma olhada nas peças em destaque?
          </p>
        </div>
        <BotaoLink href="/loja">Ver coleção</BotaoLink>
      </div>
    )
  }

  const subtotal = subtotalCarrinho(itens)
  const falta = faltaParaFreteGratis(subtotal, freeShippingThreshold)
  const economia = itens.reduce(
    (acc, i) => acc + Math.max(0, i.precoOriginal - i.precoUnitario) * i.quantidade,
    0,
  )

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
        {itens.map((item) => (
          <li key={item.chave} className="flex gap-4 p-4 sm:p-5">
            <Link
              href={`/produto/${item.slug}`}
              className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-line/50"
            >
              <ImagemProduto src={item.imagem} alt={item.nome} sizes="96px" />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {item.marca}
              </p>
              <Link
                href={`/produto/${item.slug}`}
                className="text-sm font-medium leading-snug hover:text-gold-600 sm:text-base"
              >
                {item.nome}
              </Link>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                <span>Tam {item.tamanho}</span>
                <span aria-hidden="true">·</span>
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full border border-ink/15"
                  style={{ backgroundColor: item.corHex }}
                  aria-hidden="true"
                />
                {item.corNome}
                <span aria-hidden="true">·</span>
                <span className="font-mono">{item.sku}</span>
              </p>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex items-center rounded-lg border border-line">
                  <button
                    type="button"
                    onClick={() => alterarQuantidade(item.chave, item.quantidade - 1)}
                    disabled={item.quantidade <= 1}
                    className="p-2 text-ink-text transition hover:text-ink disabled:opacity-30"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-medium">{item.quantidade}</span>
                  <button
                    type="button"
                    onClick={() => alterarQuantidade(item.chave, item.quantidade + 1)}
                    disabled={item.quantidade >= item.estoqueMax}
                    className="p-2 text-ink-text transition hover:text-ink disabled:opacity-30"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-display text-base font-semibold">
                      {formatBRL(item.precoUnitario * item.quantidade)}
                    </p>
                    {item.precoOriginal > item.precoUnitario && (
                      <p className="text-xs text-ink-muted line-through">
                        {formatBRL(item.precoOriginal * item.quantidade)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remover(item.chave)}
                    className="rounded-lg p-2 text-ink-muted transition hover:bg-danger/10 hover:text-danger"
                    aria-label={`Remover ${item.nome}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card-kr sticky top-28 p-5">
        <h2 className="font-display text-lg font-semibold">Resumo</h2>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-text">Subtotal</dt>
            <dd className="font-medium">{formatBRL(subtotal)}</dd>
          </div>
          {economia > 0 && (
            <div className="flex justify-between text-success">
              <dt>Você economiza</dt>
              <dd className="font-medium">−{formatBRL(economia)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-text">Frete</dt>
            <dd className="text-ink-muted">calculado no checkout</dd>
          </div>
        </dl>

        {freeShippingThreshold > 0 && (
          <div className="mt-4 rounded-xl bg-canvas p-3">
            <p className="text-xs text-ink-text">
              {falta > 0 ? (
                <>
                  Faltam <strong>{formatBRL(falta)}</strong> para o frete grátis
                </>
              ) : (
                <strong className="text-success">Frete grátis liberado! 🎉</strong>
              )}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gold-gradient transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <BotaoLink href="/checkout" tamanho="lg" className="mt-5 w-full">
          Finalizar pelo WhatsApp
        </BotaoLink>
        <BotaoLink href="/loja" variante="contorno" className="mt-2 w-full">
          Continuar comprando
        </BotaoLink>

        <button
          type="button"
          onClick={limpar}
          className="mt-4 w-full text-xs text-ink-muted underline-offset-2 transition hover:text-danger hover:underline"
        >
          Esvaziar sacola
        </button>
      </aside>
    </div>
  )
}
