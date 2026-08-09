'use client'

import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'

import { ImagemProduto } from '@/components/loja/imagem-produto'
import { useConfiguracoes } from '@/components/providers/configuracoes-provider'
import { BotaoLink } from '@/components/ui/botao'
import { formatBRL } from '@/lib/format'
import { faltaParaFreteGratis } from '@/lib/frete'
import { useHidratado } from '@/lib/hooks'
import { subtotalCarrinho, useCarrinho } from '@/store/carrinho'

export function GavetaCarrinho() {
  const hidratado = useHidratado()
  const { freeShippingThreshold } = useConfiguracoes()

  const aberta = useCarrinho((e) => e.gavetaAberta)
  const fechar = useCarrinho((e) => e.fecharGaveta)
  const itens = useCarrinho((e) => e.itens)
  const alterarQuantidade = useCarrinho((e) => e.alterarQuantidade)
  const remover = useCarrinho((e) => e.remover)

  // Trava o scroll do fundo e fecha com Esc
  useEffect(() => {
    if (!aberta) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && fechar()
    window.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', aoTeclar)
    }
  }, [aberta, fechar])

  if (!hidratado || !aberta) return null

  const subtotal = subtotalCarrinho(itens)
  const falta = faltaParaFreteGratis(subtotal, freeShippingThreshold)
  const progresso =
    freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Sacola">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
        onClick={fechar}
        aria-hidden="true"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in flex-col bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold">
            Sua sacola{' '}
            <span className="text-sm font-normal text-ink-muted">
              ({itens.reduce((a, i) => a + i.quantidade, 0)})
            </span>
          </h2>
          <button
            type="button"
            onClick={fechar}
            className="rounded-lg p-2 text-ink-muted transition hover:bg-canvas hover:text-ink"
            aria-label="Fechar sacola"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {itens.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
              <ShoppingBag className="h-7 w-7 text-ink-muted" />
            </span>
            <div>
              <p className="font-display text-base font-semibold">Sua sacola está vazia</p>
              <p className="mt-1 text-sm text-ink-muted">
                Explore o catálogo e escolha suas peças favoritas.
              </p>
            </div>
            <BotaoLink href="/loja" onClick={fechar}>
              Ver coleção
            </BotaoLink>
          </div>
        ) : (
          <>
            {freeShippingThreshold > 0 && (
              <div className="border-b border-line bg-canvas px-5 py-3">
                <p className="text-xs text-ink-text">
                  {falta > 0 ? (
                    <>
                      Faltam <strong>{formatBRL(falta)}</strong> para o frete grátis
                    </>
                  ) : (
                    <strong className="text-success">Você ganhou frete grátis! 🎉</strong>
                  )}
                </p>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
                  role="progressbar"
                  aria-valuenow={Math.round(progresso)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progresso para frete grátis"
                >
                  <div
                    className="h-full rounded-full bg-gold-gradient transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            )}

            <ul className="scroll-suave flex-1 divide-y divide-line overflow-y-auto px-5">
              {itens.map((item) => (
                <li key={item.chave} className="flex gap-3 py-4">
                  <Link
                    href={`/produto/${item.slug}`}
                    onClick={fechar}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-line/50"
                  >
                    <ImagemProduto src={item.imagem} alt={item.nome} sizes="80px" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      {item.marca}
                    </p>
                    <Link
                      href={`/produto/${item.slug}`}
                      onClick={fechar}
                      className="line-clamp-2 text-sm font-medium leading-snug hover:text-gold-600"
                    >
                      {item.nome}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                      <span>Tam {item.tamanho}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full border border-ink/15"
                        style={{ backgroundColor: item.corHex }}
                        aria-hidden="true"
                      />
                      {item.corNome}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg border border-line">
                        <button
                          type="button"
                          onClick={() => alterarQuantidade(item.chave, item.quantidade - 1)}
                          disabled={item.quantidade <= 1}
                          className="p-1.5 text-ink-text transition hover:text-ink disabled:opacity-30"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-7 text-center text-sm font-medium">
                          {item.quantidade}
                        </span>
                        <button
                          type="button"
                          onClick={() => alterarQuantidade(item.chave, item.quantidade + 1)}
                          disabled={item.quantidade >= item.estoqueMax}
                          className="p-1.5 text-ink-text transition hover:text-ink disabled:opacity-30"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {formatBRL(item.precoUnitario * item.quantidade)}
                        </span>
                        <button
                          type="button"
                          onClick={() => remover(item.chave)}
                          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-danger/10 hover:text-danger"
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

            <footer className="space-y-3 border-t border-line px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-text">Subtotal</span>
                <span className="font-display text-lg font-semibold">{formatBRL(subtotal)}</span>
              </div>
              <p className="text-xs text-ink-muted">
                Frete e forma de pagamento são definidos no checkout.
              </p>
              <BotaoLink href="/checkout" onClick={fechar} tamanho="lg" className="w-full">
                Finalizar pelo WhatsApp
              </BotaoLink>
              <BotaoLink
                href="/carrinho"
                onClick={fechar}
                variante="contorno"
                className="w-full"
              >
                Ver sacola completa
              </BotaoLink>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
