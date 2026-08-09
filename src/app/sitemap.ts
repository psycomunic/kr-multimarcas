import type { MetadataRoute } from 'next'

import { listarSlugs } from '@/lib/repo'
import { CATEGORIAS, GENEROS } from '@/lib/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const produtos = await listarSlugs()

  const fixas: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/loja`, changeFrequency: 'daily', priority: 0.9 },
    ...GENEROS.map((g) => ({
      url: `${siteUrl}/loja?genero=${g}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...CATEGORIAS.map((c) => ({
      url: `${siteUrl}/loja?categoria=${c}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]

  return [
    ...fixas,
    ...produtos.map((p) => ({
      url: `${siteUrl}/produto/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
