'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { COOKIE_ADMIN, senhaConfigurada, tokenSessao } from '@/lib/auth'
import {
  ajustarEstoqueVariacao,
  atualizarPedido,
  atualizarProduto,
  criarProduto,
  excluirProduto,
  salvarConfiguracoes,
  type ConfiguracoesInput,
  type ProdutoInput,
} from '@/lib/repo'
import type { OrderStatus, Product } from '@/lib/types'

export type ResultadoAcao = { ok: boolean; mensagem?: string }

// ---------------------------------------------------------------- sessão

export async function entrar(senha: string, destino: string): Promise<ResultadoAcao> {
  if (senha !== senhaConfigurada()) {
    return { ok: false, mensagem: 'Senha incorreta.' }
  }

  cookies().set(COOKIE_ADMIN, await tokenSessao(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 horas
  })

  redirect(destino.startsWith('/admin') ? destino : '/admin')
}

export async function sair() {
  cookies().delete(COOKIE_ADMIN)
  redirect('/admin/login')
}

// ---------------------------------------------------------------- produtos

function revalidarLoja() {
  revalidatePath('/', 'layout')
}

export async function salvarProdutoAcao(
  entrada: ProdutoInput & { id?: string },
): Promise<ResultadoAcao & { id?: string }> {
  try {
    const { id, ...dados } = entrada
    const produto = id ? await atualizarProduto(id, dados) : await criarProduto(dados)
    revalidarLoja()
    return { ok: true, id: produto.id, mensagem: id ? 'Produto atualizado.' : 'Produto criado.' }
  } catch (erro) {
    const codigo = (erro as { code?: string }).code
    if (codigo === 'P2002') {
      return { ok: false, mensagem: 'Já existe um produto com este SKU.' }
    }
    return { ok: false, mensagem: (erro as Error).message || 'Não foi possível salvar o produto.' }
  }
}

export async function excluirProdutoAcao(id: string): Promise<ResultadoAcao> {
  try {
    await excluirProduto(id)
    revalidarLoja()
    return { ok: true, mensagem: 'Produto excluído.' }
  } catch (erro) {
    return { ok: false, mensagem: (erro as Error).message || 'Não foi possível excluir.' }
  }
}

export async function ajustarEstoqueAcao(
  variantId: string,
  estoque: number,
): Promise<ResultadoAcao> {
  try {
    await ajustarEstoqueVariacao(variantId, estoque)
    revalidarLoja()
    return { ok: true }
  } catch (erro) {
    return { ok: false, mensagem: (erro as Error).message }
  }
}

// ---------------------------------------------------------------- pedidos

export async function atualizarPedidoAcao(
  id: string,
  dados: { status?: OrderStatus; trackingCode?: string | null },
): Promise<ResultadoAcao> {
  try {
    await atualizarPedido(id, dados)
    revalidatePath('/admin/pedidos')
    revalidatePath(`/admin/pedidos/${id}`)
    return { ok: true, mensagem: 'Pedido atualizado.' }
  } catch (erro) {
    return { ok: false, mensagem: (erro as Error).message }
  }
}

// ---------------------------------------------------------------- ajustes

/**
 * Importa um backup JSON. Só produtos e configurações são restaurados —
 * pedidos ficam de fora de propósito: reinserir histórico de venda bagunçaria
 * relatórios e códigos sequenciais.
 */
export async function importarBackupAcao(conteudo: string): Promise<ResultadoAcao> {
  let dados: { produtos?: unknown; configuracoes?: unknown }
  try {
    dados = JSON.parse(conteudo)
  } catch {
    return { ok: false, mensagem: 'Arquivo inválido: não é um JSON válido.' }
  }

  const produtos = Array.isArray(dados.produtos) ? (dados.produtos as Product[]) : []
  if (produtos.length === 0) {
    return { ok: false, mensagem: 'O arquivo não contém a lista de produtos.' }
  }

  let criados = 0
  let falhas = 0

  for (const produto of produtos) {
    try {
      await criarProduto({
        sku: produto.sku,
        slug: produto.slug,
        name: produto.name,
        brand: produto.brand,
        gender: produto.gender,
        category: produto.category,
        colecao: produto.colecao ?? null,
        description: produto.description,
        price: produto.price,
        salePrice: produto.salePrice ?? null,
        active: produto.active,
        featured: produto.featured,
        weightGrams: produto.weightGrams,
        widthCm: produto.widthCm,
        heightCm: produto.heightCm,
        lengthCm: produto.lengthCm,
        images: produto.images.map((i) => i.url),
        variants: produto.variants.map((v) => ({
          size: v.size,
          colorHex: v.colorHex,
          stock: v.stock,
        })),
      })
      criados++
    } catch {
      // SKU duplicado é o caso comum — segue para o próximo.
      falhas++
    }
  }

  if (dados.configuracoes) {
    await salvarConfiguracoes(dados.configuracoes as ConfiguracoesInput)
  }

  revalidarLoja()
  return {
    ok: true,
    mensagem: `${criados} produto(s) importado(s)${falhas > 0 ? ` · ${falhas} ignorado(s) por SKU duplicado` : ''}.`,
  }
}

export async function salvarConfiguracoesAcao(
  entrada: ConfiguracoesInput,
): Promise<ResultadoAcao> {
  try {
    await salvarConfiguracoes(entrada)
    revalidarLoja()
    return { ok: true, mensagem: 'Configurações salvas.' }
  } catch (erro) {
    return { ok: false, mensagem: (erro as Error).message }
  }
}
