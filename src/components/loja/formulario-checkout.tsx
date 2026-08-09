'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { CircleAlert, CreditCard, MessageCircle, QrCode, Truck, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ImagemProduto } from '@/components/loja/imagem-produto'
import { useConfiguracoes } from '@/components/providers/configuracoes-provider'
import { Botao, BotaoLink } from '@/components/ui/botao'
import { cn } from '@/lib/cn'
import { formatBRL, formatCEP, formatTelefone, somenteDigitos } from '@/lib/format'
import type { OpcaoFrete } from '@/lib/frete'
import { useHidratado } from '@/lib/hooks'
import { checkoutSchema, type DadosCheckout } from '@/lib/validacao'
import { subtotalCarrinho, useCarrinho } from '@/store/carrinho'

const PAGAMENTOS = [
  { valor: 'pix', rotulo: 'Pix', descricao: 'Enviamos a chave no WhatsApp', Icone: QrCode },
  { valor: 'cartao', rotulo: 'Cartão', descricao: 'Link de pagamento parcelado', Icone: CreditCard },
  { valor: 'combinar', rotulo: 'A combinar', descricao: 'Acertamos no atendimento', Icone: Wallet },
] as const

export function FormularioCheckout() {
  const router = useRouter()
  const hidratado = useHidratado()
  const configuracoes = useConfiguracoes()

  const itens = useCarrinho((e) => e.itens)
  const limpar = useCarrinho((e) => e.limpar)

  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([])
  const [cotando, setCotando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DadosCheckout>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { pagamento: 'pix', observacao: '' },
  })

  const cep = watch('cep')
  const opcaoFrete = watch('opcaoFrete')

  const subtotal = subtotalCarrinho(itens)
  const freteSelecionado = opcoesFrete.find((o) => o.id === opcaoFrete) ?? opcoesFrete[0]
  const total = subtotal + (freteSelecionado?.preco ?? 0)

  /** Busca endereço no ViaCEP e, na sequência, cota o frete. */
  useEffect(() => {
    const digitos = somenteDigitos(cep ?? '')
    if (digitos.length !== 8 || itens.length === 0) {
      setOpcoesFrete([])
      return
    }

    let cancelado = false

    async function consultar() {
      setBuscandoCep(true)
      try {
        const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`)
        const endereco = await resposta.json()
        if (!cancelado && !endereco.erro) {
          if (endereco.logradouro) {
            setValue('endereco', `${endereco.logradouro}${endereco.bairro ? `, ${endereco.bairro}` : ''}`, {
              shouldValidate: true,
            })
          }
          if (endereco.localidade) {
            setValue('cidade', `${endereco.localidade}/${endereco.uf}`, { shouldValidate: true })
          }
        }
      } catch {
        // CEP indisponível não bloqueia o pedido — o cliente digita o endereço.
      } finally {
        if (!cancelado) setBuscandoCep(false)
      }

      if (cancelado) return
      setCotando(true)
      try {
        const resposta = await fetch('/api/frete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cep: digitos,
            itens: itens.map((i) => ({ slug: i.slug, quantidade: i.quantidade })),
          }),
        })
        const dados = await resposta.json()
        if (!cancelado && Array.isArray(dados.opcoes)) {
          setOpcoesFrete(dados.opcoes)
          if (dados.opcoes[0]) setValue('opcaoFrete', dados.opcoes[0].id)
        }
      } catch {
        if (!cancelado) setOpcoesFrete([])
      } finally {
        if (!cancelado) setCotando(false)
      }
    }

    consultar()
    return () => {
      cancelado = true
    }
    // `itens` entra pela contagem para não refazer a cotação a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep, itens.length, setValue])

  async function enviar(dados: DadosCheckout) {
    setErroEnvio(null)

    // A janela precisa ser aberta AGORA, ainda dentro do gesto do usuário —
    // abri-la depois do await faria o bloqueador de pop-up barrar.
    const janelaWhatsApp = window.open('', '_blank')

    try {
      const resposta = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dados,
          itens: itens.map((i) => ({
            slug: i.slug,
            tamanho: i.tamanho,
            corHex: i.corHex,
            quantidade: i.quantidade,
          })),
        }),
      })

      const resultado = await resposta.json()

      if (!resposta.ok) {
        janelaWhatsApp?.close()
        setErroEnvio(resultado.erro ?? 'Não foi possível registrar seu pedido. Tente de novo.')
        return
      }

      if (janelaWhatsApp) janelaWhatsApp.location.href = resultado.whatsappUrl
      limpar()
      router.push(`/checkout/sucesso/${resultado.code}`)
    } catch {
      janelaWhatsApp?.close()
      setErroEnvio('Falha de conexão. Confira sua internet e tente novamente.')
    }
  }

  if (!hidratado) {
    return <div className="skeleton mt-8 h-96 rounded-2xl" />
  }

  if (itens.length === 0) {
    return (
      <div className="card-kr mt-8 flex flex-col items-center gap-4 px-6 py-20 text-center">
        <p className="font-display text-lg font-semibold">Não há itens para finalizar</p>
        <p className="max-w-sm text-sm text-ink-text">
          Adicione peças à sacola para fechar o pedido pelo WhatsApp.
        </p>
        <BotaoLink href="/loja">Ver coleção</BotaoLink>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      noValidate
    >
      <div className="space-y-6">
        {/* ------------------------------------------------------ IDENTIFICAÇÃO */}
        <section className="card-kr p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Seus dados</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-kr" htmlFor="nome">
                Nome completo
              </label>
              <input
                id="nome"
                {...register('nome')}
                className="input-kr"
                placeholder="Como está no documento"
                autoComplete="name"
                aria-invalid={Boolean(errors.nome)}
              />
              {errors.nome && <p className="erro-campo">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="label-kr" htmlFor="telefone">
                WhatsApp
              </label>
              <input
                id="telefone"
                {...register('telefone')}
                onChange={(e) => setValue('telefone', formatTelefone(e.target.value))}
                className="input-kr"
                placeholder="(47) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(errors.telefone)}
              />
              {errors.telefone && <p className="erro-campo">{errors.telefone.message}</p>}
            </div>

            <div>
              <label className="label-kr" htmlFor="cep">
                CEP
              </label>
              <div className="relative">
                <input
                  id="cep"
                  {...register('cep')}
                  onChange={(e) => setValue('cep', formatCEP(e.target.value), { shouldValidate: true })}
                  className="input-kr"
                  placeholder="00000-000"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  aria-invalid={Boolean(errors.cep)}
                />
                {buscandoCep && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
                    buscando…
                  </span>
                )}
              </div>
              {errors.cep && <p className="erro-campo">{errors.cep.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label-kr" htmlFor="endereco">
                Endereço, número e complemento
              </label>
              <input
                id="endereco"
                {...register('endereco')}
                className="input-kr"
                placeholder="Rua das Flores, 120 — apto 302"
                autoComplete="street-address"
                aria-invalid={Boolean(errors.endereco)}
              />
              {errors.endereco && <p className="erro-campo">{errors.endereco.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label-kr" htmlFor="cidade">
                Cidade / UF
              </label>
              <input
                id="cidade"
                {...register('cidade')}
                className="input-kr"
                placeholder="Blumenau/SC"
                aria-invalid={Boolean(errors.cidade)}
              />
              {errors.cidade && <p className="erro-campo">{errors.cidade.message}</p>}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- FRETE */}
        <section className="card-kr p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Truck className="h-5 w-5 text-ink-muted" />
            Entrega
          </h2>

          {cotando ? (
            <div className="mt-4 space-y-2">
              <div className="skeleton h-16 rounded-xl" />
              <div className="skeleton h-16 rounded-xl" />
            </div>
          ) : opcoesFrete.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">
              Informe o CEP acima para calcularmos o frete.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {opcoesFrete.map((opcao) => (
                <label
                  key={opcao.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition',
                    opcaoFrete === opcao.id
                      ? 'border-gold bg-gold/5'
                      : 'border-line hover:border-ink/25',
                  )}
                >
                  <input
                    type="radio"
                    value={opcao.id}
                    {...register('opcaoFrete')}
                    className="h-4 w-4 accent-gold"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      {opcao.transportadora} {opcao.nome}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      até {opcao.prazoDias} dias úteis
                    </span>
                  </span>
                  <span className="text-sm font-semibold">
                    {opcao.preco === 0 ? (
                      <span className="text-success">Grátis</span>
                    ) : (
                      formatBRL(opcao.preco)
                    )}
                  </span>
                </label>
              ))}
              <p className="pt-1 text-xs text-ink-muted">
                Valores estimados — confirmamos o frete final no atendimento.
              </p>
            </div>
          )}
        </section>

        {/* --------------------------------------------------------- PAGAMENTO */}
        <section className="card-kr p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Pagamento</h2>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {PAGAMENTOS.map(({ valor, rotulo, descricao, Icone }) => (
              <label
                key={valor}
                className={cn(
                  'flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition',
                  watch('pagamento') === valor
                    ? 'border-gold bg-gold/5'
                    : 'border-line hover:border-ink/25',
                )}
              >
                <input type="radio" value={valor} {...register('pagamento')} className="sr-only" />
                <Icone className="h-5 w-5 text-ink-muted" />
                <span className="text-sm font-medium">{rotulo}</span>
                <span className="text-xs text-ink-muted">{descricao}</span>
              </label>
            ))}
          </div>
          {errors.pagamento && <p className="erro-campo">{errors.pagamento.message}</p>}

          <div className="mt-5">
            <label className="label-kr" htmlFor="observacao">
              Observação <span className="font-normal text-ink-muted">(opcional)</span>
            </label>
            <textarea
              id="observacao"
              {...register('observacao')}
              rows={3}
              className="input-kr resize-none"
              placeholder="Ex.: presente para embalar, preferência de horário de entrega…"
            />
          </div>
        </section>
      </div>

      {/* -------------------------------------------------------------- RESUMO */}
      <aside className="card-kr sticky top-28 p-5">
        <h2 className="font-display text-lg font-semibold">Seu pedido</h2>

        <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1 scroll-suave">
          {itens.map((item) => (
            <li key={item.chave} className="flex gap-3">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-line/50">
                <ImagemProduto src={item.imagem} alt={item.nome} sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{item.nome}</p>
                <p className="text-xs text-ink-muted">
                  {item.quantidade}x · Tam {item.tamanho} · {item.corNome}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatBRL(item.precoUnitario * item.quantidade)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-text">Subtotal</dt>
            <dd>{formatBRL(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-text">Frete</dt>
            <dd>
              {freteSelecionado
                ? freteSelecionado.preco === 0
                  ? 'Grátis'
                  : formatBRL(freteSelecionado.preco)
                : '—'}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="font-display">{formatBRL(total)}</dd>
          </div>
        </dl>

        {erroEnvio && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl bg-danger/10 p-3 text-xs text-danger"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {erroEnvio}
          </p>
        )}

        <Botao
          type="submit"
          tamanho="lg"
          carregando={isSubmitting}
          className="mt-5 w-full"
        >
          <MessageCircle className="h-5 w-5" />
          {isSubmitting ? 'Registrando pedido…' : 'Enviar pedido no WhatsApp'}
        </Botao>

        <p className="mt-3 text-center text-xs leading-relaxed text-ink-muted">
          Vamos abrir a conversa com {configuracoes.storeName} já com o resumo do pedido. O
          pagamento é combinado no atendimento.
        </p>
      </aside>
    </form>
  )
}
