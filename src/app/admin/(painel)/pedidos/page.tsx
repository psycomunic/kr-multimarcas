import Link from 'next/link'

import { CabecalhoPainel, EstadoVazio } from '@/components/admin/ui-painel'
import { SeloStatus } from '@/components/ui/selo'
import { cn } from '@/lib/cn'
import { formatBRL, formatData } from '@/lib/format'
import { listarPedidos } from '@/lib/repo'
import { LABEL_STATUS, STATUS_PEDIDO, type OrderStatus } from '@/lib/types'

export default async function PaginaPedidos({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const filtro = STATUS_PEDIDO.includes(searchParams.status as OrderStatus)
    ? (searchParams.status as OrderStatus)
    : undefined

  const [pedidos, todos] = await Promise.all([listarPedidos(filtro), listarPedidos()])

  const contagem = (status: OrderStatus) => todos.filter((p) => p.status === status).length

  return (
    <>
      <CabecalhoPainel
        titulo="Pedidos"
        descricao="Todo pedido fechado pelo site aparece aqui com o resumo do WhatsApp."
      />

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filtrar por status">
        <Link
          href="/admin/pedidos"
          className={cn(
            'inline-flex h-9 items-center rounded-xl border px-3.5 text-sm font-medium transition',
            !filtro ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-text hover:border-ink/30',
          )}
        >
          Todos ({todos.length})
        </Link>
        {STATUS_PEDIDO.map((status) => (
          <Link
            key={status}
            href={`/admin/pedidos?status=${status}`}
            className={cn(
              'inline-flex h-9 items-center rounded-xl border px-3.5 text-sm font-medium transition',
              filtro === status
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink-text hover:border-ink/30',
            )}
          >
            {LABEL_STATUS[status]} ({contagem(status)})
          </Link>
        ))}
      </nav>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {pedidos.length === 0 ? (
          <EstadoVazio
            titulo={filtro ? `Nenhum pedido ${LABEL_STATUS[filtro].toLowerCase()}` : 'Nenhum pedido ainda'}
            descricao={
              filtro
                ? 'Troque o filtro para ver os demais pedidos.'
                : 'Assim que um cliente finalizar pelo WhatsApp, o pedido aparece nesta lista.'
            }
            acao={filtro ? { rotulo: 'Ver todos', href: '/admin/pedidos' } : undefined}
          />
        ) : (
          <>
            {/* Celular: cartões. Tabela de 6 colunas em tela pequena vira
                rolagem lateral e leitura ruim — quem despacha pedido no
                balcão precisa bater o olho e entender. */}
            <ul className="divide-y divide-line md:hidden">
              {pedidos.map((pedido) => (
                <li key={pedido.id}>
                  <Link
                    href={`/admin/pedidos/${pedido.id}`}
                    className="block px-4 py-4 transition active:bg-canvas"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-xs font-semibold">#{pedido.code}</span>
                      <SeloStatus status={pedido.status} />
                    </div>

                    <p className="mt-1.5 truncate text-sm font-medium">{pedido.customerName}</p>
                    <p className="text-xs text-ink-muted">{pedido.customerPhone}</p>

                    <div className="mt-2.5 flex items-end justify-between gap-3">
                      <span className="text-xs text-ink-muted">
                        {pedido.items.reduce((acc, i) => acc + i.qty, 0)} un. ·{' '}
                        {formatData(pedido.createdAt)}
                      </span>
                      <span className="font-display text-base font-semibold">
                        {formatBRL(pedido.total)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Itens</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="transition hover:bg-canvas">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pedidos/${pedido.id}`}
                        className="font-mono text-xs font-semibold hover:text-gold-600"
                      >
                        #{pedido.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[180px] truncate font-medium">{pedido.customerName}</p>
                      <p className="text-xs text-ink-muted">{pedido.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-text">
                      {pedido.items.reduce((acc, i) => acc + i.qty, 0)} un.
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {formatData(pedido.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <SeloStatus status={pedido.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatBRL(pedido.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}
