import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'

import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const nomeLoja = process.env.NEXT_PUBLIC_STORE_NAME || 'KR Multimarcas'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${nomeLoja} — moda multimarcas com atendimento no WhatsApp`,
    template: `%s · ${nomeLoja}`,
  },
  description:
    'Roupas, calçados e acessórios femininos e masculinos das melhores marcas. Escolha no site e finalize a compra pelo WhatsApp, com envio para todo o Brasil.',
  keywords: ['moda', 'multimarcas', 'roupas', 'calçados', 'acessórios', 'loja online', 'WhatsApp'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: nomeLoja,
    title: `${nomeLoja} — moda multimarcas`,
    description:
      'Escolha suas peças no site e finalize pelo WhatsApp. Envio para todo o Brasil.',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon.svg',
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#0B0B0D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-canvas">{children}</body>
    </html>
  )
}
