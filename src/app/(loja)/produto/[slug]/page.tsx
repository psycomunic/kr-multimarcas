import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CardProduto } from '@/components/loja/card-produto'
import { DetalheProduto } from '@/components/loja/detalhe-produto'
import { formatBRL } from '@/lib/format'
import { buscarProdutoPorSlug, buscarRelacionados, listarSlugs } from '@/lib/repo'
import { urlDoSite } from '@/lib/site'
import { estoqueTotal, precoFinal, LABEL_CATEGORIA } from '@/lib/types'

const siteUrl = urlDoSite

/**
 * As páginas de produto são geradas no build e revalidadas a cada 5 minutos.
 * Antes cada visita disparava consultas ao Postgres em outra região — ~2,3s de
 * espera no clique. Servida do cache, a página sai em milissegundos.
 *
 * Preço desatualizado por até 5 min não é risco: o checkout sempre recalcula o
 * valor a partir do banco antes de gravar o pedido.
 */
export const revalidate = 300

export async function generateStaticParams() {
  const produtos = await listarSlugs()
  return produtos.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const produto = await buscarProdutoPorSlug(params.slug)
  if (!produto) return { title: 'Produto não encontrado' }

  const descricao = produto.description.slice(0, 155)

  // Esta é a imagem que o WhatsApp mostra na prévia quando o link do produto
  // vai na mensagem do pedido — por isso a foto do produto, e não a logo.
  const foto = produto.images[0]?.url

  return {
    title: `${produto.name} — ${produto.brand}`,
    description: `${produto.brand} · ${descricao}`,
    alternates: { canonical: `/produto/${produto.slug}` },
    openGraph: {
      type: 'website',
      title: `${produto.name} — ${produto.brand}`,
      description: `${formatBRL(precoFinal(produto))} · ${descricao}`,
      url: `${siteUrl}/produto/${produto.slug}`,
      images: foto ? [{ url: foto, width: 900, height: 1200, alt: produto.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      images: foto ? [foto] : undefined,
    },
  }
}

export default async function PaginaProduto({ params }: { params: { slug: string } }) {
  const produto = await buscarProdutoPorSlug(params.slug)
  if (!produto || !produto.active) notFound()

  const relacionados = await buscarRelacionados(produto, 4)
  const urlPublica = `${siteUrl}/produto/${produto.slug}`

  // Dados estruturados schema.org/Product — habilita rich results no Google.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.name,
    description: produto.description,
    sku: produto.sku,
    brand: { '@type': 'Brand', name: produto.brand },
    image: produto.images.map((i) => i.url),
    category: LABEL_CATEGORIA[produto.category],
    offers: {
      '@type': 'Offer',
      url: urlPublica,
      priceCurrency: 'BRL',
      price: precoFinal(produto).toFixed(2),
      availability:
        estoqueTotal(produto) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  return (
    <div className="container-kr py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Trilha de navegação" className="mb-6 text-xs text-ink-muted">
        <Link href="/" className="transition hover:text-ink">
          Início
        </Link>
        <span className="mx-1.5">/</span>
        <Link
          href={`/loja?categoria=${produto.category}`}
          className="transition hover:text-ink"
        >
          {LABEL_CATEGORIA[produto.category]}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-text">{produto.name}</span>
      </nav>

      <DetalheProduto produto={produto} urlPublica={urlPublica} />

      {relacionados.length > 0 && (
        <section className="mt-20">
          <h2 className="titulo-secao">Você também pode gostar</h2>
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {relacionados.map((p) => (
              <CardProduto key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
