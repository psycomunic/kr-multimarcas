'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { Settings } from '@/lib/types'

/**
 * As configurações da loja são carregadas no servidor (banco ou modo
 * demonstração) e distribuídas para os componentes de client — assim o número
 * de WhatsApp e o limite de frete grátis vêm sempre da fonte real, e não de
 * variáveis NEXT_PUBLIC_ duplicadas.
 */
const ConfiguracoesContext = createContext<Settings | null>(null)

export function ConfiguracoesProvider({
  valor,
  children,
}: {
  valor: Settings
  children: ReactNode
}) {
  return <ConfiguracoesContext.Provider value={valor}>{children}</ConfiguracoesContext.Provider>
}

export function useConfiguracoes(): Settings {
  const ctx = useContext(ConfiguracoesContext)
  if (!ctx) throw new Error('useConfiguracoes precisa estar dentro de <ConfiguracoesProvider>')
  return ctx
}
