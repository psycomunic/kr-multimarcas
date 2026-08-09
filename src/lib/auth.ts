/**
 * Autenticação do painel — Fase 1.
 *
 * Gate simples por senha única (`ADMIN_PASSWORD`) guardada em cookie httpOnly.
 * O cookie nunca contém a senha: guarda o SHA-256 dela com um prefixo fixo, e o
 * middleware recalcula o mesmo hash para comparar. Usa Web Crypto porque o
 * middleware roda no runtime Edge.
 *
 * Na Fase 2 isto é substituído por Supabase Auth (e-mail/senha + papel admin),
 * mantendo `sessaoValida()` como ponto único de verificação.
 */

export const COOKIE_ADMIN = 'kr_admin_sessao'
export const SENHA_PADRAO = 'kr-admin'

export function senhaConfigurada(): string {
  return process.env.ADMIN_PASSWORD || SENHA_PADRAO
}

/** Indica que a loja está usando a senha padrão — mostrado como alerta no painel. */
export function usandoSenhaPadrao(): boolean {
  return !process.env.ADMIN_PASSWORD
}

export async function tokenSessao(senha = senhaConfigurada()): Promise<string> {
  const dados = new TextEncoder().encode(`kr-multimarcas::${senha}`)
  const hash = await crypto.subtle.digest('SHA-256', dados)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function sessaoValida(valorCookie: string | undefined): Promise<boolean> {
  if (!valorCookie) return false
  return valorCookie === (await tokenSessao())
}
