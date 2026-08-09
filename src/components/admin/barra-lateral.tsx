'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plug,
  Settings,
  ShoppingCart,
  Store,
  X,
} from 'lucide-react'
import { useState } from 'react'

import { sair } from '@/app/admin/acoes'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/cn'

const ITENS = [
  { href: '/admin', rotulo: 'Dashboard', Icone: LayoutDashboard, exato: true },
  { href: '/admin/produtos', rotulo: 'Produtos', Icone: Package },
  { href: '/admin/pedidos', rotulo: 'Pedidos', Icone: ShoppingCart },
  { href: '/admin/estoque', rotulo: 'Estoque', Icone: Boxes },
  { href: '/admin/integracoes', rotulo: 'Integrações', Icone: Plug },
  { href: '/admin/configuracoes', rotulo: 'Configurações', Icone: Settings },
]

export function BarraLateral({ pedidosNovos }: { pedidosNovos: number }) {
  const pathname = usePathname()
  const [aberta, setAberta] = useState(false)

  const conteudo = (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex items-center justify-between px-5 py-6">
        <Link href="/admin" aria-label="Painel KR Multimarcas">
          <Logo variante="clara" className="h-10" />
        </Link>
        <button
          type="button"
          onClick={() => setAberta(false)}
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Seções do painel">
        {ITENS.map(({ href, rotulo, Icone, exato }) => {
          const ativo = exato ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setAberta(false)}
              aria-current={ativo ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                ativo ? 'bg-gold text-ink' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icone className="h-[18px] w-[18px]" />
              {rotulo}
              {href === '/admin/pedidos' && pedidosNovos > 0 && (
                <span
                  className={cn(
                    'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                    ativo ? 'bg-ink text-gold' : 'bg-gold text-ink',
                  )}
                >
                  {pedidosNovos}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <Store className="h-[18px] w-[18px]" />
          Ver a loja
        </Link>
        <form action={sair}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-danger/20 hover:text-danger"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Cabeçalho móvel */}
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-ink px-4 py-3 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setAberta(true)}
          className="rounded-lg p-2 hover:bg-white/10"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo variante="clara" className="h-8" comTexto={false} />
        <span className="font-display text-sm font-semibold">Painel</span>
      </div>

      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">{conteudo}</div>
      </aside>

      {aberta && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/60"
            onClick={() => setAberta(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-72 animate-fade-up">{conteudo}</div>
        </div>
      )}
    </>
  )
}
