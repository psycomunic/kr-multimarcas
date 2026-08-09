'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronRight, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Logo } from '@/components/ui/logo'
import { useConfiguracoes } from '@/components/providers/configuracoes-provider'
import { cn } from '@/lib/cn'
import type { Colecao } from '@/lib/colecoes'
import { formatBRL } from '@/lib/format'
import { useHidratado } from '@/lib/hooks'
import { quantidadeCarrinho, useCarrinho } from '@/store/carrinho'

/** O menu vem das categorias reais da loja (as que têm produto ativo). */
function montarNavegacao(categorias: Colecao[]) {
  return [
    ...categorias.map((c) => ({ rotulo: c.titulo, href: `/loja?colecao=${c.slug}`, destaque: false })),
    { rotulo: 'Ofertas', href: '/loja?ofertas=1', destaque: true },
  ]
}

export function TopBar() {
  const { freeShippingThreshold } = useConfiguracoes()
  return (
    <div className="bg-gold-gradient text-ink">
      <div className="container-kr flex h-9 items-center justify-center gap-2 text-center text-[11px] font-semibold tracking-wide sm:text-xs">
        <span>Frete grátis acima de {formatBRL(freeShippingThreshold)}</span>
        <span aria-hidden="true">·</span>
        <span>Vendas finalizadas pelo WhatsApp</span>
      </div>
    </div>
  )
}

export function Header({ categorias }: { categorias: Colecao[] }) {
  const NAVEGACAO = montarNavegacao(categorias)
  const router = useRouter()
  // `usePathname` em vez de `useSearchParams` de propósito: este componente vive
  // no layout, e useSearchParams forçaria uma Suspense boundary em toda página
  // estática da loja.
  const pathname = usePathname()
  const hidratado = useHidratado()

  const itens = useCarrinho((e) => e.itens)
  const abrirGaveta = useCarrinho((e) => e.abrirGaveta)

  const [menuAberto, setMenuAberto] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [termo, setTermo] = useState('')

  const quantidade = hidratado ? quantidadeCarrinho(itens) : 0

  // Fecha o menu móvel ao navegar
  useEffect(() => {
    setMenuAberto(false)
    setBuscaAberta(false)
  }, [pathname])

  function buscar(evento: React.FormEvent) {
    evento.preventDefault()
    const q = termo.trim()
    router.push(q ? `/loja?q=${encodeURIComponent(q)}` : '/loja')
  }

  return (
    <header className="sticky top-0 z-40 bg-ink text-white shadow-[0_1px_0_rgba(255,255,255,0.08)]">
      <div className="container-kr flex h-16 items-center gap-3 sm:h-[72px] sm:gap-6">
        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          className="-ml-2 rounded-lg p-2 text-white/90 transition hover:bg-white/10 lg:hidden"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
        >
          {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" aria-label="Página inicial KR Multimarcas" className="shrink-0">
          <Logo variante="clara" className="h-9 sm:h-11" />
        </Link>

        <nav className="hidden flex-1 items-center gap-6 lg:flex" aria-label="Categorias">
          {NAVEGACAO.map((item) => (
            <Link
              key={item.rotulo}
              href={item.href}
              className={cn(
                'relative py-2 text-sm font-medium text-white/85 transition-colors hover:text-gold',
                'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full',
                item.destaque && 'text-gold',
              )}
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <form onSubmit={buscar} className="ml-auto hidden items-center md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar por peça ou marca"
              aria-label="Buscar produtos"
              className="h-10 w-52 rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-white
                         placeholder:text-white/45 transition focus:w-64 focus:border-gold focus:outline-none
                         focus:ring-2 focus:ring-gold/40 lg:w-56"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            onClick={() => setBuscaAberta((v) => !v)}
            className="rounded-lg p-2 text-white/90 transition hover:bg-white/10 md:hidden"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={abrirGaveta}
            className="relative rounded-lg p-2 text-white/90 transition hover:bg-white/10"
            aria-label={`Abrir sacola${quantidade > 0 ? ` com ${quantidade} itens` : ''}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {quantidade > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink">
                {quantidade}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Busca móvel */}
      {buscaAberta && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <form onSubmit={buscar} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              autoFocus
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar por peça ou marca"
              aria-label="Buscar produtos"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/45 focus:border-gold focus:outline-none"
            />
          </form>
        </div>
      )}

      {/* Menu móvel */}
      {menuAberto && (
        <nav
          className="animate-fade-up border-t border-white/10 lg:hidden"
          aria-label="Categorias (móvel)"
        >
          <ul className="container-kr divide-y divide-white/10 py-1">
            {NAVEGACAO.map((item) => (
              <li key={item.rotulo}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between py-3.5 text-sm font-medium text-white/90',
                    item.destaque && 'text-gold',
                  )}
                >
                  {item.rotulo}
                  <ChevronRight className="h-4 w-4 opacity-40" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
