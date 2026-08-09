import { BarraLateral } from '@/components/admin/barra-lateral'
import { InstalarApp, RegistrarServiceWorker } from '@/components/admin/instalar-app'
import { AvisoDemonstracao } from '@/components/loja/aviso-demonstracao'
import { listarPedidos } from '@/lib/repo'

export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const pedidos = await listarPedidos('novo')

  return (
    // `lg:flex` e não `flex`: em linha, o cabeçalho do celular (irmão desta
    // coluna) virava um item de flex AO LADO do conteúdo e roubava metade da
    // largura. No celular o layout é blocos empilhados; a partir de lg vira
    // duas colunas com o menu fixo à esquerda.
    <div className="min-h-screen bg-canvas lg:flex">
      <BarraLateral pedidosNovos={pedidos.length} />
      <div className="min-w-0 lg:flex-1">
        <AvisoDemonstracao contexto="admin" />
        {/* `pb-24` no celular reserva o espaço da barra de abas fixa. */}
        <div className="px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</div>
      </div>

      <RegistrarServiceWorker />
      <InstalarApp />
    </div>
  )
}
