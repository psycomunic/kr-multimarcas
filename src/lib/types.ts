/**
 * Tipos de domínio compartilhados entre a camada de dados (Prisma ou modo
 * demonstração), os Server Components e os componentes de client.
 * Sempre valores serializáveis: Decimal vira `number`, Date vira ISO string.
 */

export const GENEROS = ['feminino', 'masculino', 'unissex'] as const
export const CATEGORIAS = ['roupas', 'calcados', 'acessorios'] as const
export const STATUS_PEDIDO = ['novo', 'pago', 'enviado', 'entregue', 'cancelado'] as const
export const FORMAS_PAGAMENTO = ['pix', 'cartao', 'combinar'] as const

export type Gender = (typeof GENEROS)[number]
export type Category = (typeof CATEGORIAS)[number]
export type OrderStatus = (typeof STATUS_PEDIDO)[number]
export type PaymentMethod = (typeof FORMAS_PAGAMENTO)[number]

export const LABEL_GENERO: Record<Gender, string> = {
  feminino: 'Feminino',
  masculino: 'Masculino',
  unissex: 'Unissex',
}

export const LABEL_CATEGORIA: Record<Category, string> = {
  roupas: 'Roupas',
  calcados: 'Calçados',
  acessorios: 'Acessórios',
}

export const LABEL_STATUS: Record<OrderStatus, string> = {
  novo: 'Novo',
  pago: 'Pago',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

export const LABEL_PAGAMENTO: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  combinar: 'A combinar no WhatsApp',
}

export type ProductVariant = {
  id: string
  size: string
  colorName: string
  colorHex: string
  stock: number
}

export type ProductImage = {
  id: string
  url: string
  position: number
}

export type Product = {
  id: string
  sku: string
  slug: string
  name: string
  brand: string
  gender: Gender
  category: Category
  /** Slug da categoria comercial (ver `lib/colecoes.ts`). */
  colecao: string | null
  description: string
  price: number
  salePrice: number | null
  stock: number
  active: boolean
  featured: boolean
  weightGrams: number
  widthCm: number
  heightCm: number
  lengthCm: number
  createdAt: string
  updatedAt: string
  images: ProductImage[]
  variants: ProductVariant[]
}

export type OrderItem = {
  id: string
  productId: string | null
  /** Usado para montar o link do produto na mensagem do WhatsApp. */
  slug: string | null
  name: string
  brand: string
  size: string
  colorName: string
  qty: number
  unitPrice: number
}

export type Order = {
  id: string
  code: string
  customerName: string
  customerPhone: string
  customerCep: string
  customerAddress: string
  customerCity: string
  paymentMethod: PaymentMethod
  note: string | null
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  channel: string
  trackingCode: string | null
  createdAt: string
  items: OrderItem[]
}

export type Settings = {
  storeName: string
  whatsapp: string
  freeShippingThreshold: number
  brandColor: string
  brandColor2: string
  originCep: string
  melhorEnvioEnabled: boolean
  mercadoPagoEnabled: boolean
  blingEnabled: boolean
  metaCatalogEnabled: boolean
  metaPixelId: string | null
}

/** Preço efetivo de venda (considera promoção). */
export function precoFinal(p: Pick<Product, 'price' | 'salePrice'>): number {
  return p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price
}

/** Percentual de desconto arredondado, ou 0 quando não há promoção. */
export function percentualDesconto(p: Pick<Product, 'price' | 'salePrice'>): number {
  const final = precoFinal(p)
  if (final >= p.price) return 0
  return Math.round(((p.price - final) / p.price) * 100)
}

/** Soma o estoque das variações; cai para o campo `stock` se não houver variação. */
export function estoqueTotal(p: Pick<Product, 'stock' | 'variants'>): number {
  if (p.variants.length === 0) return p.stock
  return p.variants.reduce((acc, v) => acc + v.stock, 0)
}
