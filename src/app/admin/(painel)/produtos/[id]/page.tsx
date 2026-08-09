import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

import { FormularioProduto } from '@/components/admin/formulario-produto'
import { CabecalhoPainel } from '@/components/admin/ui-painel'
import { obterProduto } from '@/lib/repo'

export default async function PaginaEditarProduto({ params }: { params: { id: string } }) {
  const produto = await obterProduto(params.id)
  if (!produto) notFound()

  return (
    <>
      <CabecalhoPainel
        titulo={produto.name}
        descricao={`${produto.brand} · ${produto.sku}`}
        acao={
          <Link
            href={`/produto/${produto.slug}`}
            target="_blank"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-medium transition hover:border-ink/30"
          >
            <ExternalLink className="h-4 w-4" />
            Ver na loja
          </Link>
        }
      />
      <FormularioProduto produto={produto} />
    </>
  )
}
