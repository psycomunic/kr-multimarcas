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
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>

      <RegistrarServiceWorker />
      <InstalarApp />
    </div>
  )
}
