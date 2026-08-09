'use client'

import { Check, Download, Share, SquarePlus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Botao } from '@/components/ui/botao'
import { LogoMarca } from '@/components/ui/logo'

/** Evento do Chrome/Edge que permite disparar a instalação por código. */
type EventoInstalacao = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const CHAVE_VISTO = 'kr-admin-convite-instalar'

function ehIOS() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function jaInstalado() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari no iOS não implementa display-mode: standalone
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/**
 * Convite para instalar o painel como aplicativo.
 *
 * Aparece uma vez por dispositivo (guardado em localStorage) e nunca para quem
 * já está usando o app instalado. No Android/desktop usa o `beforeinstallprompt`
 * do navegador; no iOS, que não expõe esse evento, mostra o passo a passo do
 * Safari — sem isso o iPhone ficaria de fora.
 */
export function InstalarApp() {
  const [evento, setEvento] = useState<EventoInstalacao | null>(null)
  const [aberto, setAberto] = useState(false)
  const [ios, setIos] = useState(false)
  const [instalando, setInstalando] = useState(false)

  useEffect(() => {
    if (jaInstalado()) return

    const iosDetectado = ehIOS()
    setIos(iosDetectado)

    const jaViu = localStorage.getItem(CHAVE_VISTO) === '1'

    function aoPoderInstalar(e: Event) {
      e.preventDefault()
      setEvento(e as EventoInstalacao)
      if (!jaViu) setAberto(true)
    }

    window.addEventListener('beforeinstallprompt', aoPoderInstalar)

    // No iOS o evento nunca dispara: mostramos as instruções manuais.
    if (iosDetectado && !jaViu) setAberto(true)

    return () => window.removeEventListener('beforeinstallprompt', aoPoderInstalar)
  }, [])

  const fechar = useCallback(() => {
    localStorage.setItem(CHAVE_VISTO, '1')
    setAberto(false)
  }, [])

  async function instalar() {
    if (!evento) return
    setInstalando(true)
    await evento.prompt()
    await evento.userChoice
    setInstalando(false)
    fechar()
  }

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-instalar"
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" onClick={fechar} aria-hidden="true" />

      <div className="relative w-full max-w-sm animate-fade-up rounded-3xl bg-white p-6 shadow-card">
        <button
          type="button"
          onClick={fechar}
          className="absolute right-3 top-3 rounded-lg p-2 text-ink-muted transition hover:bg-canvas hover:text-ink"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <LogoMarca className="h-12 w-12 rounded-xl" />
          <div>
            <h2 id="titulo-instalar" className="font-display text-lg font-semibold leading-tight">
              Instale o painel no celular
            </h2>
            <p className="text-xs text-ink-muted">KR Painel · gestão da loja</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-text">
          Fica um ícone na tela inicial, abre em tela cheia e sem barra de navegador — bem mais
          prático para cadastrar produto e despachar pedido de qualquer lugar.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-ink-text">
          {['Cadastrar produtos com o celular', 'Ver e atualizar pedidos na hora', 'Ajustar estoque na loja física'].map(
            (item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {item}
              </li>
            ),
          )}
        </ul>

        {ios ? (
          <ol className="mt-5 space-y-2.5 rounded-2xl bg-canvas p-4 text-sm text-ink-text">
            <li className="flex items-start gap-2.5">
              <Share className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
              <span>
                Toque em <strong>Compartilhar</strong>, na barra do Safari
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <SquarePlus className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
              <span>
                Escolha <strong>Adicionar à Tela de Início</strong>
              </span>
            </li>
          </ol>
        ) : null}

        <div className="mt-6 flex gap-2">
          <Botao variante="contorno" onClick={fechar} className="flex-1">
            Agora não
          </Botao>
          {evento && !ios && (
            <Botao onClick={instalar} carregando={instalando} className="flex-1">
              <Download className="h-4 w-4" />
              Instalar
            </Botao>
          )}
          {ios && (
            <Botao onClick={fechar} className="flex-1">
              Entendi
            </Botao>
          )}
        </div>
      </div>
    </div>
  )
}

/** Registra o service worker — requisito do navegador para permitir instalar. */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Falhar aqui só significa que o app não fica instalável; o painel segue normal.
    })
  }, [])

  return null
}
