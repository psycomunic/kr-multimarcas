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
    <header className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {/* No celular o nome da tela já está no cabeçalho fixo — aqui o título
            fica menor para não repetir em corpo de página. */}
        <h1 className="font-display text-xl font-bold sm:text-2xl">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm leading-relaxed text-ink-text">{descricao}</p>}
      </div>
      {acao && <div className="[&>*]:w-full sm:[&>*]:w-auto">{acao}</div>}
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
        'rounded-2xl border p-4 sm:p-5',
        destaque ? 'border-transparent bg-ink text-white' : 'border-line bg-white',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            'text-[11px] font-medium uppercase leading-tight tracking-wide sm:text-xs',
            destaque ? 'text-white/60' : 'text-ink-muted',
          )}
        >
          {rotulo}
        </p>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl',
            destaque ? 'bg-gold text-ink' : 'bg-canvas text-ink-muted',
          )}
        >
          <Icone className="h-4 w-4" />
        </span>
      </div>
      <p
        className={cn(
          'mt-2 font-display text-xl font-bold sm:mt-3 sm:text-2xl',
          destaque && 'text-gold',
        )}
      >
        {valor}
      </p>
      {detalhe && (
        <p
          className={cn(
            'mt-1 text-[11px] leading-snug sm:text-xs',
            destaque ? 'text-white/50' : 'text-ink-muted',
          )}
        >
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
    // `min-w-0` evita que tabelas com rolagem horizontal estiquem a coluna do
    // grid e empurrem a página inteira para o lado.
    <section className={cn('min-w-0 rounded-2xl border border-line bg-white', className)}>
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
