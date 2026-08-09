import { z } from 'zod'

import { somenteDigitos } from './format'
import { FORMAS_PAGAMENTO } from './types'

/** Item enviado pelo navegador. Preço NÃO vem daqui — é recalculado no servidor. */
export const itemCheckoutSchema = z.object({
  slug: z.string().min(1),
  tamanho: z.string().min(1),
  corHex: z.string().min(1),
  quantidade: z.number().int().min(1).max(99),
})

export const checkoutSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'Informe seu nome completo')
    .max(120, 'Nome muito longo'),
  telefone: z
    .string()
    .trim()
    .refine((v) => somenteDigitos(v).length >= 10 && somenteDigitos(v).length <= 11, {
      message: 'Informe um WhatsApp válido com DDD',
    }),
  cep: z
    .string()
    .trim()
    .refine((v) => somenteDigitos(v).length === 8, { message: 'CEP deve ter 8 dígitos' }),
  endereco: z.string().trim().min(5, 'Informe rua, número e complemento'),
  cidade: z.string().trim().min(2, 'Informe cidade e UF'),
  pagamento: z.enum(FORMAS_PAGAMENTO, { errorMap: () => ({ message: 'Escolha a forma de pagamento' }) }),
  observacao: z.string().trim().max(500, 'Observação muito longa').optional().or(z.literal('')),
  opcaoFrete: z.string().optional(),
})

export type DadosCheckout = z.infer<typeof checkoutSchema>

export const pedidoRequestSchema = checkoutSchema.extend({
  itens: z.array(itemCheckoutSchema).min(1, 'A sacola está vazia'),
})

/** Formulário de produto do painel. */
export const produtoSchema = z.object({
  sku: z.string().trim().min(2, 'Informe o SKU'),
  name: z.string().trim().min(2, 'Informe o nome'),
  brand: z.string().trim().min(1, 'Informe a marca'),
  gender: z.enum(['feminino', 'masculino', 'unissex']),
  category: z.enum(['roupas', 'calcados', 'acessorios']),
  description: z.string().trim().min(10, 'Descreva o produto em pelo menos 10 caracteres'),
  price: z.coerce.number().positive('Preço deve ser maior que zero'),
  salePrice: z.coerce.number().nonnegative().nullable().optional(),
  active: z.boolean(),
  featured: z.boolean(),
  weightGrams: z.coerce.number().int().positive('Peso obrigatório para calcular frete'),
  widthCm: z.coerce.number().int().positive(),
  heightCm: z.coerce.number().int().positive(),
  lengthCm: z.coerce.number().int().positive(),
})

export type DadosProduto = z.infer<typeof produtoSchema>
