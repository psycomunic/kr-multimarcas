'use client'

import { useRouter } from 'next/navigation'
import { Check, CreditCard, Package, Share2, Truck } from 'lucide-react'
import { useState, useTransition } from 'react'

import { salvarConfiguracoesAcao } from '@/app/admin/acoes'
import { Botao } from '@/components/ui/botao'
import { Selo } from '@/components/ui/selo'
import { cn } from '@/lib/cn'
import type { ConfiguracoesInput } from '@/lib/repo'
import type { Settings } from '@/lib/types'

type Campo = { chave: string; rotulo: string; placeholder?: string; segredo?: boolean }

type Integracao = {
  id: keyof Settings
  nome: string
  descricao: string
  fase: string
  Icone: React.ComponentType<{ className?: string }>
  campos: Campo[]
}

const INTEGRACOES: Integracao[] = [
  {
    id: 'melhorEnvioEnabled',
    nome: 'Melhor Envio',
    descricao:
      'Cotação real de frete no checkout (Correios, Jadlog, Loggi) e emissão de etiquetas com rastreio.',
    fase: 'Fase 2',
    Icone: Truck,
    campos: [{ chave: 'melhorEnvioToken', rotulo: 'Token de acesso', segredo: true }],
  },
  {
    id: 'mercadoPagoEnabled',
    nome: 'Mercado Pago',
    descricao:
      'Pix com QR Code e link de cartão parcelado. O webhook marca o pedido como pago automaticamente.',
    fase: 'Fase 2',
    Icone: CreditCard,
    campos: [{ chave: 'mercadoPagoToken', rotulo: 'Access token', segredo: true }],
  },
  {
    id: 'blingEnabled',
    nome: 'Bling (ERP + NF-e)',
    descricao:
      'Sincroniza produtos e estoque nos dois sentidos e emite a nota fiscal do pedido aprovado.',
    fase: 'Fase 3',
    Icone: Package,
    campos: [{ chave: 'blingToken', rotulo: 'Access token', segredo: true }],
  },
  {
    id: 'metaCatalogEnabled',
    nome: 'Catálogo Meta',
    descricao:
      'Feed de produtos para Instagram Shopping e anúncios dinâmicos, com Pixel de conversão no site.',
    fase: 'Fase 3',
    Icone: Share2,
    campos: [
      { chave: 'metaCatalogId', rotulo: 'ID do catálogo', placeholder: '1234567890' },
      { chave: 'metaAccessToken', rotulo: 'Access token', segredo: true },
      { chave: 'metaPixelId', rotulo: 'ID do Pixel', placeholder: '9876543210' },
    ],
  },
]

export function FormularioIntegracoes({ configuracoes }: { configuracoes: Settings }) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [salvo, setSalvo] = useState(false)

  const [estado, setEstado] = useState<Record<string, string | boolean>>(() => ({
    melhorEnvioEnabled: configuracoes.melhorEnvioEnabled,
    mercadoPagoEnabled: configuracoes.mercadoPagoEnabled,
    blingEnabled: configuracoes.blingEnabled,
    metaCatalogEnabled: configuracoes.metaCatalogEnabled,
    metaPixelId: configuracoes.metaPixelId ?? '',
  }))

  function salvar() {
    iniciar(async () => {
      await salvarConfiguracoesAcao(estado as ConfiguracoesInput)
      setSalvo(true)
      router.refresh()
      setTimeout(() => setSalvo(false), 2500)
    })
  }

  return (
    <div className="space-y-4">
      {INTEGRACOES.map((integracao) => {
        const ativa = Boolean(estado[integracao.id])
        return (
          <section
            key={integracao.id}
            className={cn(
              'rounded-2xl border bg-white p-5 transition',
              ativa ? 'border-gold' : 'border-line',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3.5">
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    ativa ? 'bg-gold text-ink' : 'bg-canvas text-ink-muted',
                  )}
                >
                  <integracao.Icone className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-semibold">{integracao.nome}</h2>
                    <Selo tom={ativa ? 'sucesso' : 'neutro'}>{integracao.fase}</Selo>
                  </div>
                  <p className="mt-1 max-w-lg text-sm leading-relaxed text-ink-text">
                    {integracao.descricao}
                  </p>
                </div>
              </div>

              {/* Interruptor */}
              <button
                type="button"
                role="switch"
                aria-checked={ativa}
                aria-label={`${ativa ? 'Desativar' : 'Ativar'} ${integracao.nome}`}
                onClick={() => setEstado((s) => ({ ...s, [integracao.id]: !ativa }))}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition',
                  ativa ? 'bg-gold' : 'bg-line',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all',
                    ativa ? 'left-[22px]' : 'left-0.5',
                  )}
                />
              </button>
            </div>

            {ativa && (
              <div className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                {integracao.campos.map((campo) => (
                  <div key={campo.chave}>
                    <label className="label-kr text-xs" htmlFor={campo.chave}>
                      {campo.rotulo}
                    </label>
                    <input
                      id={campo.chave}
                      type={campo.segredo ? 'password' : 'text'}
                      value={String(estado[campo.chave] ?? '')}
                      onChange={(e) =>
                        setEstado((s) => ({ ...s, [campo.chave]: e.target.value }))
                      }
                      placeholder={campo.placeholder ?? (campo.segredo ? '••••••••••••' : '')}
                      className="input-kr font-mono text-xs"
                      autoComplete="off"
                    />
                    {campo.segredo && (
                      <p className="mt-1 text-[11px] text-ink-muted">
                        Guardado só no servidor. Deixe vazio para manter a chave atual.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}

      <div className="flex items-center gap-3">
        <Botao onClick={salvar} carregando={pendente} tamanho="lg">
          {salvo ? (
            <>
              <Check className="h-4 w-4" />
              Salvo!
            </>
          ) : (
            'Salvar integrações'
          )}
        </Botao>
        <p className="text-xs text-ink-muted">
          As chaves também podem vir de variáveis de ambiente — veja o README.
        </p>
      </div>
    </div>
  )
}
