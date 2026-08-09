'use client'

import { CircleAlert, Eye, EyeOff } from 'lucide-react'
import { useState, useTransition } from 'react'

import { entrar } from '@/app/admin/acoes'
import { Botao } from '@/components/ui/botao'

export function FormularioLogin({ destino }: { destino: string }) {
  const [senha, setSenha] = useState('')
  const [visivel, setVisivel] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    setErro(null)
    iniciar(async () => {
      // Em caso de sucesso a própria action redireciona e nada volta.
      const resultado = await entrar(senha, destino)
      if (resultado && !resultado.ok) setErro(resultado.mensagem ?? 'Não foi possível entrar.')
    })
  }

  return (
    <form onSubmit={enviar} className="mt-6 space-y-4">
      <div>
        <label className="label-kr" htmlFor="senha">
          Senha
        </label>
        <div className="relative">
          <input
            id="senha"
            type={visivel ? 'text' : 'password'}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input-kr pr-11"
            placeholder="••••••••"
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={Boolean(erro)}
          />
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-muted transition hover:text-ink"
            aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {visivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {erro && (
        <p role="alert" className="flex items-center gap-2 text-xs font-medium text-danger">
          <CircleAlert className="h-4 w-4 shrink-0" />
          {erro}
        </p>
      )}

      <Botao type="submit" tamanho="lg" carregando={pendente} className="w-full">
        Entrar no painel
      </Botao>
    </form>
  )
}
