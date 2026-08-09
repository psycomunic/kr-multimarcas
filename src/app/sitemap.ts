import type { MetadataRoute } from 'next'

import { COLECOES } from '@/lib/colecoes'
import { listarSlugs } from '@/lib/repo'
import { urlDoSite as siteUrl } from '@/lib/site'
import { CATEGORIAS, GENEROS } from '@/lib/types'

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
    ...COLECOES.map((c) => ({
      url: `${siteUrl}/loja?colecao=${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
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
