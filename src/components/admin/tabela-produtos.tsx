'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

import { excluirProdutoAcao } from '@/app/admin/acoes'
import { ImagemProduto } from '@/components/loja/imagem-produto'
import { Botao } from '@/components/ui/botao'
import { Selo } from '@/components/ui/selo'
import { formatBRL } from '@/lib/format'
import { estoqueTotal, precoFinal, LABEL_CATEGORIA, LABEL_GENERO, type Product } from '@/lib/types'

export function TabelaProdutos({ produtos, busca }: { produtos: Product[]; busca: string }) {
  const router = useRouter()
  const [termo, setTermo] = useState(busca)
  const [confirmando, setConfirmando] = useState<Product | null>(null)
  const [pendente, iniciar] = useTransition()

  function buscar(evento: React.FormEvent) {
    evento.preventDefault()
    router.push(termo.trim() ? `/admin/produtos?q=${encodeURIComponent(termo.trim())}` : '/admin/produtos')
  }

  function excluir() {
    if (!confirmando) return
    const alvo = confirmando
    iniciar(async () => {
      await excluirProdutoAcao(alvo.id)
      setConfirmando(null)
      router.refresh()
    })
  }

  return (
    <>
      <form onSubmit={buscar} className="mb-4 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por nome, marca ou SKU"
            aria-label="Buscar produtos"
            className="input-kr pl-10"
          />
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Classificação</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {produtos.map((produto) => {
                const estoque = estoqueTotal(produto)
                const final = precoFinal(produto)
                return (
                  <tr key={produto.id} className="transition hover:bg-canvas">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-line/50">
                          <ImagemProduto
                            src={produto.images[0]?.url}
                            alt={produto.name}
                            sizes="44px"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/produtos/${produto.id}`}
                            className="block max-w-[220px] truncate font-medium hover:text-gold-600"
                          >
                            {produto.name}
                          </Link>
                          <p className="text-xs text-ink-muted">
                            {produto.brand} · <span className="font-mono">{produto.sku}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-text">
                      {LABEL_GENERO[produto.gender]}
                      <br />
                      <span className="text-ink-muted">{LABEL_CATEGORIA[produto.category]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{formatBRL(final)}</span>
                      {final < produto.price && (
                        <span className="block text-xs text-ink-muted line-through">
                          {formatBRL(produto.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          estoque === 0
                            ? 'font-semibold text-danger'
                            : estoque <= 6
                              ? 'font-semibold text-warning'
                              : 'text-ink-text'
                        }
                      >
                        {estoque} un.
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Selo tom={produto.active ? 'sucesso' : 'neutro'}>
                          {produto.active ? 'Ativo' : 'Inativo'}
                        </Selo>
                        {produto.featured && <Selo tom="ouro">Destaque</Selo>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/produtos/${produto.id}`}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-canvas hover:text-ink"
                          aria-label={`Editar ${produto.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirmando(produto)}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-danger/10 hover:text-danger"
                          aria-label={`Excluir ${produto.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmação de exclusão */}
      {confirmando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setConfirmando(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold">Excluir produto?</h2>
            <p className="mt-2 text-sm text-ink-text">
              <strong>{confirmando.name}</strong> será removido junto com suas imagens e
              variações. Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex gap-2">
              <Botao
                variante="contorno"
                onClick={() => setConfirmando(null)}
                className="flex-1"
              >
                Cancelar
              </Botao>
              <Botao
                onClick={excluir}
                carregando={pendente}
                className="flex-1 bg-danger text-white hover:bg-danger/90"
              >
                Excluir
              </Botao>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
