import Link from 'next/link'
import { Plus } from 'lucide-react'

import { TabelaProdutos } from '@/components/admin/tabela-produtos'
import { CabecalhoPainel, EstadoVazio } from '@/components/admin/ui-painel'
import { listarProdutosAdmin } from '@/lib/repo'

export default async function PaginaProdutos({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const busca = searchParams.q ?? ''
  const produtos = await listarProdutosAdmin(busca)

  return (
    <>
      <CabecalhoPainel
        titulo="Produtos"
        descricao={`${produtos.length} ${produtos.length === 1 ? 'produto' : 'produtos'} no catálogo`}
        acao={
          <Link
            href="/admin/produtos/novo"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-ink transition hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
        }
      />

      {produtos.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white">
          <EstadoVazio
            titulo={busca ? 'Nenhum produto encontrado' : 'Catálogo vazio'}
            descricao={
              busca
                ? `Não encontramos nada para "${busca}". Tente outro termo.`
                : 'Cadastre o primeiro produto para começar a vender.'
            }
            acao={busca ? { rotulo: 'Limpar busca', href: '/admin/produtos' } : { rotulo: 'Criar produto', href: '/admin/produtos/novo' }}
          />
        </div>
      ) : (
        <TabelaProdutos produtos={produtos} busca={busca} />
      )}
    </>
  )
}
