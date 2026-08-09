'use client'

import { useRouter } from 'next/navigation'
import { Check, Download, Upload } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'

import { importarBackupAcao, salvarConfiguracoesAcao } from '@/app/admin/acoes'
import { Botao } from '@/components/ui/botao'
import { formatCEP, somenteDigitos } from '@/lib/format'
import type { Settings } from '@/lib/types'

export function FormularioConfiguracoes({ configuracoes }: { configuracoes: Settings }) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [salvo, setSalvo] = useState(false)
  const [mensagemImport, setMensagemImport] = useState<string | null>(null)
  const inputArquivo = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    storeName: configuracoes.storeName,
    whatsapp: configuracoes.whatsapp,
    originCep: configuracoes.originCep,
    freeShippingThreshold: String(configuracoes.freeShippingThreshold),
    brandColor: configuracoes.brandColor,
    brandColor2: configuracoes.brandColor2,
  })

  const whatsappValido = somenteDigitos(form.whatsapp).length >= 12

  function salvar() {
    iniciar(async () => {
      await salvarConfiguracoesAcao({
        storeName: form.storeName.trim(),
        whatsapp: somenteDigitos(form.whatsapp),
        originCep: somenteDigitos(form.originCep),
        freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
        brandColor: form.brandColor,
        brandColor2: form.brandColor2,
      })
      setSalvo(true)
      router.refresh()
      setTimeout(() => setSalvo(false), 2500)
    })
  }

  function importar(arquivo: File) {
    setMensagemImport(null)
    const leitor = new FileReader()
    leitor.onload = () => {
      iniciar(async () => {
        const resultado = await importarBackupAcao(String(leitor.result))
        setMensagemImport(resultado.mensagem ?? null)
        router.refresh()
      })
    }
    leitor.readAsText(arquivo)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold">Dados da loja</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-kr" htmlFor="storeName">
                Nome da loja
              </label>
              <input
                id="storeName"
                value={form.storeName}
                onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
                className="input-kr"
              />
            </div>

            <div>
              <label className="label-kr" htmlFor="whatsapp">
                WhatsApp de vendas
              </label>
              <input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) =>
                  setForm((f) => ({ ...f, whatsapp: somenteDigitos(e.target.value).slice(0, 13) }))
                }
                className="input-kr font-mono"
                placeholder="5547999999999"
                inputMode="numeric"
                aria-invalid={!whatsappValido}
              />
              <p className={`mt-1 text-xs ${whatsappValido ? 'text-ink-muted' : 'text-danger'}`}>
                Formato: 55 + DDD + número, só dígitos. É para este número que todo pedido é
                enviado.
              </p>
            </div>

            <div>
              <label className="label-kr" htmlFor="originCep">
                CEP de origem
              </label>
              <input
                id="originCep"
                value={formatCEP(form.originCep)}
                onChange={(e) => setForm((f) => ({ ...f, originCep: e.target.value }))}
                className="input-kr"
                placeholder="89000-000"
                inputMode="numeric"
              />
              <p className="mt-1 text-xs text-ink-muted">
                Endereço de onde as encomendas saem — base do cálculo de frete.
              </p>
            </div>

            <div>
              <label className="label-kr" htmlFor="freeShipping">
                Frete grátis a partir de (R$)
              </label>
              <input
                id="freeShipping"
                type="number"
                min="0"
                step="10"
                value={form.freeShippingThreshold}
                onChange={(e) =>
                  setForm((f) => ({ ...f, freeShippingThreshold: e.target.value }))
                }
                className="input-kr"
              />
              <p className="mt-1 text-xs text-ink-muted">Use 0 para desativar o frete grátis.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold">Cores da marca</h2>
          <p className="mt-1 text-sm text-ink-text">
            Usadas em botões, selos e gradientes. O padrão é o ouro e o âmbar da KR.
          </p>

          <div className="mt-5 flex flex-wrap gap-6">
            {(
              [
                { chave: 'brandColor', rotulo: 'Cor primária' },
                { chave: 'brandColor2', rotulo: 'Cor secundária' },
              ] as const
            ).map(({ chave, rotulo }) => (
              <div key={chave}>
                <label className="label-kr text-xs" htmlFor={chave}>
                  {rotulo}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={chave}
                    type="color"
                    value={form[chave]}
                    onChange={(e) => setForm((f) => ({ ...f, [chave]: e.target.value }))}
                    className="h-11 w-16 cursor-pointer rounded-lg border border-line bg-white p-1"
                  />
                  <span className="font-mono text-sm uppercase text-ink-text">{form[chave]}</span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-5 h-3 rounded-full"
            style={{
              backgroundImage: `linear-gradient(135deg, ${form.brandColor} 0%, ${form.brandColor2} 100%)`,
            }}
            aria-hidden="true"
          />
        </section>
      </div>

      <div className="space-y-6">
        <div className="sticky top-6 space-y-6">
          <Botao onClick={salvar} carregando={pendente} tamanho="lg" className="w-full">
            {salvo ? (
              <>
                <Check className="h-4 w-4" />
                Configurações salvas!
              </>
            ) : (
              'Salvar configurações'
            )}
          </Botao>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Backup</h2>
            <p className="mt-1 text-sm text-ink-text">
              Exporte tudo em JSON antes de mexer no catálogo. A importação recria produtos e
              configurações — pedidos não são restaurados.
            </p>

            <a
              href="/api/admin/exportar"
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-medium transition hover:border-ink/30"
            >
              <Download className="h-4 w-4" />
              Exportar dados (JSON)
            </a>

            <input
              ref={inputArquivo}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const arquivo = e.target.files?.[0]
                if (arquivo) importar(arquivo)
                e.target.value = ''
              }}
            />
            <Botao
              type="button"
              variante="contorno"
              onClick={() => inputArquivo.current?.click()}
              carregando={pendente}
              className="mt-2 w-full"
            >
              <Upload className="h-4 w-4" />
              Importar backup
            </Botao>

            {mensagemImport && (
              <p className="mt-3 rounded-xl bg-canvas p-3 text-xs text-ink-text">{mensagemImport}</p>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Acesso ao painel</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-text">
              A senha do painel vem da variável de ambiente{' '}
              <code className="rounded bg-canvas px-1 py-0.5 font-mono text-xs">ADMIN_PASSWORD</code>
              . Para trocar, altere o valor no <code className="font-mono text-xs">.env</code> (ou
              nas variáveis da Vercel) e faça um novo deploy.
            </p>
            <p className="mt-3 rounded-xl bg-canvas p-3 text-xs text-ink-text">
              Na Fase 2 o acesso passa a ser por Supabase Auth, com e-mail e senha por usuário e
              troca de senha pelo próprio painel.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
