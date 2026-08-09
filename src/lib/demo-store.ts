/**
 * Armazenamento em memória do modo demonstração.
 *
 * Fica no `globalThis` para sobreviver ao hot-reload do Next em
 * desenvolvimento — sem isso, cada recompilação zeraria o catálogo.
 * Os dados NÃO são persistidos: reiniciar o servidor volta ao seed.
 */

import { construirProdutosDemo } from './seed-data'
import type { Order, Product, Settings } from './types'

type DemoDb = {
  produtos: Product[]
  pedidos: Order[]
  configuracoes: Settings
  sequenciaPedido: number
}

const configuracoesPadrao = (): Settings => ({
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'KR Multimarcas',
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '5547999999999',
  freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 399),
  brandColor: '#FFD131',
  brandColor2: '#F5A623',
  originCep: process.env.ORIGIN_CEP || '89000000',
  melhorEnvioEnabled: false,
  mercadoPagoEnabled: false,
  blingEnabled: false,
  metaCatalogEnabled: false,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || null,
})

const globalForDemo = globalThis as unknown as { demoDb?: DemoDb }

export function demoDb(): DemoDb {
  if (!globalForDemo.demoDb) {
    globalForDemo.demoDb = {
      produtos: construirProdutosDemo(),
      pedidos: [],
      configuracoes: configuracoesPadrao(),
      sequenciaPedido: 0,
    }
  }
  return globalForDemo.demoDb
}
