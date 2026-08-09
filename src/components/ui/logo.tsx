import Image from 'next/image'

import { cn } from '@/lib/cn'

/**
 * Logo oficial KR Multimarcas — coroa dourada sobre o monograma "KR" (o K e o R
 * formam um duplo chevron), com "MULTI MARCAS" ao lado.
 *
 * Os arquivos em `/public` foram extraídos da arte original da marca com fundo
 * transparente. Para trocar a logo, basta substituir esses PNGs mantendo os
 * nomes (e atualizar as proporções abaixo, se mudarem).
 *
 * `variante="clara"` → fundos escuros (traço branco + coroa ouro).
 * `variante="escura"` → fundos claros (traço preto + coroa ouro).
 */

const ARQUIVOS = {
  completa: {
    clara: { src: '/logo-kr.png', largura: 352, altura: 126 },
    escura: { src: '/logo-kr-escuro.png', largura: 352, altura: 126 },
  },
  simbolo: {
    clara: { src: '/logo-kr-simbolo.png', largura: 124, altura: 126 },
    escura: { src: '/logo-kr-simbolo-escuro.png', largura: 124, altura: 126 },
  },
} as const

export function Logo({
  variante = 'clara',
  className,
  comTexto = true,
  prioridade = false,
}: {
  variante?: 'clara' | 'escura'
  className?: string
  /** `false` mostra só a coroa + monograma, sem a palavra MULTIMARCAS. */
  comTexto?: boolean
  prioridade?: boolean
}) {
  const arquivo = ARQUIVOS[comTexto ? 'completa' : 'simbolo'][variante]

  return (
    <Image
      src={arquivo.src}
      alt="KR Multimarcas"
      width={arquivo.largura}
      height={arquivo.altura}
      priority={prioridade}
      className={cn('h-10 w-auto', className)}
    />
  )
}

/** Atalho para o monograma isolado (avatares, ícones, sidebar fechada). */
export function LogoMarca({
  className,
  variante = 'clara',
}: {
  className?: string
  variante?: 'clara' | 'escura'
}) {
  return <Logo variante={variante} comTexto={false} className={cn('h-8 w-auto', className)} />
}
