import type { MetadataRoute } from 'next'

import { urlDoSite as siteUrl } from '@/lib/site'

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
