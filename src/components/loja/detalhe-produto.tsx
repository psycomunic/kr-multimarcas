'use client'

import { Check, ChevronLeft, ChevronRight, MessageCircle, Minus, Plus, ShoppingBag, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ImagemProduto } from '@/components/loja/imagem-produto'
import { useConfiguracoes } from '@/components/providers/configuracoes-provider'
import { Botao } from '@/components/ui/botao'
import { Selo } from '@/components/ui/selo'
import { cn } from '@/lib/cn'
import { corEhClara } from '@/lib/cores'
import { formatBRL } from '@/lib/format'
import { estoqueTotal, percentualDesconto, precoFinal, type Product } from '@/lib/types'
import { linkWhatsApp, mensagemProduto } from '@/lib/whatsapp'
import { useCarrinho } from '@/store/carrinho'

const ORDEM_TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'Único']

function ordenarTamanhos(a: string, b: string) {
  const na = Number(a)
  const nb = Number(b)
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
  return ORDEM_TAMANHOS.indexOf(a) - ORDEM_TAMANHOS.indexOf(b)
}

export function DetalheProduto({ produto, urlPublica }: { produto: Product; urlPublica: string }) {
  const configuracoes = useConfiguracoes()
  const adicionar = useCarrinho((e) => e.adicionar)

  const tamanhos = useMemo(
    () => Array.from(new Set(produto.variants.map((v) => v.size))).sort(ordenarTamanhos),
    [produto.variants],
  )
  const cores = useMemo(() => {
    const mapa = new Map<string, string>()
    for (const v of produto.variants) if (!mapa.has(v.colorHex)) mapa.set(v.colorHex, v.colorName)
    return Array.from(mapa, ([hex, nome]) => ({ hex, nome }))
  }, [produto.variants])

  // Pré-seleciona a primeira combinação realmente disponível.
  const primeiraDisponivel = produto.variants.find((v) => v.stock > 0)
  const [tamanho, setTamanho] = useState<string | null>(primeiraDisponivel?.size ?? null)
  const [corHex, setCorHex] = useState<string | null>(primeiraDisponivel?.colorHex ?? null)
  const [quantidade, setQuantidade] = useState(1)
  const [imagemAtiva, setImagemAtiva] = useState(0)
  const [adicionado, setAdicionado] = useState(false)

  const variacao = produto.variants.find((v) => v.size === tamanho && v.colorHex === corHex) ?? null
  const disponivel = (variacao?.stock ?? 0) > 0
  const esgotado = estoqueTotal(produto) === 0

  const final = precoFinal(produto)
  const desconto = percentualDesconto(produto)

  const whatsapp = linkWhatsApp(configuracoes.whatsapp, mensagemProduto(produto, urlPublica))

  /** Um tamanho só é oferecido se existir estoque nele em alguma cor. */
  function tamanhoDisponivel(t: string) {
    return produto.variants.some((v) => v.size === t && v.stock > 0)
  }
  function corDisponivel(hex: string) {
    return produto.variants.some(
      (v) => v.colorHex === hex && v.stock > 0 && (!tamanho || v.size === tamanho),
    )
  }

  function aoAdicionar() {
    if (!variacao || !disponivel) return
    adicionar({
      produtoId: produto.id,
      slug: produto.slug,
      sku: produto.sku,
      nome: produto.name,
      marca: produto.brand,
      imagem: produto.images[0]?.url ?? '',
      tamanho: variacao.size,
      corNome: variacao.colorName,
      corHex: variacao.colorHex,
      precoUnitario: final,
      precoOriginal: produto.price,
      quantidade,
      estoqueMax: variacao.stock,
      pesoGramas: produto.weightGrams,
    })
    setAdicionado(true)
    setTimeout(() => setAdicionado(false), 2000)
  }

  const imagens = produto.images.length > 0 ? produto.images : [{ id: 'vazia', url: '', position: 0 }]

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* ------------------------------------------------------------ GALERIA */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-line/40">
          <ImagemProduto
            src={imagens[imagemAtiva]?.url}
            alt={`${produto.name} — imagem ${imagemAtiva + 1}`}
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
          />

          {desconto > 0 && (
            <div className="absolute left-4 top-4">
              <Selo tom="ouro">-{desconto}% OFF</Selo>
            </div>
          )}

          {imagens.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setImagemAtiva((i) => (i - 1 + imagens.length) % imagens.length)
                }
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft transition hover:bg-white"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setImagemAtiva((i) => (i + 1) % imagens.length)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft transition hover:bg-white"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {imagens.length > 1 && (
          <div className="scroll-suave mt-3 flex gap-3 overflow-x-auto pb-1">
            {imagens.map((imagem, i) => (
              <button
                key={imagem.id}
                type="button"
                onClick={() => setImagemAtiva(i)}
                aria-label={`Ver imagem ${i + 1}`}
                aria-current={i === imagemAtiva}
                className={cn(
                  'relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition',
                  i === imagemAtiva ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <ImagemProduto src={imagem.url} alt="" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- COMPRA */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          {produto.brand}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
          {produto.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className="font-display text-3xl font-bold text-ink">{formatBRL(final)}</span>
          {desconto > 0 && (
            <span className="text-base text-ink-muted line-through">
              {formatBRL(produto.price)}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          ou parcelamos no cartão — combine as condições no WhatsApp.
        </p>

        {/* Tamanhos */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Tamanho</h2>
            {tamanho && <span className="text-xs text-ink-muted">Selecionado: {tamanho}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {tamanhos.map((t) => {
              const habilitado = tamanhoDisponivel(t)
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!habilitado}
                  onClick={() => {
                    setTamanho(t)
                    // Se a cor atual não existe nesse tamanho, pula para uma válida.
                    const aindaVale = produto.variants.some(
                      (v) => v.size === t && v.colorHex === corHex && v.stock > 0,
                    )
                    if (!aindaVale) {
                      const alternativa = produto.variants.find((v) => v.size === t && v.stock > 0)
                      setCorHex(alternativa?.colorHex ?? null)
                    }
                    setQuantidade(1)
                  }}
                  aria-pressed={tamanho === t}
                  className={cn(
                    'h-11 min-w-12 rounded-xl border px-3 text-sm font-medium transition',
                    tamanho === t
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-white text-ink hover:border-ink/40',
                    !habilitado &&
                      'cursor-not-allowed border-line bg-canvas text-ink-muted line-through opacity-60 hover:border-line',
                  )}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cores */}
        {cores.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Cor</h2>
              {variacao && <span className="text-xs text-ink-muted">{variacao.colorName}</span>}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {cores.map((cor) => {
                const habilitado = corDisponivel(cor.hex)
                return (
                  <button
                    key={cor.hex}
                    type="button"
                    disabled={!habilitado}
                    onClick={() => {
                      setCorHex(cor.hex)
                      setQuantidade(1)
                    }}
                    title={cor.nome}
                    aria-label={`Cor ${cor.nome}`}
                    aria-pressed={corHex === cor.hex}
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-full transition',
                      corHex === cor.hex
                        ? 'ring-2 ring-ink ring-offset-2'
                        : 'ring-1 ring-line hover:ring-ink/30',
                      !habilitado && 'cursor-not-allowed opacity-30',
                    )}
                  >
                    <span
                      className={cn(
                        'h-8 w-8 rounded-full',
                        corEhClara(cor.hex) && 'border border-ink/15',
                      )}
                      style={{ backgroundColor: cor.hex }}
                    />
                    {corHex === cor.hex && (
                      <Check
                        className={cn(
                          'absolute h-4 w-4',
                          corEhClara(cor.hex) ? 'text-ink' : 'text-white',
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quantidade + ações */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex h-12 items-center rounded-xl border border-line bg-white">
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              disabled={quantidade <= 1}
              className="px-3.5 py-3 text-ink-text transition hover:text-ink disabled:opacity-30"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite">
              {quantidade}
            </span>
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.min(variacao?.stock ?? 1, q + 1))}
              disabled={!variacao || quantidade >= variacao.stock}
              className="px-3.5 py-3 text-ink-text transition hover:text-ink disabled:opacity-30"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Botao
            onClick={aoAdicionar}
            disabled={!disponivel}
            tamanho="lg"
            className="min-w-[200px] flex-1"
          >
            {adicionado ? (
              <>
                <Check className="h-5 w-5" />
                Adicionado!
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                {esgotado ? 'Produto esgotado' : disponivel ? 'Adicionar à sacola' : 'Indisponível'}
              </>
            )}
          </Botao>
        </div>

        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] text-sm font-semibold text-[#052E16] transition hover:bg-[#1FBF5B]"
        >
          <MessageCircle className="h-5 w-5" />
          Perguntar no WhatsApp
        </a>

        {/* Disponibilidade */}
        <div className="mt-5 space-y-2 text-sm">
          {disponivel ? (
            variacao && variacao.stock <= 3 ? (
              <p className="flex items-center gap-2 text-warning">
                <span className="h-2 w-2 rounded-full bg-warning" />
                Últimas {variacao.stock} unidades nesta combinação
              </p>
            ) : (
              <p className="flex items-center gap-2 text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                Disponível para envio imediato
              </p>
            )
          ) : (
            <p className="flex items-center gap-2 text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-ink-muted" />
              Combinação sem estoque — pergunte no WhatsApp que a gente procura
            </p>
          )}

          <p className="flex items-center gap-2 text-ink-text">
            <Truck className="h-4 w-4 text-ink-muted" />
            Frete grátis acima de {formatBRL(configuracoes.freeShippingThreshold)}
          </p>
        </div>

        {/* Descrição */}
        <div className="mt-9 border-t border-line pt-7">
          <h2 className="font-display text-lg font-semibold">Descrição</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-text">
            {produto.description}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">SKU</dt>
              <dd className="mt-0.5 font-mono text-ink">{produto.sku}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">Estoque total</dt>
              <dd className="mt-0.5 text-ink">{estoqueTotal(produto)} un.</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
