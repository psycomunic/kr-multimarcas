import { AvisoDemonstracao } from '@/components/loja/aviso-demonstracao'
import { Footer } from '@/components/loja/footer'
import { GavetaCarrinho } from '@/components/loja/gaveta-carrinho'
import { Header, TopBar } from '@/components/loja/header'
import { WhatsAppFlutuante } from '@/components/loja/whatsapp-flutuante'
import { ConfiguracoesProvider } from '@/components/providers/configuracoes-provider'
import { obterConfiguracoes } from '@/lib/repo'

// Catálogo e preços mudam com frequência: páginas estáticas revalidadas a cada
// minuto dão velocidade sem servir preço velho.
export const revalidate = 60

export default async function LayoutLoja({ children }: { children: React.ReactNode }) {
  const configuracoes = await obterConfiguracoes()

  return (
    <ConfiguracoesProvider valor={configuracoes}>
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <Header />
        <AvisoDemonstracao />
        <main className="flex-1">{children}</main>
        <Footer configuracoes={configuracoes} />
      </div>
      <GavetaCarrinho />
      <WhatsAppFlutuante configuracoes={configuracoes} />
    </ConfiguracoesProvider>
  )
}
