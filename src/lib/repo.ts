/**
 * Camada de acesso a dados.
 *
 * Toda a aplicação fala apenas com este módulo — nunca com o Prisma direto.
 * Cada função tem dois caminhos: banco real (Prisma/Supabase) ou modo
 * demonstração (memória). Assim as telas são idênticas nos dois modos.
 *
 * Nota de escala: filtros finos (tamanho, faixa de preço), ordenação por preço
 * promocional e paginação são aplicados em memória depois de um filtro grosso
 * no banco. É a escolha certa para o porte de uma loja multimarcas (centenas a
 * poucos milhares de SKUs) e mantém as duas implementações consistentes. Se o
 * catálogo crescer muito, mover `aplicarFiltros` para SQL é o próximo passo.
 */

import { cache } from 'react'

import { dbAtivo, prisma } from './db'
import { demoDb } from './demo-store'
import { nomeDaCor } from './cores'
import { slugify } from './format'
import {
  estoqueTotal,
  precoFinal,
  type Category,
  type Gender,
  type Order,
  type OrderStatus,
  type PaymentMethod,
  type Product,
  type Settings,
} from './types'

export const ESTOQUE_BAIXO = 6

// ---------------------------------------------------------------------------
// Mapeamento Prisma -> domínio (Decimal -> number, Date -> ISO string)
// ---------------------------------------------------------------------------

type LinhaProduto = {
  id: string
  sku: string
  slug: string
  name: string
  brand: string
  gender: string
  category: string
  colecao: string | null
  description: string
  price: unknown
  salePrice: unknown
  stock: number
  active: boolean
  featured: boolean
  weightGrams: number
  widthCm: number
  heightCm: number
  lengthCm: number
  createdAt: Date
  updatedAt: Date
  images: { id: string; url: string; position: number }[]
  variants: { id: string; size: string; colorName: string; colorHex: string; stock: number }[]
}

const num = (v: unknown): number => (v == null ? 0 : Number(v))

function mapProduto(r: LinhaProduto): Product {
  return {
    id: r.id,
    sku: r.sku,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    gender: r.gender as Gender,
    category: r.category as Category,
    colecao: r.colecao ?? null,
    description: r.description,
    price: num(r.price),
    salePrice: r.salePrice == null ? null : num(r.salePrice),
    stock: r.stock,
    active: r.active,
    featured: r.featured,
    weightGrams: r.weightGrams,
    widthCm: r.widthCm,
    heightCm: r.heightCm,
    lengthCm: r.lengthCm,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    images: [...r.images].sort((a, b) => a.position - b.position),
    variants: r.variants,
  }
}

type LinhaPedido = {
  id: string
  code: string
  customerName: string
  customerPhone: string
  customerCep: string
  customerAddress: string
  customerCity: string
  paymentMethod: string
  note: string | null
  subtotal: unknown
  shipping: unknown
  total: unknown
  status: string
  channel: string
  trackingCode: string | null
  createdAt: Date
  items: {
    id: string
    productId: string | null
    slug: string | null
    name: string
    brand: string
    size: string
    colorName: string
    qty: number
    unitPrice: unknown
  }[]
}

function mapPedido(r: LinhaPedido): Order {
  return {
    id: r.id,
    code: r.code,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerCep: r.customerCep,
    customerAddress: r.customerAddress,
    customerCity: r.customerCity,
    paymentMethod: r.paymentMethod as PaymentMethod,
    note: r.note,
    subtotal: num(r.subtotal),
    shipping: num(r.shipping),
    total: num(r.total),
    status: r.status as OrderStatus,
    channel: r.channel,
    trackingCode: r.trackingCode,
    createdAt: r.createdAt.toISOString(),
    items: r.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      slug: i.slug ?? null,
      name: i.name,
      brand: i.brand,
      size: i.size,
      colorName: i.colorName,
      qty: i.qty,
      unitPrice: num(i.unitPrice),
    })),
  }
}

