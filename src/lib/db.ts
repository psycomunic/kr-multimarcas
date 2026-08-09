import { PrismaClient } from '@prisma/client'

/**
 * O projeto roda em dois modos:
 *
 *  - **Banco real**: `DATABASE_URL` configurada apontando para o Postgres do
 *    Supabase. Tudo é persistido.
 *  - **Modo demonstração**: sem `DATABASE_URL`. A loja serve o catálogo de
 *    exemplo em memória, o checkout funciona e o painel edita os dados — mas
 *    tudo se perde ao reiniciar o servidor. Serve para avaliar a interface
 *    antes de provisionar o banco.
 *
 * Um placeholder do `.env.example` não conta como configuração válida.
 */
const url = process.env.DATABASE_URL ?? ''

export const dbAtivo =
  url.startsWith('postgres') && !url.includes('SEUPROJETO') && !url.includes('SENHA@')

const globalForPrisma = globalThis as unknown as { prismaClient?: PrismaClient }

/** Cliente Prisma singleton — só é instanciado quando existe banco de verdade. */
export function prisma(): PrismaClient {
  if (!dbAtivo) {
    throw new Error(
      'DATABASE_URL não configurada: a aplicação está em modo demonstração e não pode acessar o Prisma.',
    )
  }
  if (!globalForPrisma.prismaClient) {
    globalForPrisma.prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    })
  }
  return globalForPrisma.prismaClient
}
