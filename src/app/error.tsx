'use client'

import { useEffect } from 'react'
import { CircleAlert } from 'lucide-react'

import { Botao, BotaoLink } from '@/components/ui/botao'

export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Em produção o log fica nos logs da Vercel; o `digest` correlaciona a
    // mensagem exibida ao erro real do servidor.
    console.error('Erro na aplicação KR Multimarcas:', error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
          <CircleAlert className="h-8 w-8 text-danger" />
        </span>

        <h1 className="mt-6 font-display text-2xl font-bold">Algo deu errado por aqui</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-text">
          Tivemos um problema ao carregar esta página. Tente de novo — se continuar, fale com a
          gente no WhatsApp que resolvemos seu pedido por lá.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-ink-muted">Código: {error.digest}</p>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Botao onClick={reset}>Tentar novamente</Botao>
          <BotaoLink href="/" variante="contorno">
            Voltar ao início
          </BotaoLink>
        </div>
      </div>
    </div>
  )
}