const incluirRelacoes = { images: true, variants: true } as const

// ---------------------------------------------------------------------------
// Catálogo — leitura
// ---------------------------------------------------------------------------

export type Ordenacao = 'relevancia' | 'menor-preco' | 'maior-preco' | 'novidades'

export type FiltrosProduto = {
  genero?: Gender
  categoria?: Category
  busca?: string
  /** Slug da categoria da loja (ver `lib/colecoes.ts`). */
  colecao?: string
  tamanhos?: string[]
  precoMin?: number
  precoMax?: number
  somenteOfertas?: boolean
  ordenacao?: Ordenacao
  pagina?: number
  porPagina?: number
}

export type ResultadoCatalogo = {
  itens: Product[]
  total: number
  pagina: number
  totalPaginas: number
  /** Facetas calculadas sobre o resultado antes da paginação. */
  tamanhos: string[]
  marcas: string[]
  precoMaximo: number
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

function aplicarFiltros(produtos: Product[], f: FiltrosProduto): ResultadoCatalogo {
  let itens = produtos.filter((p) => p.active)

  if (f.genero) {
    // Peças unissex aparecem tanto em Feminino quanto em Masculino.
    itens = itens.filter((p) => p.gender === f.genero || p.gender === 'unissex')
  }
  if (f.categoria) itens = itens.filter((p) => p.category === f.categoria)

  if (f.busca?.trim()) {
    const termos = normalizar(f.busca).split(/\s+/).filter(Boolean)
    itens = itens.filter((p) => {
      const alvo = normalizar(`${p.name} ${p.brand} ${p.description} ${p.sku}`)
      return termos.every((t) => alvo.includes(t))
    })
  }

  if (f.colecao) itens = itens.filter((p) => p.colecao === f.colecao)

  // Facetas são calculadas antes dos filtros de tamanho/preço para que o painel
  // de filtros não "perca" opções conforme o usuário seleciona.
  const tamanhos = Array.from(new Set(itens.flatMap((p) => p.variants.map((v) => v.size)))).sort(
    (a, b) => {
      const na = Number(a)
      const nb = Number(b)
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
      const ordem = ['PP', 'P', 'M', 'G', 'GG', 'Único']
      return ordem.indexOf(a) - ordem.indexOf(b)
    },
  )
  const marcas = Array.from(new Set(itens.map((p) => p.brand))).sort()
  const precoMaximo = itens.reduce((max, p) => Math.max(max, p.price), 0)

  if (f.tamanhos?.length) {
    itens = itens.filter((p) =>
      p.variants.some((v) => f.tamanhos!.includes(v.size) && v.stock > 0),
    )
  }
  if (typeof f.precoMin === 'number') itens = itens.filter((p) => precoFinal(p) >= f.precoMin!)
  if (typeof f.precoMax === 'number') itens = itens.filter((p) => precoFinal(p) <= f.precoMax!)
  if (f.somenteOfertas) itens = itens.filter((p) => precoFinal(p) < p.price)

  switch (f.ordenacao) {
    case 'menor-preco':
      itens.sort((a, b) => precoFinal(a) - precoFinal(b))
      break
    case 'maior-preco':
      itens.sort((a, b) => precoFinal(b) - precoFinal(a))
      break
    case 'novidades':
      itens.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      break
    default:
      // Relevância: destaques primeiro, depois com estoque, depois mais novos.
      itens.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        const ea = estoqueTotal(a) > 0 ? 0 : 1
        const eb = estoqueTotal(b) > 0 ? 0 : 1
        if (ea !== eb) return ea - eb
        return b.createdAt.localeCompare(a.createdAt)
      })
  }

  const porPagina = f.porPagina ?? 12
  const total = itens.length
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))
  const pagina = Math.min(Math.max(1, f.pagina ?? 1), totalPaginas)
  const inicio = (pagina - 1) * porPagina

  return {
    itens: itens.slice(inicio, inicio + porPagina),
    total,
    pagina,
    totalPaginas,
    tamanhos,
    marcas,
    precoMaximo,
  }
}

