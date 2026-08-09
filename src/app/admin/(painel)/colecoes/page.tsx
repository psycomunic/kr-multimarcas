import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { CabecalhoPainel } from '@/components/admin/ui-painel'
import { Selo } from '@/components/ui/selo'
import { COLECOES } from '@/lib/colecoes'
import { contarPorColecao, listarProdutosAdmin } from '@/lib/repo'

export default async function PaginaColecoes() {
  const [contagem, produtos] = await Promise.all([contarPorColecao(), listarProdutosAdmin()])

  const semCategoria = produtos.filter((p) => !p.colecao)

  return (
    <>
      <CabecalhoPainel
        titulo="Categorias"
        descricao="As vitrines da loja. Um produto entra numa categoria pelo campo “Categoria da loja”, na tela de edição do produto."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {COLECOES.map((colecao) => {
          const total = contagem[colecao.slug] ?? 0
          return (
            <article
              key={colecao.slug}
              className="flex gap-4 rounded-2xl border border-line bg-white p-4"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-line/50">
                <Image
                  src={colecao.imagem}
                  alt={colecao.titulo}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-base font-semibold">{colecao.titulo}</h2>
                  <Selo tom={total > 0 ? 'sucesso' : 'neutro'}>
                    {total} {total === 1 ? 'produto' : 'produtos'}
                  </Selo>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">{colecao.descricao}</p>
                <p className="mt-1 font-mono text-[11px] text-ink-muted">/loja?colecao={colecao.slug}</p>

                <div className="mt-auto flex flex-wrap gap-3 pt-3 text-xs font-medium">
                  <Link href="/admin/produtos" className="text-ink-text hover:text-gold-600">
                    Gerenciar produtos
                  </Link>
                  {total > 0 && (
                    <Link
                      href={`/loja?colecao=${colecao.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-ink-text hover:text-gold-600"
                    >
                      Ver na loja
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {semCategoria.length > 0 && (
        <section className="mt-8 rounded-2xl border border-warning/40 bg-warning/5 p-5">
          <h2 className="font-display text-base font-semibold">
            {semCategoria.length} produto(s) sem categoria
          </h2>
          <p className="mt-1 text-sm text-ink-text">
            Produto sem categoria não aparece em nenhuma vitrine da home nem no menu — só na
            busca e no catálogo geral.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {semCategoria.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="inline-flex items-center rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium transition hover:border-ink/30"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-ink-muted">
        Para criar, renomear ou reordenar categorias, edite{' '}
        <code className="rounded bg-white px-1 py-0.5 font-mono">src/lib/colecoes.ts</code> — cada
        item precisa de um slug, um título e uma foto em <code className="font-mono">/public</code>.
        Categorias sem produto ativo ficam escondidas da loja automaticamente.
      </p>
    </>
  )
}
