import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import type { OrderStatus } from '@/lib/types'
import { LABEL_STATUS } from '@/lib/types'

export function Selo({
  children,
  className,
  tom = 'neutro',
}: {
  children: ReactNode
  className?: string
  tom?: 'neutro' | 'ouro' | 'escuro' | 'sucesso' | 'aviso' | 'erro' | 'info'
}) {
  const tons = {
    neutro: 'bg-line text-ink-text',
    ouro: 'bg-gold text-ink',
    escuro: 'bg-ink text-white',
    sucesso: 'bg-success/12 text-success',
    aviso: 'bg-warning/14 text-warning',
    erro: 'bg-danger/12 text-danger',
    info: 'bg-info/12 text-info',
  } as const

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none',
        tons[tom],
        className,
      )}
    >
      {children}
    </span>
  )
}

const TOM_STATUS: Record<OrderStatus, 'info' | 'sucesso' | 'aviso' | 'erro' | 'escuro'> = {
  novo: 'info',
  pago: 'sucesso',
  enviado: 'aviso',
  entregue: 'escuro',
  cancelado: 'erro',
}

export function SeloStatus({ status }: { status: OrderStatus }) {
  return <Selo tom={TOM_STATUS[status]}>{LABEL_STATUS[status]}</Selo>
}