/**
 * Todos os produtos ativos, com imagens e variações.
 *
 * `cache()` do React memoriza por requisição: uma página que monta o menu,
 * conta categorias e busca relacionados fazia três viagens iguais ao banco —
 * agora faz uma. Com o Postgres em outra região, cada viagem custa caro.
 *
 * Carregar tudo e filtrar em memória é deliberado: no porte desta loja é mais
 * rápido que várias consultas, e mantém demo e banco com o mesmo comportamento.
 */
const carregarAtivos = cache(async (): Promise<Product[]> => {
  if (!dbAtivo) return demoDb().produtos.filter((p) => p.active)

  const linhas = await prisma().product.findMany({
    where: { active: true },
    include: incluirRelacoes,
    orderBy: { createdAt: 'desc' },
  })
  return (linhas as unknown as LinhaProduto[]).map(mapProduto)
})

export async function listarCatalogo(f: FiltrosProduto = {}): Promise<ResultadoCatalogo> {
  const produtos = await carregarAtivos()
  return aplicarFiltros(produtos, f)
}

export async function produtosEmDestaque(limite = 8): Promise<Product[]> {
  const produtos = await carregarAtivos()
  return produtos
    .filter((p) => p.featured)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limite)
}

export async function produtosEmOferta(limite = 8): Promise<Product[]> {
  const produtos = await carregarAtivos()
  return produtos
    .filter((p) => precoFinal(p) < p.price)
    .sort((a, b) => precoFinal(a) / a.price - precoFinal(b) / b.price)
    .slice(0, limite)
}

export const buscarProdutoPorSlug = cache(async (slug: string): Promise<Product | null> => {
  if (!dbAtivo) return demoDb().produtos.find((p) => p.slug === slug) ?? null

  const linha = await prisma().product.findUnique({ where: { slug }, include: incluirRelacoes })
  return linha ? mapProduto(linha as unknown as LinhaProduto) : null
})

export async function buscarRelacionados(produto: Product, limite = 4): Promise<Product[]> {
  const produtos = await carregarAtivos()
  return produtos
    .filter((p) => p.active && p.id !== produto.id && p.category === produto.category)
    .sort((a, b) => (a.gender === produto.gender ? -1 : 1) - (b.gender === produto.gender ? -1 : 1))
    .slice(0, limite)
}

/** Quantos produtos ativos existem em cada categoria da loja. */
export async function contarPorColecao(): Promise<Record<string, number>> {
  const produtos = await carregarAtivos()
  const contagem: Record<string, number> = {}
  for (const p of produtos) {
    if (!p.active || !p.colecao) continue
    contagem[p.colecao] = (contagem[p.colecao] ?? 0) + 1
  }
  return contagem
}

/** Todos os slugs ativos — usado pelo sitemap. */
export async function listarSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const produtos = await carregarAtivos()
  return produtos.filter((p) => p.active).map((p) => ({ slug: p.slug, updatedAt: p.updatedAt }))
}

// ---------------------------------------------------------------------------
// Catálogo — escrita (painel)
// ---------------------------------------------------------------------------

export type ProdutoInput = {
  sku: string
  slug?: string
  name: string
  brand: string
  gender: Gender
  category: Category
  colecao: string | null
  description: string
  price: number
  salePrice: number | null
  active: boolean
  featured: boolean
  weightGrams: number
  widthCm: number
  heightCm: number
  lengthCm: number
  images: string[]
  variants: { size: string; colorHex: string; stock: number }[]
}

export async function listarProdutosAdmin(busca?: string): Promise<Product[]> {
  const produtos = dbAtivo
    ? ((await prisma().product.findMany({
        include: incluirRelacoes,
        orderBy: { createdAt: 'desc' },
      })) as unknown as LinhaProduto[]).map(mapProduto)
    : [...demoDb().produtos]

  if (!busca?.trim()) return produtos
  const termo = normalizar(busca)
  return produtos.filter((p) => normalizar(`${p.name} ${p.brand} ${p.sku}`).includes(termo))
}

