import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
  // Manifesto próprio do painel: o da loja abre em "/", e o app instalado
  // precisa abrir direto em /admin.
  manifest: '/manifest-admin.json',
  appleWebApp: {
    capable: true,
    title: 'KR Painel',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B0B0D',
  width: 'device-width',
  initialScale: 1,
  // Impede o zoom automático do iOS ao focar um campo, sem travar o pinça-zoom.
  maximumScale: 5,
}

// O painel sempre reflete o estado atual do banco — nada de cache.
export const dynamic = 'force-dynamic'

export default function LayoutAdminRaiz({ children }: { children: React.ReactNode }) {
  return children
}
