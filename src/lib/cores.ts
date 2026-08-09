/**
 * Conversão de HEX para nome de cor amigável em português.
 * Usado na mensagem do WhatsApp e nos seletores de variação — o cliente nunca
 * deve receber um código hexadecimal.
 *
 * A comparação é feita no espaço Lab (via XYZ) porque a distância euclidiana em
 * RGB erra feio em tons escuros/saturados (ex.: vinho vira preto).
 */

type Cor = { nome: string; hex: string }

export const PALETA_NOMEADA: Cor[] = [
  { nome: 'Preto', hex: '#0B0B0D' },
  { nome: 'Grafite', hex: '#3A3A42' },
  { nome: 'Cinza', hex: '#8A8A95' },
  { nome: 'Cinza-claro', hex: '#D5D5DC' },
  { nome: 'Branco', hex: '#FFFFFF' },
  { nome: 'Off-white', hex: '#F3EFE7' },
  { nome: 'Bege', hex: '#D9C6A5' },
  { nome: 'Areia', hex: '#C2A87C' },
  { nome: 'Caramelo', hex: '#A9702F' },
  { nome: 'Marrom', hex: '#5C3A21' },
  { nome: 'Ouro', hex: '#FFD131' },
  { nome: 'Mostarda', hex: '#D4A017' },
  { nome: 'Laranja', hex: '#F2762E' },
  { nome: 'Vermelho', hex: '#D32F2F' },
  { nome: 'Vinho', hex: '#6E1B2C' },
  { nome: 'Rosa', hex: '#F09EBB' },
  { nome: 'Pink', hex: '#E0218A' },
  { nome: 'Roxo', hex: '#6B3FA0' },
  { nome: 'Lilás', hex: '#C2A9E0' },
  { nome: 'Azul-marinho', hex: '#1B2A4A' },
  { nome: 'Azul', hex: '#2E90FA' },
  { nome: 'Azul-claro', hex: '#A8D3F0' },
  { nome: 'Jeans', hex: '#4A6C93' },
  { nome: 'Turquesa', hex: '#1FBFB8' },
  { nome: 'Verde', hex: '#2E7D32' },
  { nome: 'Verde-militar', hex: '#4B5320' },
  { nome: 'Verde-claro', hex: '#A8D5A2' },
  { nome: 'Prata', hex: '#C0C0C8' },
]

function hexParaRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return [0, 0, 0]
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbParaLab([r, g, b]: [number, number, number]): [number, number, number] {
  const linear = (c: number) => {
    const v = c / 255
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
  }
  const [R, G, B] = [linear(r), linear(g), linear(b)]

  // sRGB D65 -> XYZ
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [f(x), f(y), f(z)]

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/** Nome amigável da cor mais próxima do hex informado. */
export function nomeDaCor(hex: string): string {
  const alvo = rgbParaLab(hexParaRgb(hex))
  let melhor = PALETA_NOMEADA[0]
  let menorDist = Number.POSITIVE_INFINITY

  for (const cor of PALETA_NOMEADA) {
    const [l, a, b] = rgbParaLab(hexParaRgb(cor.hex))
    const dist = (alvo[0] - l) ** 2 + (alvo[1] - a) ** 2 + (alvo[2] - b) ** 2
    if (dist < menorDist) {
      menorDist = dist
      melhor = cor
    }
  }
  return melhor.nome
}

/** true quando a cor é clara o bastante para exigir borda visível no swatch. */
export function corEhClara(hex: string): boolean {
  const [r, g, b] = hexParaRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 > 200
}
