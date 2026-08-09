import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

// O painel sempre reflete o estado atual do banco — nada de cache.
export const dynamic = 'force-dynamic'

export default function LayoutAdminRaiz({ children }: { children: React.ReactNode }) {
  return children
}
