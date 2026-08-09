import { cn } from '@/lib/cn'

/**
 * Logo KR Multimarcas: coroa dourada sobre o monograma "KR", cujo K e R formam
 * um chevron, com a palavra MULTIMARCAS espaçada abaixo.
 *
 * `variante="clara"` = para fundos escuros (KR branco + coroa ouro).
 * `variante="escura"` = para fundos claros (KR preto + coroa ouro).
 */
export function Logo({
  variante = 'clara',
  className,
  comTexto = true,
}: {
  variante?: 'clara' | 'escura'
  className?: string
  comTexto?: boolean
}) {
  const corMonograma = variante === 'clara' ? '#FFFFFF' : '#0B0B0D'
  const corLegenda = variante === 'clara' ? '#FFFFFF' : '#0B0B0D'

  return (
    <svg
      viewBox="0 0 220 96"
      className={cn('h-10 w-auto', className)}
      role="img"
      aria-label="KR Multimarcas"
    >
      <defs>
        <linearGradient id="kr-ouro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD131" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
      </defs>

      {/* Coroa */}
      <g fill="url(#kr-ouro)">
        <path d="M110 6 L124 26 L142 12 L136 40 L84 40 L78 12 L96 26 Z" />
        <rect x="84" y="44" width="52" height="7" rx="3.5" />
        <circle cx="78" cy="10" r="4.5" />
        <circle cx="142" cy="10" r="4.5" />
        <circle cx="110" cy="3.5" r="3.5" />
      </g>

      {/* Monograma KR — o vértice do K e a perna do R formam o chevron */}
      <g fill={corMonograma}>
        {/* K */}
        <rect x="62" y="56" width="9" height="34" rx="1.5" />
        <path d="M73 73 L92 56 L104 56 L84 73.5 L104 90 L92 90 Z" />
        {/* R */}
        <path d="M112 56 H134 a13 13 0 0 1 0 26 h-6 l14 8 h-13 l-14 -8 V72 h18 a4.5 4.5 0 0 0 0 -9 H121 V90 h-9 Z" />
      </g>

      {comTexto && (
        <text
          x="110"
          y="94"
          textAnchor="middle"
          fill={corLegenda}
          fontFamily="var(--font-sora), Sora, system-ui, sans-serif"
          fontSize="11"
          fontWeight="600"
          letterSpacing="5.4"
          opacity="0.92"
        >
          MULTIMARCAS
        </text>
      )}
    </svg>
  )
}

/** Versão compacta (só a coroa + KR), para favicon, avatar e sidebar fechada. */
export function LogoMarca({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-8 w-8', className)} role="img" aria-label="KR">
      <defs>
        <linearGradient id="kr-ouro-mini" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD131" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0B0B0D" />
      <path d="M32 10 L39 20 L48 13 L45 27 L19 27 L16 13 L25 20 Z" fill="url(#kr-ouro-mini)" />
      <rect x="19" y="30" width="26" height="4" rx="2" fill="url(#kr-ouro-mini)" />
      <text
        x="32"
        y="54"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Sora, system-ui, sans-serif"
        fontSize="18"
        fontWeight="700"
        letterSpacing="0.5"
      >
        KR
      </text>
    </svg>
  )
}
