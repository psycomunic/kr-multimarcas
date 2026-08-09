import { FormularioIntegracoes } from '@/components/admin/formulario-integracoes'
import { CabecalhoPainel } from '@/components/admin/ui-painel'
import { obterConfiguracoes } from '@/lib/repo'

export default async function PaginaIntegracoes() {
  const configuracoes = await obterConfiguracoes()

  return (
    <>
      <CabecalhoPainel
        titulo="Integrações"
        descricao="Conecte frete, pagamento, ERP e catálogo. Enquanto uma integração estiver desligada, a loja usa o comportamento padrão."
      />
      <FormularioIntegracoes configuracoes={configuracoes} />
    </>
  )
}
