import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: process.env.NEXT_PUBLIC_STORE_NAME || 'KR Multimarcas',
    short_name: 'KR',
    description: 'Moda multimarcas com atendimento e fechamento pelo WhatsApp.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0B0D',
    theme_color: '#0B0B0D',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
