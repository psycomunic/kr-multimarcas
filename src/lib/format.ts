/** Formatações pt-BR usadas na loja e no painel. */

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

export function formatBRL(value: number): string {
  return brl.format(Number.isFinite(value) ? value : 0)
}

const decimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** "1.234,50" — sem o símbolo, para a mensagem do WhatsApp. */
export function formatNumeroBRL(value: number): string {
  return decimal.format(Number.isFinite(value) ? value : 0)
}

export function formatData(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d)
}

export function formatDataCurta(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d)
}

/** Mantém só dígitos (telefone, CEP). */
export function somenteDigitos(v: string): string {
  return v.replace(/\D/g, '')
}

export function formatCEP(v: string): string {
  const d = somenteDigitos(v).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function formatTelefone(v: string): string {
  const d = somenteDigitos(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Gera slug amigável a partir do nome do produto. */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
