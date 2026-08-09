import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type VarianteBotao = 'primario' | 'escuro' | 'contorno' | 'fantasma' | 'whatsapp'
export type TamanhoBotao = 'sm' | 'md' | 'lg'

/**
 * Regra de marca: fundo ouro SEMPRE com texto preto — texto branco sobre ouro
 * reprova em contraste e descaracteriza a identidade.
 */
const VARIANTES: Record<VarianteBotao, string> = {
  primario:
    'bg-gold text-ink hover:bg-gold-400 active:bg-gold-600 shadow-soft hover:shadow-gold',
  escuro: 'bg-ink text-white hover:bg-ink-soft shadow-soft',
  contorno: 'border border-ink/15 bg-white text-ink hover:border-ink/40 hover:bg-canvas',
  fantasma: 'text-ink hover:bg-ink/5',
  whatsapp: 'bg-[#25D366] text-[#052E16] hover:bg-[#1FBF5B] shadow-soft',
}

const TAMANHOS: Record<TamanhoBotao, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2.5',
}

const BASE =
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] whitespace-nowrap'

export function classesBotao(
  variante: VarianteBotao = 'primario',
  tamanho: TamanhoBotao = 'md',
  className?: string,
) {
  return cn(BASE, VARIANTES[variante], TAMANHOS[tamanho], className)
}

type BotaoProps = ComponentPropsWithoutRef<'button'> & {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
  carregando?: boolean
}

export function Botao({
  variante = 'primario',
  tamanho = 'md',
  carregando = false,
  className,
  children,
  disabled,
  ...props
}: BotaoProps) {
  return (
    <button
      className={classesBotao(variante, tamanho, className)}
      disabled={disabled || carregando}
      {...props}
    >
      {carregando && <Spinner />}
      {children}
    </button>
  )
}

type BotaoLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
  children: ReactNode
}

export function BotaoLink({
  variante = 'primario',
  tamanho = 'md',
  className,
  children,
  ...props
}: BotaoLinkProps) {
  return (
    <Link className={classesBotao(variante, tamanho, className)} {...props}>
      {children}
    </Link>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  )
}
