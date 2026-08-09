'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Boxes, LayoutDashboard, Menu, Package, ShoppingCart } from 'lucide-react'

import { cn } from '@/lib/cn'

const ABAS = [
  { href: '/admin', rotulo: 'Início', Icone: LayoutDashboard, exato: true },
  { href: '/admin/pedidos', rotulo: 'Pedidos', Icone: ShoppingCart },
  { href: '/admin/produtos', rotulo: 'Produtos', Icone: Package },
  { href: '/admin/estoque', rotulo: 'Estoque', Icone: Boxes },
]

/**
 * Navegação por abas na base da tela — o padrão que todo app usa no celular.
 * Substitui o menu-hambúrguer como caminho principal: as quatro telas do dia a
 * dia ficam a um toque, no alcance do polegar. O botão "Mais" abre a gaveta com
 * o resto (integrações, configurações, sair).
 */
export function BarraInferior({
  pedidosNovos,
  aoAbrirMenu,
}: {
  pedidosNovos: number
  aoAbrirMenu: () => void
}) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch">
        {ABAS.map(({ href, rotulo, Icone, exato }) => {
          const ativo = exato ? pathname === href : pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={ativo ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition',
                  ativo ? 'text-gold' : 'text-white/55 active:text-white',
                )}
              >
                <span className="relative">
                  <Icone className="h-[22px] w-[22px]" />
                  {href === '/admin/pedidos' && pedidosNovos > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-ink">
                      {pedidosNovos}
                    </span>
                  )}
                </span>
                {rotulo}
                {ativo && (
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-gold" />
                )}
              </Link>
            </li>
          )
        })}

        <li className="flex-1">
          <button
            type="button"
            onClick={aoAbrirMenu}
            className="flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium text-white/55 transition active:text-white"
          >
            <Menu className="h-[22px] w-[22px]" />
            Mais
          </button>
        </li>
      </ul>
    </nav>
  )
}
