import Link from 'next/link'
import { Boxes, CircleDollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react'

import { CabecalhoPainel, CartaoKPI, CartaoPainel, EstadoVazio } from '@/components/admin/ui-painel'
import { SeloStatus } from '@/components/ui/selo'
import { formatBRL, formatDataCurta } from '@/lib/format'
import { ESTOQUE_BAIXO, metricasDashboard } from '@/lib/repo'

export default async function PaginaDashboard() {
  const m = await metricasDashboard()
  const picoSemana = Math.max(...m.vendasSemana.map((d) => d.valor), 1)

  return (
    <>
      <CabecalhoPainel
        titulo="Dashboard"
        descricao="Como a loja está indo hoje."
      />

      {/* Dois por linha no celular: quatro cartões empilhados viravam meio
          metro de rolagem antes de chegar no gráfico. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <CartaoKPI
          rotulo="Faturamento"
          valor={formatBRL(m.faturamento)}
          detalhe={`Ticket médio ${formatBRL(m.ticketMedio)}`}
          Icone={CircleDollarSign}
          destaque
        />
        <CartaoKPI
          rotulo="Pedidos"
          valor={String(m.totalPedidos)}
          detalhe={`${m.pedidosNovos} aguardando atendimento`}
          Icone={ShoppingCart}
        />
        <CartaoKPI
          rotulo="Produtos ativos"
          valor={String(m.produtosAtivos)}
          detalhe="Publicados na loja"
          Icone={Package}
        />
        <CartaoKPI
          rotulo="Estoque baixo"
          valor={String(m.itensEstoqueBaixo.length)}
          detalhe={`Até ${ESTOQUE_BAIXO} unidades`}
          Icone={Boxes}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        {/* --------------------------------------------------- VENDAS NA SEMANA */}
        <CartaoPainel
          titulo="Vendas na semana"
          acao={
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <TrendingUp className="h-3.5 w-3.5" />
              últimos 7 dias
            </span>
          }
        >
          <div className="p-5">
            <div className="flex h-48 items-end gap-2 sm:gap-3">
              {m.vendasSemana.map((dia) => (
                <div key={dia.dia} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-ink-muted">
                    {dia.valor > 0 ? formatBRL(dia.valor).replace('R$', '').trim() : ''}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gold-gradient transition-all"
                    style={{ height: `${Math.max(3, (dia.valor / picoSemana) * 100)}%` }}
                    role="img"
                    aria-label={`${dia.rotulo}: ${formatBRL(dia.valor)}`}
                  />
                  <span className="text-[11px] capitalize text-ink-muted">{dia.rotulo}</span>
                </div>
              ))}
            </div>
            {m.faturamento === 0 && (
              <p className="mt-4 text-center text-xs text-ink-muted">
                O gráfico considera pedidos com status pago, enviado ou entregue.
              </p>
            )}
          </div>
        </CartaoPainel>

        {/* ------------------------------------------------------ MAIS VENDIDOS */}
        <CartaoPainel titulo="Mais vendidos">
          {m.maisVendidos.length === 0 ? (
            <EstadoVazio
              titulo="Ainda sem vendas"
              descricao="Assim que os primeiros pedidos chegarem, o ranking aparece aqui."
            />
          ) : (
            <ul className="divide-y divide-line">
              {m.maisVendidos.map((item, i) => (
                <li key={`${item.nome}-${i}`} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas font-display text-xs font-bold text-ink-muted">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.nome}</p>
                    <p className="text-xs text-ink-muted">{item.marca}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{item.quantidade} un.</p>
                    <p className="text-xs text-ink-muted">{formatBRL(item.receita)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CartaoPainel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        {/* --------------------------------------------------- PEDIDOS RECENTES */}
        <CartaoPainel
          titulo="Pedidos recentes"
          acao={
            <Link href="/admin/pedidos" className="text-xs font-medium text-ink-muted hover:text-ink">
              Ver todos
            </Link>
          }
        >
          {m.pedidosRecentes.length === 0 ? (
            <EstadoVazio
              titulo="Nenhum pedido ainda"
              descricao="Os pedidos fechados pelo site aparecem aqui automaticamente."
              acao={{ rotulo: 'Ver a loja', href: '/' }}
            />
          ) : (
            <>
              {/* Celular: cartões no lugar da tabela */}
              <ul className="divide-y divide-line md:hidden">
                {m.pedidosRecentes.map((pedido) => (
                  <li key={pedido.id}>
                    <Link
                      href={`/admin/pedidos/${pedido.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 active:bg-canvas"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {pedido.customerName}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                          <span className="font-mono">#{pedido.code}</span>
                          <span>·</span>
                          {formatDataCurta(pedido.createdAt)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-semibold">
                          {formatBRL(pedido.total)}
                        </span>
                        <span className="mt-1 block">
                          <SeloStatus status={pedido.status} />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                    <th className="px-5 py-3 font-medium">Código</th>
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {m.pedidosRecentes.map((pedido) => (
                    <tr key={pedido.id} className="transition hover:bg-canvas">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/pedidos/${pedido.id}`}
                          className="font-mono text-xs font-semibold hover:text-gold-600"
                        >
                          #{pedido.code}
                        </Link>
                      </td>
                      <td className="max-w-[10rem] truncate px-5 py-3">{pedido.customerName}</td>
                      <td className="px-5 py-3 text-ink-muted">
                        {formatDataCurta(pedido.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <SeloStatus status={pedido.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatBRL(pedido.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </CartaoPainel>

        {/* ----------------------------------------------------- ESTOQUE BAIXO */}
        <CartaoPainel
          titulo="Precisa repor"
          acao={
            <Link href="/admin/estoque" className="text-xs font-medium text-ink-muted hover:text-ink">
              Gerenciar
            </Link>
          }
        >
          {m.itensEstoqueBaixo.length === 0 ? (
            <EstadoVazio
              titulo="Estoque saudável"
              descricao={`Nenhum produto ativo com ${ESTOQUE_BAIXO} unidades ou menos.`}
            />
          ) : (
            <ul className="divide-y divide-line">
              {m.itensEstoqueBaixo.slice(0, 6).map(({ produto, estoque }) => (
                <li key={produto.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/produtos/${produto.id}`}
                      className="block truncate text-sm font-medium hover:text-gold-600"
                    >
                      {produto.name}
                    </Link>
                    <p className="font-mono text-xs text-ink-muted">{produto.sku}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      estoque === 0 ? 'bg-danger/10 text-danger' : 'bg-warning/12 text-warning'
                    }`}
                  >
                    {estoque} un.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CartaoPainel>
      </div>
    </>
  )
}
