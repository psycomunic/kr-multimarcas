'use client'

import { useEffect, useState } from 'react'

/**
 * `true` somente depois da hidratação no navegador.
 * Necessário para não renderizar no servidor nada que dependa do carrinho
 * persistido em localStorage (evita mismatch de hidratação).
 */
export function useHidratado(): boolean {
  const [hidratado, setHidratado] = useState(false)
  useEffect(() => setHidratado(true), [])
  return hidratado
}