export async function obterProduto(id: string): Promise<Product | null> {
  if (!dbAtivo) return demoDb().produtos.find((p) => p.id === id) ?? null
  const linha = await prisma().product.findUnique({ where: { id }, include: incluirRelacoes })
  return linha ? mapProduto(linha as unknown as LinhaProduto) : null
}

function slugUnico(base: string, existentes: string[]): string {
  let slug = base
  let n = 2
  while (existentes.includes(slug)) slug = `${base}-${n++}`
  return slug
}

export async function criarProduto(input: ProdutoInput): Promise<Product> {
  const variacoes = input.variants.map((v) => ({
    size: v.size,
    colorHex: v.colorHex,
    colorName: nomeDaCor(v.colorHex),
    stock: v.stock,
  }))
  const estoque = variacoes.reduce((acc, v) => acc + v.stock, 0)

  if (!dbAtivo) {
    const db = demoDb()
    const slug = slugUnico(input.slug || slugify(input.name), db.produtos.map((p) => p.slug))
    const agora = new Date().toISOString()
    const id = `local-${Date.now()}`
    const produto: Product = {
      ...input,
      id,
      slug,
      colecao: input.colecao,
      stock: estoque,
      createdAt: agora,
      updatedAt: agora,
      images: input.images.map((url, i) => ({ id: `${id}-img-${i}`, url, position: i })),
      variants: variacoes.map((v, i) => ({ ...v, id: `${id}-var-${i}` })),
    }
    db.produtos.unshift(produto)
    return produto
  }

  const existentes = await prisma().product.findMany({ select: { slug: true } })
  const slug = slugUnico(input.slug || slugify(input.name), existentes.map((p) => p.slug))

  const linha = await prisma().product.create({
    data: {
      sku: input.sku,
      slug,
      name: input.name,
      brand: input.brand,
      gender: input.gender,
      category: input.category,
      colecao: input.colecao,
      description: input.description,
      price: input.price,
      salePrice: input.salePrice,
      stock: estoque,
      active: input.active,
      featured: input.featured,
      weightGrams: input.weightGrams,
      widthCm: input.widthCm,
      heightCm: input.heightCm,
      lengthCm: input.lengthCm,
      images: { create: input.images.map((url, position) => ({ url, position })) },
      variants: { create: variacoes },
    },
    include: incluirRelacoes,
  })
  return mapProduto(linha as unknown as LinhaProduto)
}

export async function atualizarProduto(id: string, input: ProdutoInput): Promise<Product> {
  const variacoes = input.variants.map((v) => ({
    size: v.size,
    colorHex: v.colorHex,
    colorName: nomeDaCor(v.colorHex),
    stock: v.stock,
  }))
  const estoque = variacoes.reduce((acc, v) => acc + v.stock, 0)

  if (!dbAtivo) {
    const db = demoDb()
    const i = db.produtos.findIndex((p) => p.id === id)
    if (i < 0) throw new Error('Produto não encontrado')
    const anterior = db.produtos[i]
    db.produtos[i] = {
      ...anterior,
      ...input,
      slug: input.slug || anterior.slug,
      stock: estoque,
      updatedAt: new Date().toISOString(),
      images: input.images.map((url, idx) => ({ id: `${id}-img-${idx}`, url, position: idx })),
      variants: variacoes.map((v, idx) => ({ ...v, id: `${id}-var-${idx}` })),
    }
    return db.produtos[i]
  }

  // Imagens e variações são recriadas: o formulário envia sempre o conjunto
  // completo, então substituir é mais simples e seguro que fazer diff.
  await prisma().$transaction([
    prisma().productImage.deleteMany({ where: { productId: id } }),
    prisma().productVariant.deleteMany({ where: { productId: id } }),
  ])

  const linha = await prisma().product.update({
    where: { id },
    data: {
      sku: input.sku,
      slug: input.slug || undefined,
      name: input.name,
      brand: input.brand,
      gender: input.gender,
      category: input.category,
      colecao: input.colecao,
      description: input.description,
      price: input.price,
      salePrice: input.salePrice,
      stock: estoque,
      active: input.active,
      featured: input.featured,
      weightGrams: input.weightGrams,
      widthCm: input.widthCm,
      heightCm: input.heightCm,
      lengthCm: input.lengthCm,
      images: { create: input.images.map((url, position) => ({ url, position })) },
      variants: { create: variacoes },
    },
    include: incluirRelacoes,
  })
  return mapProduto(linha as unknown as LinhaProduto)
}

