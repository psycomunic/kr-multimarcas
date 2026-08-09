import { NextResponse } from 'next/server'

import { exportarDados } from '@/lib/repo'

export const dynamic = 'force-dynamic'

/** Backup completo em JSON. Protegido pelo middleware do /admin. */
export async function GET() {
  const dados = await exportarDados()
  const data = new Date().toISOString().slice(0, 10)

  return new NextResponse(JSON.stringify(dados, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="kr-multimarcas-backup-${data}.json"`,
    },
  })
}
