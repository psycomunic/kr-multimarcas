import { AvisoDemonstracao } from '@/components/loja/aviso-demonstracao'
import { Footer } from '@/components/loja/footer'
import { GavetaCarrinho } from '@/components/loja/gaveta-carrinho'
import { Header, TopBar } from '@/components/loja/header'
import { WhatsAppFlutuante } from '@/components/loja/whatsapp-flutuante'
import { ConfiguracoesProvider } from '@/components/providers/configuracoes-provider'
import { COLECOES } from '@/lib/colecoes'
import { contarPorColecao, obterConfiguracoes } from '@/lib/repo'

// Catálogo e preços mudam com frequência: páginas estáticas revalidadas a cada
// minuto dão velocidade sem servir preço velho.
export const revalidate = 60

export default async function LayoutLoja({ children }: { children: React.ReactNode }) {
  const [configuracoes, contagem] = await Promise.all([obterConfiguracoes(), contarPorColecao()])

  // Só entram no menu as categorias que têm produto ativo — link para vitrine
  // vazia é frustração garantida.
  const categorias = COLECOES.filter((c) => (contagem[c.slug] ?? 0) > 0)

  return (
    <ConfiguracoesProvider valor={configuracoes}>
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <Header categorias={categorias} />
        <AvisoDemonstracao />
        <main className="flex-1">{children}</main>
        <Footer configuracoes={configuracoes} categorias={categorias} />
      </div>
      <GavetaCarrinho />
      <WhatsAppFlutuante configuracoes={configuracoes} />
    </ConfiguracoesProvider>
  )
}