export async function excluirProduto(id: string): Promise<void> {
  if (!dbAtivo) {
    const db = demoDb()
    db.produtos = db.produtos.filter((p) => p.id !== id)
    return
  }
  await prisma().product.delete({ where: { id } })
}

/** Ajuste rápido de estoque de uma variação (tela de Estoque). */
export async function ajustarEstoqueVariacao(variantId: string, novoEstoque: number): Promise<void> {
  const estoque = Math.max(0, Math.round(novoEstoque))

  if (!dbAtivo) {
    const db = demoDb()
    for (const p of db.produtos) {
      const v = p.variants.find((x) => x.id === variantId)
      if (v) {
        v.stock = estoque
        p.stock = p.variants.reduce((acc, x) => acc + x.stock, 0)
        p.updatedAt = new Date().toISOString()
        return
      }
    }
    return
  }

  const variacao = await prisma().productVariant.update({
    where: { id: variantId },
    data: { stock: estoque },
  })
  const soma = await prisma().productVariant.aggregate({
    where: { productId: variacao.productId },
    _sum: { stock: true },
  })
  await prisma().product.update({
    where: { id: variacao.productId },
    data: { stock: soma._sum.stock ?? 0 },
  })
}

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

export type PedidoInput = {
  customerName: string
  customerPhone: string
  customerCep: string
  customerAddress: string
  customerCity: string
  paymentMethod: PaymentMethod
  note?: string | null
  shipping: number
  items: {
    productId: string | null
    slug: string | null
    name: string
    brand: string
    size: string
    colorName: string
    qty: number
    unitPrice: number
  }[]
}

function formatarCodigo(sequencia: number): string {
  return `KR${String(sequencia).padStart(6, '0')}`
}

export async function criarPedido(input: PedidoInput): Promise<Order> {
  const subtotal = input.items.reduce((acc, i) => acc + i.unitPrice * i.qty, 0)
  const total = subtotal + input.shipping

  if (!dbAtivo) {
    const db = demoDb()
    db.sequenciaPedido += 1
    const pedido: Order = {
      id: `demo-order-${db.sequenciaPedido}`,
      code: formatarCodigo(db.sequenciaPedido),
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerCep: input.customerCep,
      customerAddress: input.customerAddress,
      customerCity: input.customerCity,
      paymentMethod: input.paymentMethod,
      note: input.note ?? null,
      subtotal,
      shipping: input.shipping,
      total,
      status: 'novo',
      channel: 'whatsapp',
      trackingCode: null,
      createdAt: new Date().toISOString(),
      items: input.items.map((i, idx) => ({ ...i, id: `demo-item-${db.sequenciaPedido}-${idx}` })),
    }
    db.pedidos.unshift(pedido)
    return pedido
  }

  // O código é sequencial a partir da contagem atual. Em caso de corrida entre
  // dois checkouts simultâneos a constraint UNIQUE dispara e tentamos o próximo.
  const base = await prisma().order.count()
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    try {
      const linha = await prisma().order.create({
        data: {
          code: formatarCodigo(base + 1 + tentativa),
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerCep: input.customerCep,
          customerAddress: input.customerAddress,
          customerCity: input.customerCity,
          paymentMethod: input.paymentMethod,
          note: input.note ?? null,
          subtotal,
          shipping: input.shipping,
          total,
          status: 'novo',
          channel: 'whatsapp',
          items: { create: input.items },
        },
        include: { items: true },
      })
      return mapPedido(linha as unknown as LinhaPedido)
    } catch (erro) {
      const codigo = (erro as { code?: string }).code
      if (codigo !== 'P2002') throw erro
    }
  }
  throw new Error('Não foi possível gerar um código de pedido único. Tente novamente.')
}

