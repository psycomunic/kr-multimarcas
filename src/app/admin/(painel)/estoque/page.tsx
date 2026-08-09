import { GerenciadorEstoque } from '@/components/admin/gerenciador-estoque'
import { CabecalhoPainel, CartaoKPI, EstadoVazio } from '@/components/admin/ui-painel'
import { Boxes, CircleAlert, Package } from 'lucide-react'
import { ESTOQUE_BAIXO, listarProdutosAdmin } from '@/lib/repo'
import { estoqueTotal } from '@/lib/types'

export default async function PaginaEstoque() {
  const produtos = await listarProdutosAdmin()

  const totalUnidades = produtos.reduce((acc, p) => acc + estoqueTotal(p), 0)
  const acabando = produtos.filter((p) => {
    const e = estoqueTotal(p)
    return e > 0 && e <= ESTOQUE_BAIXO
  }).length
  const esgotados = produtos.filter((p) => estoqueTotal(p) === 0).length

  return (
    <>
      <CabecalhoPainel
        titulo="Estoque"
        descricao="Ajuste a quantidade de cada variação. O total do produto é recalculado sozinho."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <CartaoKPI
          rotulo="Unidades no estoque"
          valor={String(totalUnidades)}
          detalhe={`${produtos.length} produtos cadastrados`}
          Icone={Boxes}
          destaque
        />
        <CartaoKPI
          rotulo="Acabando"
          valor={String(acabando)}
          detalhe={`Entre 1 e ${ESTOQUE_BAIXO} unidades`}
          Icone={CircleAlert}
        />
        <CartaoKPI rotulo="Esgotados" valor={String(esgotados)} detalhe="Sem nenhuma unidade" Icone={Package} />
      </div>

      {produtos.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white">
          <EstadoVazio
            titulo="Nada para controlar ainda"
            descricao="Cadastre produtos com variações para gerenciar o estoque por tamanho e cor."
            acao={{ rotulo: 'Criar produto', href: '/admin/produtos/novo' }}
          />
        </div>
      ) : (
        <GerenciadorEstoque produtos={produtos} />
      )}
    </>
  )
}
