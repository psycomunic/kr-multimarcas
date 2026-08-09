import { FormularioConfiguracoes } from '@/components/admin/formulario-configuracoes'
import { CabecalhoPainel } from '@/components/admin/ui-painel'
import { obterConfiguracoes } from '@/lib/repo'

export default async function PaginaConfiguracoes() {
  const configuracoes = await obterConfiguracoes()

  return (
    <>
      <CabecalhoPainel
        titulo="Configurações"
        descricao="Dados da loja, identidade visual e backup."
      />
      <FormularioConfiguracoes configuracoes={configuracoes} />
    </>
  )
}
