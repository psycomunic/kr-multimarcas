import { FormularioProduto } from '@/components/admin/formulario-produto'
import { CabecalhoPainel } from '@/components/admin/ui-painel'

export default function PaginaNovoProduto() {
  return (
    <>
      <CabecalhoPainel
        titulo="Novo produto"
        descricao="Cadastre a peça, as fotos e as variações de tamanho e cor."
      />
      <FormularioProduto />
    </>
  )
}
