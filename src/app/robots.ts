import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Painel e fluxo de compra não devem ser indexados.
      disallow: ['/admin', '/api', '/checkout', '/carrinho'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
