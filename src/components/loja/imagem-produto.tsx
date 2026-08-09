'use client'

import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * Imagem de produto com fallback: se a URL quebrar (link externo fora do ar,
 * arquivo removido do Storage), cai para um placeholder da marca em vez de
 * deixar um buraco na grade.
 */
export function ImagemProduto({
  src,
  alt,
  className,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  priority = false,
}: {
  src?: string | null
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  const [falhou, setFalhou] = useState(false)
  const usarPlaceholder = !src || falhou

  if (usarPlaceholder) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-ink-gradient',
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <span className="font-display text-sm font-semibold tracking-[0.3em] text-gold/70">KR</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFalhou(true)}
      className={cn('object-cover', className)}
    />
  )
}
