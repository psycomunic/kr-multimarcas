import { BarraLateral } from '@/components/admin/barra-lateral'
import { InstalarApp, RegistrarServiceWorker } from '@/components/admin/instalar-app'
import { AvisoDemonstracao } from '@/components/loja/aviso-demonstracao'
import { listarPedidos } from '@/lib/repo'

export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const pedidos = await listarPedidos('novo')

  return (
    <div className="flex min-h-screen bg-canvas">
      <BarraLateral pedidosNovos={pedidos.length} />
      <div className="min-w-0 flex-1">
        <AvisoDemonstracao contexto="admin" />
        {/* `pb-24` no celular reserva o espaço da barra de abas fixa. */}
        <div className="px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</div>
      </div>

      <RegistrarServiceWorker />
      <InstalarApp />
    </div>
  )
}
