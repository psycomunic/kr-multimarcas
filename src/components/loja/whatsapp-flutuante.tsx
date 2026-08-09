import { MessageCircle } from 'lucide-react'

import type { Settings } from '@/lib/types'
import { linkWhatsApp, mensagemAtendimento } from '@/lib/whatsapp'

/** Botão fixo de atendimento — presente em todas as páginas da loja. */
export function WhatsAppFlutuante({ configuracoes }: { configuracoes: Settings }) {
  const href = linkWhatsApp(configuracoes.whatsapp, mensagemAtendimento(configuracoes.storeName))

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full
                 bg-[#25D366] text-[#052E16] shadow-card transition-transform hover:scale-105
                 focus-visible:ring-offset-canvas"
      aria-label="Falar com a loja no WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
