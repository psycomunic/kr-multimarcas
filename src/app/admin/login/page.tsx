import { FormularioLogin } from '@/components/admin/formulario-login'
import { Logo } from '@/components/ui/logo'
import { usandoSenhaPadrao, SENHA_PADRAO } from '@/lib/auth'

export default function PaginaLogin({
  searchParams,
}: {
  searchParams: { destino?: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo variante="clara" className="h-14" />
        </div>

        <div className="mt-9 rounded-2xl bg-white p-6 shadow-card">
          <h1 className="font-display text-xl font-semibold">Painel da loja</h1>
          <p className="mt-1 text-sm text-ink-text">
            Entre para gerenciar produtos, pedidos e estoque.
          </p>

          <FormularioLogin destino={searchParams.destino ?? '/admin'} />

          {usandoSenhaPadrao() && (
            <p className="mt-5 rounded-xl bg-warning/10 p-3 text-xs leading-relaxed text-ink-text">
              <strong className="font-semibold">Senha padrão em uso:</strong>{' '}
              <code className="font-mono">{SENHA_PADRAO}</code>. Defina{' '}
              <code className="font-mono">ADMIN_PASSWORD</code> no <code>.env</code> antes de
              publicar a loja.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          Acesso restrito à equipe KR Multimarcas.
        </p>
      </div>
    </div>
  )
}
