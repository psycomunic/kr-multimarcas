'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { CircleAlert, ImageOff, Plus, Trash2, Upload } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'

import { salvarProdutoAcao } from '@/app/admin/acoes'
import { UploadImagens } from '@/components/admin/upload-imagens'
import { Botao } from '@/components/ui/botao'
import { cn } from '@/lib/cn'
import { COLECOES } from '@/lib/colecoes'
import { nomeDaCor } from '@/lib/cores'
import { slugify } from '@/lib/format'
import { CATEGORIAS, GENEROS, LABEL_CATEGORIA, LABEL_GENERO, type Product } from '@/lib/types'
import { produtoSchema, type DadosProduto } from '@/lib/validacao'

type LinhaVariacao = { size: string; colorHex: string; stock: number }

const TAMANHOS_SUGERIDOS: Record<string, string[]> = {
  roupas: ['PP', 'P', 'M', 'G', 'GG'],
  calcados: ['36', '37', '38', '39', '40', '41', '42'],
  acessorios: ['Único'],
}

export function FormularioProduto({ produto }: { produto?: Product }) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  const [imagens, setImagens] = useState<string[]>(produto?.images.map((i) => i.url) ?? [])
  const [novaImagem, setNovaImagem] = useState('')
  const [variacoes, setVariacoes] = useState<LinhaVariacao[]>(
    produto?.variants.map((v) => ({ size: v.size, colorHex: v.colorHex, stock: v.stock })) ?? [],
  )
  const [corLote, setCorLote] = useState('#0B0B0D')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DadosProduto>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      sku: produto?.sku ?? '',
      name: produto?.name ?? '',
      brand: produto?.brand ?? '',
      gender: produto?.gender ?? 'masculino',
      category: produto?.category ?? 'roupas',
      colecao: produto?.colecao ?? '',
      description: produto?.description ?? '',
      price: produto?.price ?? 0,
      salePrice: produto?.salePrice ?? null,
      active: produto?.active ?? true,
      featured: produto?.featured ?? false,
      weightGrams: produto?.weightGrams ?? 500,
      widthCm: produto?.widthCm ?? 20,
      heightCm: produto?.heightCm ?? 10,
      lengthCm: produto?.lengthCm ?? 30,
    },
  })

  const categoria = watch('category')
  const nome = watch('name')

  function adicionarImagem() {
    const url = novaImagem.trim()
    if (!url) return
    setImagens((atual) => [...atual, url])
    setNovaImagem('')
  }

  /** Cria de uma vez todas as combinações da cor escolhida com os tamanhos da categoria. */
  function gerarVariacoesEmLote() {
    const tamanhos = TAMANHOS_SUGERIDOS[categoria] ?? ['Único']
    setVariacoes((atual) => {
      const existentes = new Set(atual.map((v) => `${v.size}::${v.colorHex}`))
      const novas = tamanhos
        .filter((size) => !existentes.has(`${size}::${corLote}`))
        .map((size) => ({ size, colorHex: corLote, stock: 0 }))
      return [...atual, ...novas]
    })
  }

  function enviar(dados: DadosProduto) {
    setErro(null)

    if (imagens.length === 0) {
      setErro('Adicione pelo menos uma imagem — a loja precisa mostrar o produto.')
      return
    }
    if (variacoes.length === 0) {
      setErro('Cadastre pelo menos uma variação (tamanho + cor) com estoque.')
      return
    }
    if (variacoes.some((v) => !v.size.trim())) {
      setErro('Toda variação precisa de um tamanho.')
      return
    }
    if (dados.salePrice && dados.salePrice >= dados.price) {
      setErro('O preço promocional precisa ser menor que o preço cheio.')
      return
    }

    iniciar(async () => {
      const resultado = await salvarProdutoAcao({
        id: produto?.id,
        ...dados,
        colecao: dados.colecao || null,
        salePrice: dados.salePrice || null,
        slug: produto?.slug ?? slugify(dados.name),
        images: imagens,
        variants: variacoes.map((v) => ({
          size: v.size.trim(),
          colorHex: v.colorHex,
          stock: Number(v.stock) || 0,
        })),
      })

      if (!resultado.ok) {
        setErro(resultado.mensagem ?? 'Não foi possível salvar.')
        return
      }
      router.push('/admin/produtos')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-6 xl:grid-cols-[1fr_360px]" noValidate>
      <div className="space-y-6">
        {/* ---------------------------------------------------------- BÁSICO */}
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold">Informações básicas</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-kr" htmlFor="name">
                Nome do produto
              </label>
              <input id="name" {...register('name')} className="input-kr" aria-invalid={Boolean(errors.name)} />
              {errors.name && <p className="erro-campo">{errors.name.message}</p>}
              {nome && (
                <p className="mt-1 text-xs text-ink-muted">
                  URL: <span className="font-mono">/produto/{produto?.slug ?? slugify(nome)}</span>
                </p>
              )}
            </div>

            <div>
              <label className="label-kr" htmlFor="brand">
                Marca
              </label>
              <input id="brand" {...register('brand')} className="input-kr" aria-invalid={Boolean(errors.brand)} />
              {errors.brand && <p className="erro-campo">{errors.brand.message}</p>}
            </div>

            <div>
              <label className="label-kr" htmlFor="sku">
                SKU
              </label>
              <input id="sku" {...register('sku')} className="input-kr font-mono" placeholder="KR-CAM-001" aria-invalid={Boolean(errors.sku)} />
              {errors.sku && <p className="erro-campo">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="label-kr" htmlFor="gender">
                Gênero
              </label>
              <select id="gender" {...register('gender')} className="input-kr">
                {GENEROS.map((g) => (
                  <option key={g} value={g}>
                    {LABEL_GENERO[g]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-kr" htmlFor="category">
                Tipo
              </label>
              <select id="category" {...register('category')} className="input-kr">
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {LABEL_CATEGORIA[c]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-muted">
                Classificação ampla, usada nos filtros da loja.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="label-kr" htmlFor="colecao">
                Categoria da loja
              </label>
              <select id="colecao" {...register('colecao')} className="input-kr">
                <option value="">Sem categoria (não aparece na vitrine)</option>
                {COLECOES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.titulo}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-muted">
                É por aqui que o produto entra nas vitrines da home e no menu.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="label-kr" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={5}
                className="input-kr resize-y"
                placeholder="Conte o material, o caimento e para que ocasião a peça serve."
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && <p className="erro-campo">{errors.description.message}</p>}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- IMAGENS */}
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold">Imagens</h2>
          <p className="mt-1 text-sm text-ink-text">
            A primeira imagem é a capa na vitrine. Use fotos verticais (3:4).
          </p>

          <div className="mt-4">
            <UploadImagens imagens={imagens} aoMudar={setImagens} />
          </div>
        </section>

        {/* ------------------------------------------------------- VARIAÇÕES */}
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold">Variações e estoque</h2>
          <p className="mt-1 text-sm text-ink-text">
            O estoque do produto é a soma das variações. O nome da cor é gerado automaticamente
            a partir do hexadecimal.
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl bg-canvas p-3">
            <div>
              <label className="label-kr text-xs" htmlFor="corLote">
                Cor
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="corLote"
                  type="color"
                  value={corLote}
                  onChange={(e) => setCorLote(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-white p-1"
                />
                <span className="text-sm text-ink-text">{nomeDaCor(corLote)}</span>
              </div>
            </div>
            <Botao type="button" variante="contorno" onClick={gerarVariacoesEmLote}>
              <Plus className="h-4 w-4" />
              Gerar tamanhos de {LABEL_CATEGORIA[categoria]}
            </Botao>
          </div>

          {variacoes.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                    <th className="py-2 pr-3 font-medium">Tamanho</th>
                    <th className="py-2 pr-3 font-medium">Cor</th>
                    <th className="py-2 pr-3 font-medium">Estoque</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {variacoes.map((variacao, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-3">
                        <input
                          value={variacao.size}
                          onChange={(e) =>
                            setVariacoes((atual) =>
                              atual.map((v, idx) => (idx === i ? { ...v, size: e.target.value } : v)),
                            )
                          }
                          className="input-kr h-9 w-24 px-3 py-1"
                          aria-label={`Tamanho da variação ${i + 1}`}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={variacao.colorHex}
                            onChange={(e) =>
                              setVariacoes((atual) =>
                                atual.map((v, idx) =>
                                  idx === i ? { ...v, colorHex: e.target.value } : v,
                                ),
                              )
                            }
                            className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
                            aria-label={`Cor da variação ${i + 1}`}
                          />
                          <span className="text-xs text-ink-muted">{nomeDaCor(variacao.colorHex)}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min={0}
                          value={variacao.stock}
                          onChange={(e) =>
                            setVariacoes((atual) =>
                              atual.map((v, idx) =>
                                idx === i ? { ...v, stock: Number(e.target.value) } : v,
                              ),
                            )
                          }
                          className="input-kr h-9 w-24 px-3 py-1"
                          aria-label={`Estoque da variação ${i + 1}`}
                        />
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setVariacoes((atual) => atual.filter((_, idx) => idx !== i))}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-danger/10 hover:text-danger"
                          aria-label={`Remover variação ${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Botao
              type="button"
              variante="contorno"
              tamanho="sm"
              onClick={() =>
                setVariacoes((atual) => [...atual, { size: '', colorHex: corLote, stock: 0 }])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar variação
            </Botao>
            <p className="text-sm text-ink-text">
              Estoque total:{' '}
              <strong className="font-semibold text-ink">
                {variacoes.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)} un.
              </strong>
            </p>
          </div>
        </section>
      </div>

      {/* -------------------------------------------------- COLUNA DA DIREITA */}
      <div className="space-y-6">
        <section className="sticky top-6 space-y-6">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Publicação</h2>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input type="checkbox" {...register('active')} className="mt-0.5 h-4 w-4 accent-gold" />
              <span>
                <span className="block text-sm font-medium">Ativo na loja</span>
                <span className="block text-xs text-ink-muted">
                  Produtos inativos somem do catálogo e da busca.
                </span>
              </span>
            </label>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input type="checkbox" {...register('featured')} className="mt-0.5 h-4 w-4 accent-gold" />
              <span>
                <span className="block text-sm font-medium">Destaque</span>
                <span className="block text-xs text-ink-muted">
                  Aparece na home e sobe na ordenação por relevância.
                </span>
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Preços</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label-kr" htmlFor="price">
                  Preço (R$)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price')}
                  className="input-kr"
                  aria-invalid={Boolean(errors.price)}
                />
                {errors.price && <p className="erro-campo">{errors.price.message}</p>}
              </div>

              <div>
                <label className="label-kr" htmlFor="salePrice">
                  Preço promocional (R$){' '}
                  <span className="font-normal text-ink-muted">opcional</span>
                </label>
                <input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('salePrice')}
                  className="input-kr"
                  placeholder="Deixe vazio se não houver"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Peso e dimensões</h2>
            <p className="mt-1 text-xs text-ink-muted">Usados no cálculo do frete.</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="label-kr text-xs" htmlFor="weightGrams">
                  Peso (g)
                </label>
                <input id="weightGrams" type="number" min="1" {...register('weightGrams')} className="input-kr" />
              </div>
              <div>
                <label className="label-kr text-xs" htmlFor="widthCm">
                  Largura (cm)
                </label>
                <input id="widthCm" type="number" min="1" {...register('widthCm')} className="input-kr" />
              </div>
              <div>
                <label className="label-kr text-xs" htmlFor="heightCm">
                  Altura (cm)
                </label>
                <input id="heightCm" type="number" min="1" {...register('heightCm')} className="input-kr" />
              </div>
              <div>
                <label className="label-kr text-xs" htmlFor="lengthCm">
                  Comprimento (cm)
                </label>
                <input id="lengthCm" type="number" min="1" {...register('lengthCm')} className="input-kr" />
              </div>
            </div>
            {(errors.weightGrams || errors.widthCm || errors.heightCm || errors.lengthCm) && (
              <p className="erro-campo">Informe medidas maiores que zero.</p>
            )}
          </div>

          {erro && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-danger/10 p-3 text-xs text-danger"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {erro}
            </p>
          )}

          {imagens.length === 0 && (
            <p className="flex items-start gap-2 rounded-xl bg-canvas p-3 text-xs text-ink-text">
              <ImageOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
              Nenhuma imagem adicionada ainda.
            </p>
          )}

          <div className={cn('flex gap-2')}>
            <Botao
              type="button"
              variante="contorno"
              onClick={() => router.push('/admin/produtos')}
              className="flex-1"
            >
              Cancelar
            </Botao>
            <Botao type="submit" carregando={pendente} className="flex-1">
              {produto ? 'Salvar alterações' : 'Criar produto'}
            </Botao>
          </div>
        </section>
      </div>
    </form>
  )
}
