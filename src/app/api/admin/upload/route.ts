import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

import { slugify } from '@/lib/format'

export const dynamic = 'force-dynamic'
// Foto de celular chega grande; o padrão de 4,5 MB do corpo da requisição é
// suficiente porque o navegador já reduz a imagem antes de enviar.
export const maxDuration = 30

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const TAMANHO_MAXIMO = 8 * 1024 * 1024 // 8 MB

/**
 * Upload de foto de produto.
 *
 * Protegida pelo middleware do /admin. O token do Blob nunca sai do servidor —
 * o navegador manda o arquivo para cá e recebe de volta só a URL pública.
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { erro: 'Armazenamento de imagens não configurado (BLOB_READ_WRITE_TOKEN ausente).' },
      { status: 500 },
    )
  }

  let formulario: FormData
  try {
    formulario = await request.formData()
  } catch {
    return NextResponse.json({ erro: 'Envio inválido.' }, { status: 400 })
  }

  const arquivo = formulario.get('arquivo')
  if (!(arquivo instanceof File)) {
    return NextResponse.json({ erro: 'Nenhum arquivo recebido.' }, { status: 400 })
  }

  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return NextResponse.json(
      { erro: 'Formato não aceito. Envie JPG, PNG ou WebP.' },
      { status: 415 },
    )
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json(
      { erro: 'Imagem muito grande. O limite é 8 MB.' },
      { status: 413 },
    )
  }

  // Nome previsível e sem acento/espaço; `addRandomSuffix` evita colisão entre
  // fotos com o mesmo nome vindas de celulares diferentes.
  const base = slugify(
    (formulario.get('nome') as string | null) ?? arquivo.name.replace(/\.[^.]+$/, ''),
  )
  const extensao = arquivo.type.split('/')[1].replace('jpeg', 'jpg')

  try {
    const { url } = await put(`produtos/${base || 'foto'}.${extensao}`, arquivo, {
      access: 'public',
      addRandomSuffix: true,
      contentType: arquivo.type,
    })
    return NextResponse.json({ url })
  } catch (erro) {
    return NextResponse.json(
      { erro: (erro as Error).message || 'Falha ao enviar a imagem.' },
      { status: 500 },
    )
  }
}
