/**
 * Service worker mínimo — existe para o navegador considerar o painel
 * instalável (critério do Chrome/Edge para oferecer "Adicionar à tela inicial").
 *
 * De propósito NÃO faz cache: o painel precisa mostrar pedido e estoque atuais,
 * e um cache mal ajustado aqui serviria dado velho para quem está atendendo.
 * Se um dia quisermos modo offline, o lugar é aqui — com cuidado.
 */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // Repassa tudo para a rede (comportamento padrão do navegador).
})