export async function listarPedidos(status?: OrderStatus): Promise<Order[]> {
  if (!dbAtivo) {
    const pedidos = demoDb().pedidos
    return status ? pedidos.filter((p) => p.status === status) : [...pedidos]
  }
  const linhas = await prisma().order.findMany({
    where: status ? { status } : undefined,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return (linhas as unknown as LinhaPedido[]).map(mapPedido)
}

export async function obterPedido(id: string): Promise<Order | null> {
  if (!dbAtivo) return demoDb().pedidos.find((p) => p.id === id) ?? null
  const linha = await prisma().order.findUnique({ where: { id }, include: { items: true } })
  return linha ? mapPedido(linha as unknown as LinhaPedido) : null
}

export async function obterPedidoPorCodigo(code: string): Promise<Order | null> {
  if (!dbAtivo) return demoDb().pedidos.find((p) => p.code === code) ?? null
  const linha = await prisma().order.findUnique({ where: { code }, include: { items: true } })
  return linha ? mapPedido(linha as unknown as LinhaPedido) : null
}

export async function atualizarPedido(
  id: string,
  dados: { status?: OrderStatus; trackingCode?: string | null },
): Promise<void> {
  if (!dbAtivo) {
    const pedido = demoDb().pedidos.find((p) => p.id === id)
    if (!pedido) return
    if (dados.status) pedido.status = dados.status
    if (dados.trackingCode !== undefined) pedido.trackingCode = dados.trackingCode
    return
  }
  await prisma().order.update({ where: { id }, data: dados })
}

// ---------------------------------------------------------------------------
// Configurações
// ---------------------------------------------------------------------------

export const obterConfiguracoes = cache(async (): Promise<Settings> => {
  if (!dbAtivo) return { ...demoDb().configuracoes }

  // Leitura primeiro: o upsert que estava aqui fazia uma ESCRITA no banco a
  // cada página carregada, só para garantir a linha padrão que quase sempre
  // já existe. Agora só escreve na primeira vez.
  const linha =
    (await prisma().settings.findUnique({ where: { id: 'default' } })) ??
    (await prisma().settings.create({
      data: {
        id: 'default',
        storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'KR Multimarcas',
        whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '5547999999999',
        freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 399),
        originCep: process.env.ORIGIN_CEP || '89000000',
      },
    }))

  return {
    storeName: linha.storeName,
    whatsapp: linha.whatsapp,
    freeShippingThreshold: num(linha.freeShippingThreshold),
    brandColor: linha.brandColor,
    brandColor2: linha.brandColor2,
    originCep: linha.originCep,
    melhorEnvioEnabled: linha.melhorEnvioEnabled,
    mercadoPagoEnabled: linha.mercadoPagoEnabled,
    blingEnabled: linha.blingEnabled,
    metaCatalogEnabled: linha.metaCatalogEnabled,
    metaPixelId: linha.metaPixelId,
  }
})

export type ConfiguracoesInput = Partial<Settings> & {
  melhorEnvioToken?: string
  mercadoPagoToken?: string
  blingToken?: string
  metaCatalogId?: string
  metaAccessToken?: string
}

export async function salvarConfiguracoes(input: ConfiguracoesInput): Promise<void> {
  if (!dbAtivo) {
    const db = demoDb()
    db.configuracoes = { ...db.configuracoes, ...input }
    return
  }

  // Tokens vazios não sobrescrevem o que já está salvo (o formulário nunca
  // devolve o segredo em claro para o navegador).
  const tokens: Record<string, string> = {}
  for (const chave of [
    'melhorEnvioToken',
    'mercadoPagoToken',
    'blingToken',
    'metaAccessToken',
  ] as const) {
    const valor = input[chave]
    if (valor) tokens[chave] = valor
  }

  await prisma().settings.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...input, ...tokens },
    update: {
      storeName: input.storeName,
      whatsapp: input.whatsapp,
      freeShippingThreshold: input.freeShippingThreshold,
      brandColor: input.brandColor,
      brandColor2: input.brandColor2,
      originCep: input.originCep,
      melhorEnvioEnabled: input.melhorEnvioEnabled,
      mercadoPagoEnabled: input.mercadoPagoEnabled,
      blingEnabled: input.blingEnabled,
      metaCatalogEnabled: input.metaCatalogEnabled,
      metaCatalogId: input.metaCatalogId,
      metaPixelId: input.metaPixelId,
      ...tokens,
    },
  })
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type MetricasDashboard = {
  faturamento: number
  ticketMedio: number
  totalPedidos: number
  pedidosNovos: number
  produtosAtivos: number
  itensEstoqueBaixo: { produto: Product; estoque: number }[]
  vendasSemana: { dia: string; rotulo: string; valor: number }[]
  pedidosRecentes: Order[]
  maisVendidos: { nome: string; marca: string; quantidade: number; receita: number }[]
}

