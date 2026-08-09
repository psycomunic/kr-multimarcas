import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export function CabecalhoPainel({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao?: string
  acao?: ReactNode
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-ink-text">{descricao}</p>}
      </div>
      {acao}
    </header>
  )
}

export function CartaoKPI({
  rotulo,
  valor,
  detalhe,
  Icone,
  destaque = false,
}: {
  rotulo: string
  valor: string
  detalhe?: string
  Icone: React.ComponentType<{ className?: string }>
  destaque?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        destaque ? 'border-transparent bg-ink text-white' : 'border-line bg-white',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            'text-xs font-medium uppercase tracking-wide',
            destaque ? 'text-white/60' : 'text-ink-muted',
          )}
        >
          {rotulo}
        </p>
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            destaque ? 'bg-gold text-ink' : 'bg-canvas text-ink-muted',
          )}
        >
          <Icone className="h-4 w-4" />
        </span>
      </div>
      <p className={cn('mt-3 font-display text-2xl font-bold', destaque && 'text-gold')}>{valor}</p>
      {detalhe && (
        <p className={cn('mt-1 text-xs', destaque ? 'text-white/50' : 'text-ink-muted')}>
          {detalhe}
        </p>
      )}
    </div>
  )
}

export function CartaoPainel({
  titulo,
  acao,
  children,
  className,
}: {
  titulo: string
  acao?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-line bg-white', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-base font-semibold">{titulo}</h2>
        {acao}
      </header>
      {children}
    </section>
  )
}

export function EstadoVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao: string
  acao?: { rotulo: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="font-display text-base font-semibold">{titulo}</p>
      <p className="max-w-sm text-sm text-ink-text">{descricao}</p>
      {acao && (
        <Link
          href={acao.href}
          className="mt-1 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-400"
        >
          {acao.rotulo}
        </Link>
      )}
    </div>
  )
}
