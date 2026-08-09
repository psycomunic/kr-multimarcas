/**
 * URL pública do site, resolvida de forma tolerante.
 *
 * Por que existe: `metadataBase: new URL(...)` no layout roda durante a coleta
 * de páginas do build. Se `NEXT_PUBLIC_SITE_URL` vier vazia, com espaço ou sem
 * protocolo — coisas banais de acontecer ao cadastrar variável em painel ou por
 * CLI — `new URL` lança e o build inteiro falha, com um erro que não diz qual
 * variável está errada. Aqui a URL ruim vira fallback e a loja continua de pé.
 */

const PADRAO = 'http://localhost:3000'

function normalizar(valor: string | undefined): string {
  const bruto = (valor ?? '').trim()
  if (!bruto) return PADRAO

  // Aceita "meudominio.com.br" e completa o protocolo.
  const comProtocolo = /^https?:\/\//i.test(bruto) ? bruto : `https://${bruto}`

  try {
    const url = new URL(comProtocolo)
    // Sem barra no fim: todo o código monta caminhos como `${site}/produto/x`.
    return url.origin
  } catch {
    return PADRAO
  }
}

export const urlDoSite = normalizar(process.env.NEXT_PUBLIC_SITE_URL)

/** Monta uma URL absoluta a partir de um caminho da loja. */
export function urlAbsoluta(caminho: string): string {
  return `${urlDoSite}${caminho.startsWith('/') ? caminho : `/${caminho}`}`
}
