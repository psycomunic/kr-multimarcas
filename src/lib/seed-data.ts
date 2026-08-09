/**
 * Catálogo de exemplo (18 produtos) usado em dois lugares:
 *  1. `prisma/seed.ts` — popula o banco real;
 *  2. modo demonstração — quando não há DATABASE_URL, a loja serve estes dados
 *     em memória para nunca nascer vazia.
 *
 * Marcas são fictícias de propósito; troque pelas marcas reais da loja.
 */

import { nomeDaCor } from './cores'
import type { Category, Gender, Product } from './types'

export type SeedProduct = {
  sku: string
  slug: string
  name: string
  brand: string
  gender: Gender
  category: Category
  description: string
  price: number
  salePrice: number | null
  featured: boolean
  weightGrams: number
  widthCm: number
  heightCm: number
  lengthCm: number
  images: string[]
  sizes: string[]
  colors: string[]
}

const TAM_ROUPA = ['PP', 'P', 'M', 'G', 'GG']
const TAM_CALCADO_F = ['34', '35', '36', '37', '38', '39']
const TAM_CALCADO_M = ['38', '39', '40', '41', '42', '43']
const TAM_UNICO = ['Único']

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`

export const PRODUTOS_SEED: SeedProduct[] = [
  // ---------------------------------------------------------------- ROUPAS F
  {
    sku: 'KR-VST-001',
    slug: 'vestido-midi-plissado-noa',
    name: 'Vestido Midi Plissado',
    brand: 'Nôa',
    gender: 'feminino',
    category: 'roupas',
    description:
      'Vestido midi em tecido plissado com caimento fluido e cintura marcada. Peça versátil que resolve do trabalho ao happy hour — use com rasteira de dia e scarpin à noite.',
    price: 389.9,
    salePrice: 279.9,
    featured: true,
    weightGrams: 420,
    widthCm: 30,
    heightCm: 8,
    lengthCm: 40,
    images: [img('1595777457583-95e059d581b8'), img('1515372039744-b8f02a3ae446')],
    sizes: TAM_ROUPA,
    colors: ['#0B0B0D', '#6E1B2C', '#D9C6A5'],
  },
  {
    sku: 'KR-BLZ-002',
    slug: 'blazer-alfaiataria-oversized-alma-norte',
    name: 'Blazer Alfaiataria Oversized',
    brand: 'Alma Norte',
    gender: 'feminino',
    category: 'roupas',
    description:
      'Alfaiataria oversized com ombro estruturado e forro interno acetinado. Corte moderno que valoriza a silhueta sem perder o conforto.',
    price: 599.0,
    salePrice: null,
    featured: true,
    weightGrams: 780,
    widthCm: 35,
    heightCm: 10,
    lengthCm: 45,
    images: [img('1591047139829-d91aecb6caea'), img('1580651315530-69c8e0026377')],
    sizes: TAM_ROUPA,
    colors: ['#0B0B0D', '#C2A87C', '#1B2A4A'],
  },
  {
    sku: 'KR-CRP-003',
    slug: 'cropped-canelado-kr-basics',
    name: 'Cropped Canelado',
    brand: 'KR Basics',
    gender: 'feminino',
    category: 'roupas',
    description:
      'Cropped em malha canelada de toque macio e ótima recuperação. Básico essencial para compor com alfaiataria ou jeans de cintura alta.',
    price: 119.9,
    salePrice: 89.9,
    featured: false,
    weightGrams: 180,
    widthCm: 25,
    heightCm: 5,
    lengthCm: 32,
    images: [img('1576566588028-4147f3842f27'), img('1503342217505-b0a15ec3261c')],
    sizes: TAM_ROUPA,
    colors: ['#FFFFFF', '#0B0B0D', '#F09EBB', '#2E7D32'],
  },
  {
    sku: 'KR-CLC-004',
    slug: 'calca-wide-leg-jeans-duna',
    name: 'Calça Wide Leg Jeans',
    brand: 'Duna',
    gender: 'feminino',
    category: 'roupas',
    description:
      'Jeans wide leg de cintura alta com lavagem média e elastano na medida certa. Comprimento pensado para usar com salto ou tênis chunky.',
    price: 329.9,
    salePrice: null,
    featured: false,
    weightGrams: 620,
    widthCm: 32,
    heightCm: 8,
    lengthCm: 42,
    images: [img('1542272604-787c3835535d'), img('1541099649105-f69ad21f3246')],
    sizes: TAM_ROUPA,
    colors: ['#4A6C93', '#0B0B0D'],
  },

  // ---------------------------------------------------------------- ROUPAS M
  {
    sku: 'KR-CAM-005',
    slug: 'camiseta-pima-premium-kr-basics',
    name: 'Camiseta Pima Premium',
    brand: 'KR Basics',
    gender: 'masculino',
    category: 'roupas',
    description:
      'Algodão Pima de fibra extralonga: toque sedoso, menos bolinhas e caimento que não deforma na lavagem. Gola reforçada e barra reta.',
    price: 149.9,
    salePrice: 109.9,
    featured: true,
    weightGrams: 220,
    widthCm: 28,
    heightCm: 5,
    lengthCm: 35,
    images: [img('1521572163474-6864f9cf17ab'), img('1618354691373-d851c5c3a990')],
    sizes: TAM_ROUPA,
    colors: ['#FFFFFF', '#0B0B0D', '#1B2A4A', '#4B5320'],
  },
  {
    sku: 'KR-JQT-006',
    slug: 'jaqueta-corta-vento-corvo',
    name: 'Jaqueta Corta-Vento',
    brand: 'Corvo',
    gender: 'masculino',
    category: 'roupas',
    description:
      'Corta-vento leve com capuz embutido, punhos elásticos e acabamento repelente à água. Dobra pequeno e cabe na mochila.',
    price: 449.0,
    salePrice: null,
    featured: false,
    weightGrams: 480,
    widthCm: 32,
    heightCm: 10,
    lengthCm: 40,
    images: [img('1551028719-00167b16eac5'), img('1544022613-e87ca75a784a')],
    sizes: TAM_ROUPA,
    colors: ['#0B0B0D', '#F2762E', '#1B2A4A'],
  },
  {
    sku: 'KR-CRG-007',
    slug: 'calca-cargo-ripstop-corvo',
    name: 'Calça Cargo Ripstop',
    brand: 'Corvo',
    gender: 'masculino',
    category: 'roupas',
    description:
      'Cargo em tecido ripstop resistente, com seis bolsos funcionais e ajuste no tornozelo. Streetwear utilitário sem exagero.',
    price: 359.9,
    salePrice: 299.9,
    featured: false,
    weightGrams: 640,
    widthCm: 32,
    heightCm: 8,
    lengthCm: 42,
    images: [img('1473966968600-fa801b869a1a'), img('1594633312681-425c7b97ccd1')],
    sizes: TAM_ROUPA,
    colors: ['#4B5320', '#0B0B0D', '#C2A87C'],
  },
  {
    sku: 'KR-CMS-008',
    slug: 'camisa-linho-manga-curta-alta-costa',
    name: 'Camisa Linho Manga Curta',
    brand: 'Alta Costa',
    gender: 'masculino',
    category: 'roupas',
    description:
      'Linho puro com gola camp e corte reto. Respirável, fresca e com aquele amassado bonito que só o linho de verdade tem.',
    price: 279.9,
    salePrice: null,
    featured: true,
    weightGrams: 300,
    widthCm: 30,
    heightCm: 6,
    lengthCm: 38,
    images: [img('1602810318383-e386cc2a3ccf'), img('1596755094514-f87e34085b2c')],
    sizes: TAM_ROUPA,
    colors: ['#F3EFE7', '#A8D3F0', '#4B5320'],
  },

  // ---------------------------------------------------------------- ROUPAS U
  {
    sku: 'KR-MLT-009',
    slug: 'moletom-capuz-boxy-zenite',
    name: 'Moletom Capuz Boxy',
    brand: 'Zênite',
    gender: 'unissex',
    category: 'roupas',
    description:
      'Moletom peluciado por dentro, modelagem boxy e capuz forrado. Gramatura alta (380g/m²) para aguentar o inverno inteiro.',
    price: 329.9,
    salePrice: 249.9,
    featured: true,
    weightGrams: 720,
    widthCm: 35,
    heightCm: 12,
    lengthCm: 45,
    images: [img('1556821840-3a63f95609a7'), img('1620799140408-edc6dcb6d633')],
    sizes: TAM_ROUPA,
    colors: ['#0B0B0D', '#D5D5DC', '#6E1B2C'],
  },

  // -------------------------------------------------------------- CALÇADOS F
  {
    sku: 'KR-SCP-010',
    slug: 'scarpin-bico-fino-studio-ferrao',
    name: 'Scarpin Bico Fino',
    brand: 'Studio Ferrão',
    gender: 'feminino',
    category: 'calcados',
    description:
      'Scarpin clássico em couro legítimo, salto 8cm e palmilha acolchoada. O sapato que resolve casamento, formatura e reunião.',
    price: 459.0,
    salePrice: null,
    featured: false,
    weightGrams: 850,
    widthCm: 25,
    heightCm: 12,
    lengthCm: 35,
    images: [img('1543163521-1bf539c55dd2'), img('1560769629-975ec94e6a86')],
    sizes: TAM_CALCADO_F,
    colors: ['#0B0B0D', '#6E1B2C', '#C2A87C'],
  },
  {
    sku: 'KR-SND-011',
    slug: 'sandalia-salto-bloco-noa',
    name: 'Sandália Salto Bloco',
    brand: 'Nôa',
    gender: 'feminino',
    category: 'calcados',
    description:
      'Salto bloco de 6cm — estável o suficiente para o dia inteiro. Tiras finas em couro e fivela regulável no tornozelo.',
    price: 329.9,
    salePrice: 249.9,
    featured: true,
    weightGrams: 700,
    widthCm: 24,
    heightCm: 12,
    lengthCm: 33,
    images: [img('1603487742131-4160ec999306'), img('1595950653106-6c9ebd614d3a')],
    sizes: TAM_CALCADO_F,
    colors: ['#C2A87C', '#0B0B0D', '#FFD131'],
  },

  // -------------------------------------------------------------- CALÇADOS M
  {
    sku: 'KR-TEN-012',
    slug: 'tenis-runner-leve-zenite',
    name: 'Tênis Runner Leve',
    brand: 'Zênite',
    gender: 'masculino',
    category: 'calcados',
    description:
      'Cabedal em mesh respirável e entressola em EVA de alta densidade. Leve para corrida curta e confortável para o dia a dia.',
    price: 499.0,
    salePrice: 399.0,
    featured: true,
    weightGrams: 800,
    widthCm: 30,
    heightCm: 13,
    lengthCm: 36,
    images: [img('1542291026-7eec264c27ff'), img('1600269452121-4f2416e55c28')],
    sizes: TAM_CALCADO_M,
    colors: ['#0B0B0D', '#FFFFFF', '#2E90FA'],
  },
  {
    sku: 'KR-BOT-013',
    slug: 'bota-chelsea-couro-studio-ferrao',
    name: 'Bota Chelsea Couro',
    brand: 'Studio Ferrão',
    gender: 'masculino',
    category: 'calcados',
    description:
      'Chelsea em couro pelica com elástico lateral e solado de borracha antiderrapante. Envelhece bonito e vai bem com jeans ou alfaiataria.',
    price: 689.0,
    salePrice: null,
    featured: false,
    weightGrams: 1100,
    widthCm: 30,
    heightCm: 15,
    lengthCm: 38,
    images: [img('1608256246200-53e635b5b65f'), img('1520639888713-7851133b1ed0')],
    sizes: TAM_CALCADO_M,
    colors: ['#5C3A21', '#0B0B0D'],
  },

  // -------------------------------------------------------------- CALÇADOS U
  {
    sku: 'KR-TEN-014',
    slug: 'tenis-chunky-retro-vitrine-22',
    name: 'Tênis Chunky Retrô',
    brand: 'Vitrine 22',
    gender: 'unissex',
    category: 'calcados',
    description:
      'Silhueta chunky inspirada nos anos 90, com sobreposições em camurça e solado volumoso. Combina com wide leg e short.',
    price: 549.0,
    salePrice: 449.0,
    featured: true,
    weightGrams: 950,
    widthCm: 30,
    heightCm: 14,
    lengthCm: 37,
    images: [img('1549298916-b41d501d3772'), img('1556906781-9a412961c28c')],
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42'],
    colors: ['#FFFFFF', '#0B0B0D', '#D9C6A5'],
  },

  // ------------------------------------------------------------- ACESSÓRIOS
  {
    sku: 'KR-BLS-015',
    slug: 'bolsa-tote-couro-vitrine-22',
    name: 'Bolsa Tote Couro',
    brand: 'Vitrine 22',
    gender: 'feminino',
    category: 'acessorios',
    description:
      'Tote espaçosa em couro com forro interno, bolso para notebook até 14" e alça de ombro. Estrutura firme que não desaba com o uso.',
    price: 699.0,
    salePrice: 559.0,
    featured: true,
    weightGrams: 900,
    widthCm: 40,
    heightCm: 15,
    lengthCm: 32,
    images: [img('1584917865442-de89df76afd3'), img('1548036328-c9fa89d128fa')],
    sizes: TAM_UNICO,
    colors: ['#5C3A21', '#0B0B0D', '#C2A87C'],
  },
  {
    sku: 'KR-OCL-016',
    slug: 'oculos-de-sol-quadrado-zenite',
    name: 'Óculos de Sol Quadrado',
    brand: 'Zênite',
    gender: 'unissex',
    category: 'acessorios',
    description:
      'Armação quadrada em acetato com lentes polarizadas UV400 e hastes com dobradiça flex. Acompanha case rígido e flanela.',
    price: 279.9,
    salePrice: null,
    featured: false,
    weightGrams: 220,
    widthCm: 18,
    heightCm: 8,
    lengthCm: 16,
    images: [img('1511499767150-a48a237f0083'), img('1572635196237-14b3f281503f')],
    sizes: TAM_UNICO,
    colors: ['#0B0B0D', '#5C3A21', '#FFD131'],
  },
  {
    sku: 'KR-REL-017',
    slug: 'relogio-aco-minimal-alta-costa',
    name: 'Relógio Aço Minimal',
    brand: 'Alta Costa',
    gender: 'masculino',
    category: 'acessorios',
    description:
      'Caixa de 40mm em aço inoxidável, mostrador limpo e resistência 5ATM. Pulseira intercambiável — vem com malha milanesa.',
    price: 899.0,
    salePrice: 749.0,
    featured: true,
    weightGrams: 350,
    widthCm: 12,
    heightCm: 8,
    lengthCm: 12,
    images: [img('1523275335684-37898b6baf30'), img('1509941943102-10c232535736')],
    sizes: TAM_UNICO,
    colors: ['#C0C0C8', '#0B0B0D', '#FFD131'],
  },
  {
    sku: 'KR-CNT-018',
    slug: 'cinto-couro-fivela-dourada-alta-costa',
    name: 'Cinto Couro Fivela Dourada',
    brand: 'Alta Costa',
    gender: 'unissex',
    category: 'acessorios',
    description:
      'Couro legítimo de 3,5cm com fivela dourada escovada. Acabamento costurado à mão nas bordas — dura anos.',
    price: 199.9,
    salePrice: null,
    featured: false,
    weightGrams: 260,
    widthCm: 12,
    heightCm: 6,
    lengthCm: 25,
    images: [img('1553062407-98eeb64c6a62'), img('1624222247344-550fb60583dc')],
    sizes: ['P', 'M', 'G'],
    colors: ['#0B0B0D', '#5C3A21'],
  },
]

/**
 * Materializa o seed em objetos `Product` completos, com ids determinísticos.
 * Determinístico de propósito: o modo demonstração precisa gerar sempre os
 * mesmos ids para que links e carrinho continuem válidos entre renders.
 */
export function construirProdutosDemo(): Product[] {
  const base = new Date('2025-01-06T12:00:00.000Z').getTime()

  return PRODUTOS_SEED.map((p, indice) => {
    const variants = p.colors.flatMap((hex, ci) =>
      p.sizes.map((size, si) => ({
        id: `${p.sku}-V${ci}${si}`,
        size,
        colorName: nomeDaCor(hex),
        colorHex: hex,
        // Estoque pseudo-aleatório porém estável: alguns tamanhos esgotados de
        // propósito para exercitar os estados "indisponível" da interface.
        stock: (indice * 7 + ci * 3 + si * 5) % 11 === 0 ? 0 : ((indice + ci + si) % 9) + 2,
      })),
    )

    const stock = variants.reduce((acc, v) => acc + v.stock, 0)
    const criadoEm = new Date(base - indice * 36e5).toISOString()

    return {
      id: `demo-${p.sku}`,
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      gender: p.gender,
      category: p.category,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice,
      stock,
      active: true,
      featured: p.featured,
      weightGrams: p.weightGrams,
      widthCm: p.widthCm,
      heightCm: p.heightCm,
      lengthCm: p.lengthCm,
      createdAt: criadoEm,
      updatedAt: criadoEm,
      images: p.images.map((url, i) => ({ id: `${p.sku}-IMG${i}`, url, position: i })),
      variants,
    } satisfies Product
  })
}