/** Pedidos que já representam receita confirmada. */
const STATUS_FATURADO: OrderStatus[] = ['pago', 'enviado', 'entregue']

export async function metricasDashboard(): Promise<MetricasDashboard> {
  const [pedidos, produtos] = await Promise.all([listarPedidos(), listarProdutosAdmin()])

  const faturados = pedidos.filter((p) => STATUS_FATURADO.includes(p.status))
  const faturamento = faturados.reduce((acc, p) => acc + p.total, 0)

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const vendasSemana = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(hoje)
    dia.setDate(hoje.getDate() - (6 - i))
    const chave = dia.toISOString().slice(0, 10)
    const valor = faturados
      .filter((p) => p.createdAt.slice(0, 10) === chave)
      .reduce((acc, p) => acc + p.total, 0)
    return {
      dia: chave,
      rotulo: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(dia).replace('.', ''),
      valor,
    }
  })

  const contagem = new Map<string, { nome: string; marca: string; quantidade: number; receita: number }>()
  for (const pedido of pedidos) {
    for (const item of pedido.items) {
      const chave = `${item.name}|${item.brand}`
      const atual = contagem.get(chave) ?? { nome: item.name, marca: item.brand, quantidade: 0, receita: 0 }
      atual.quantidade += item.qty
      atual.receita += item.qty * item.unitPrice
      contagem.set(chave, atual)
    }
  }

  const itensEstoqueBaixo = produtos
    .filter((p) => p.active)
    .map((p) => ({ produto: p, estoque: estoqueTotal(p) }))
    .filter((x) => x.estoque <= ESTOQUE_BAIXO)
    .sort((a, b) => a.estoque - b.estoque)

  return {
    faturamento,
    ticketMedio: faturados.length ? faturamento / faturados.length : 0,
    totalPedidos: pedidos.length,
    pedidosNovos: pedidos.filter((p) => p.status === 'novo').length,
    produtosAtivos: produtos.filter((p) => p.active).length,
    itensEstoqueBaixo,
    vendasSemana,
    pedidosRecentes: pedidos.slice(0, 6),
    maisVendidos: Array.from(contagem.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5),
  }
}

/** Exportação completa (backup JSON do painel). */
export async function exportarDados() {
  const [produtos, pedidos, configuracoes] = await Promise.all([
    listarProdutosAdmin(),
    listarPedidos(),
    obterConfiguracoes(),
  ])
  return { versao: 1, exportadoEm: new Date().toISOString(), produtos, pedidos, configuracoes }
}
