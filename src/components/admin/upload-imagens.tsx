'use client'

import { Camera, CircleAlert, ImagePlus, Link2, Loader, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { ImagemProduto } from '@/components/loja/imagem-produto'
import { Botao } from '@/components/ui/botao'
import { cn } from '@/lib/cn'

const LARGURA_MAXIMA = 1600
const QUALIDADE = 0.85

/**
 * Reduz a foto no próprio navegador antes de subir.
 *
 * Foto de celular sai com 3–6 MB e 4000px de largura — muito além do que a
 * vitrine usa. Reduzir aqui deixa o upload rápido no 4G, evita estourar o
 * limite do servidor e não muda em nada o que o cliente vê.
 */
async function prepararImagem(arquivo: File): Promise<File> {
  if (!arquivo.type.startsWith('image/') || arquivo.type === 'image/avif') return arquivo

  const bitmap = await createImageBitmap(arquivo).catch(() => null)
  if (!bitmap) return arquivo

  const escala = Math.min(1, LARGURA_MAXIMA / Math.max(bitmap.width, bitmap.height))
  if (escala === 1 && arquivo.size < 1_000_000) return arquivo

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)

  const ctx = canvas.getContext('2d')
  if (!ctx) return arquivo
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALIDADE),
  )
  if (!blob) return arquivo

  return new File([blob], arquivo.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
}

export function UploadImagens({
  imagens,
  aoMudar,
}: {
  imagens: string[]
  aoMudar: (imagens: string[]) => void
}) {
  const inputArquivo = useRef<HTMLInputElement>(null)
  const inputCamera = useRef<HTMLInputElement>(null)

  const [enviando, setEnviando] = useState(0)
  const [erro, setErro] = useState<string | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const [mostrarUrl, setMostrarUrl] = useState(false)
  const [url, setUrl] = useState('')

  async function enviarArquivos(lista: FileList | File[]) {
    const arquivos = Array.from(lista).filter((a) => a.type.startsWith('image/'))
    if (arquivos.length === 0) return

    setErro(null)
    setEnviando((n) => n + arquivos.length)

    const enviados: string[] = []

    for (const original of arquivos) {
      try {
        const arquivo = await prepararImagem(original)
        const corpo = new FormData()
        corpo.append('arquivo', arquivo)
        corpo.append('nome', arquivo.name)

        const resposta = await fetch('/api/admin/upload', { method: 'POST', body: corpo })
        const dados = await resposta.json()

        if (!resposta.ok) throw new Error(dados.erro ?? 'Falha no envio.')
        enviados.push(dados.url)
      } catch (e) {
        setErro((e as Error).message)
      } finally {
        setEnviando((n) => Math.max(0, n - 1))
      }
    }

    if (enviados.length > 0) aoMudar([...imagens, ...enviados])
  }

  function remover(indice: number) {
    aoMudar(imagens.filter((_, i) => i !== indice))
  }

  /** Reordena por arrastar não; troca de posição com a capa em um toque. */
  function tornarCapa(indice: number) {
    if (indice === 0) return
    const nova = [...imagens]
    const [alvo] = nova.splice(indice, 1)
    aoMudar([alvo, ...nova])
  }

  return (
    <div>
      {imagens.length > 0 && (
        <ul className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {imagens.map((endereco, i) => (
            <li
              key={`${endereco}-${i}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-line/50"
            >
              <ImagemProduto src={endereco} alt={`Imagem ${i + 1}`} sizes="140px" />

              {i === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-bold text-ink">
                  Capa
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => tornarCapa(i)}
                  className="absolute left-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-ink transition active:bg-white"
                >
                  Usar de capa
                </button>
              )}

              <button
                type="button"
                onClick={() => remover(i)}
                className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 p-1.5 text-danger transition active:bg-white"
                aria-label={`Remover imagem ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}

          {enviando > 0 &&
            Array.from({ length: enviando }, (_, i) => (
              <li
                key={`enviando-${i}`}
                className="flex aspect-[3/4] items-center justify-center rounded-xl bg-canvas"
              >
                <Loader className="h-5 w-5 animate-spin text-ink-muted" />
              </li>
            ))}
        </ul>
      )}

      {/* Área de soltar / escolher */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault()
          setArrastando(false)
          enviarArquivos(e.dataTransfer.files)
        }}
        className={cn(
          'rounded-2xl border-2 border-dashed p-5 text-center transition',
          arrastando ? 'border-gold bg-gold/5' : 'border-line bg-canvas',
        )}
      >
        <ImagePlus className="mx-auto h-7 w-7 text-ink-muted" />
        <p className="mt-2 text-sm font-medium">Fotos do produto</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          Arraste aqui, ou escolha do aparelho. JPG, PNG ou WebP até 8 MB.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Botao type="button" onClick={() => inputArquivo.current?.click()}>
            <ImagePlus className="h-4 w-4" />
            Escolher fotos
          </Botao>

          {/* `capture` abre a câmera direto no celular; no desktop o navegador
              ignora e mostra o seletor de arquivos. */}
          <Botao
            type="button"
            variante="contorno"
            onClick={() => inputCamera.current?.click()}
            className="sm:hidden"
          >
            <Camera className="h-4 w-4" />
            Tirar foto
          </Botao>

          <Botao
            type="button"
            variante="fantasma"
            onClick={() => setMostrarUrl((v) => !v)}
            className="text-ink-muted"
          >
            <Link2 className="h-4 w-4" />
            Usar link
          </Botao>
        </div>

        <input
          ref={inputArquivo}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) enviarArquivos(e.target.files)
            e.target.value = ''
          }}
        />
        <input
          ref={inputCamera}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) enviarArquivos(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {mostrarUrl && (
        <div className="mt-3 flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (url.trim()) {
                  aoMudar([...imagens, url.trim()])
                  setUrl('')
                }
              }
            }}
            placeholder="https://…/foto.jpg"
            aria-label="URL da imagem"
            className="input-kr flex-1"
          />
          <Botao
            type="button"
            variante="contorno"
            onClick={() => {
              if (!url.trim()) return
              aoMudar([...imagens, url.trim()])
              setUrl('')
            }}
          >
            Adicionar
          </Botao>
        </div>
      )}

      {erro && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl bg-danger/10 p-3 text-xs text-danger"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {erro}
        </p>
      )}

      {enviando > 0 && (
        <p className="mt-3 text-xs text-ink-muted" aria-live="polite">
          Enviando {enviando} {enviando === 1 ? 'foto' : 'fotos'}…
        </p>
      )}
    </div>
  )
}
