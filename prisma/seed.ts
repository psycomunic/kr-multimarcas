/**
 * Popula o banco com o catálogo de exemplo.
 *   npm run db:push && npm run db:seed
 *
 * Idempotente: apaga produtos com os SKUs do seed antes de recriá-los, então
 * pode ser rodado quantas vezes for preciso sem duplicar nada. Pedidos reais
 * nunca são tocados.
 */

import { PrismaClient } from '@prisma/client'

import { nomeDaCor } from '../src/lib/cores'
import { PRODUTOS_SEED } from '../src/lib/seed-data'

const prisma = new PrismaClient()

async function main() {
  const skus = PRODUTOS_SEED.map((p) => p.sku)

  console.log('Limpando produtos do seed anterior…')
  await prisma.product.deleteMany({ where: { sku: { in: skus } } })

  console.log(`Criando ${PRODUTOS_SEED.length} produtos…`)
  for (const [indice, p] of PRODUTOS_SEED.entries()) {
    const variacoes = p.colors.flatMap((hex, ci) =>
      p.sizes.map((size, si) => ({
        size,
        colorHex: hex,
        colorName: nomeDaCor(hex),
        // Mesma fórmula do modo demonstração: estoque variado, alguns zerados.
        stock: (indice * 7 + ci * 3 + si * 5) % 11 === 0 ? 0 : ((indice + ci + si) % 9) + 2,
      })),
    )

    await prisma.product.create({
      data: {
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        gender: p.gender,
        category: p.category,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice,
        stock: variacoes.reduce((acc, v) => acc + v.stock, 0),
        active: true,
        featured: p.featured,
        weightGrams: p.weightGrams,
        widthCm: p.widthCm,
        heightCm: p.heightCm,
        lengthCm: p.lengthCm,
        images: { create: p.images.map((url, position) => ({ url, position })) },
        variants: { create: variacoes },
      },
    })
    console.log(`  ✓ ${p.sku} — ${p.name}`)
  }

  console.log('Garantindo a linha de configurações…')
  await prisma.settings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'KR Multimarcas',
      whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '5547999999999',
      freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 399),
      originCep: process.env.ORIGIN_CEP || '89000000',
    },
    update: {},
  })

  console.log('\nSeed concluído.')
}

main()
  .catch((erro) => {
    console.error('Falha no seed:', erro)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
