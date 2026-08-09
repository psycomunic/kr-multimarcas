import Link from 'next/link'

import { BotaoLink } from '@/components/ui/botao'
import { Logo } from '@/components/ui/logo'

export default function NaoEncontrado() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <Link href="/" aria-label="Página inicial">
        <Logo variante="clara" className="h-14" />
      </Link>

      <p className="mt-10 font-display text-6xl font-bold text-gold">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold">Não encontramos esta página</h1>
      <p className="mt-2 max-w-sm text-sm text-white/60">
        O link pode ter mudado ou a peça saiu do catálogo. Que tal ver o que temos agora?
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <BotaoLink href="/loja">Ver coleção</BotaoLink>
        <BotaoLink href="/" variante="contorno" className="border-white/20 bg-transparent text-white hover:border-gold hover:bg-transparent hover:text-gold">
          Voltar ao início
        </BotaoLink>
      </div>
    </div>
  )
}
