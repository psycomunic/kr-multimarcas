import { NextResponse, type NextRequest } from 'next/server'

import { COOKIE_ADMIN, sessaoValida } from '@/lib/auth'

/** Bloqueia todo o /admin (exceto o login) para quem não tem sessão válida. */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  const autorizado = await sessaoValida(request.cookies.get(COOKIE_ADMIN)?.value)
  if (autorizado) return NextResponse.next()

  // Rotas de API respondem 401 — redirecionar um fetch para o HTML do login só
  // produziria um erro de parse confuso no cliente.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  const url = request.nextUrl.clone()
  url.pathname = '/admin/login'
  url.search = `?destino=${encodeURIComponent(pathname + search)}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
