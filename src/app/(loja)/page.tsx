import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react'

import { CardProduto, GradeProdutos } from '@/components/loja/card-produto'
import { ImagemProduto } from '@/components/loja/imagem-produto'
import { BotaoLink } from '@/components/ui/botao'
import { Selo } from '@/components/ui/selo'
import { formatBRL } from '@/lib/format'
import { obterConfiguracoes, produtosEmDestaque, produtosEmOferta } from '@/lib/repo'
import { linkWhatsApp, mensagemAtendimento } from '@/lib/whatsapp'

const CATEGORIAS_DESTAQUE = [
  {
    titulo: 'Roupas',
    descricao: 'Alfaiataria, jeans e básicos premium',
    href: '/loja?categoria=roupas',
    imagem:
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
  },
  {
    titulo: 'Calçados',
    descricao: 'Do tênis do dia a dia ao scarpin',
    href: '/loja?categoria=calcados',
    imagem:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
  },
  {
    titulo: 'Acessórios',
    descricao: 'Bolsas, relógios e óculos que assinam o look',
    href: '/loja?categoria=acessorios',
    imagem:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  },
]

const PASSOS = [
  { numero: '01', titulo: 'Escolha no site', texto: 'Navegue pelo catálogo e monte sua sacola com tamanho e cor.' },
  { numero: '02', titulo: 'Finalize no WhatsApp', texto: 'O pedido chega prontinho para a gente no seu nome.' },
  { numero: '03', titulo: 'Pague e receba', texto: 'Pix, cartão ou combinado — enviamos para todo o Brasil.' },
]

export default async function PaginaInicial() {
  const [destaques, ofertas, configuracoes] = await Promise.all([
    produtosEmDestaque(8),
    produtosEmOferta(4),
    obterConfiguracoes(),
  ])

  const whatsapp = linkWhatsApp(
    configuracoes.whatsapp,
    mensagemAtendimento(configuracoes.storeName),
  )

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        {/* Banner de campanha. No mobile o corte é deslocado para a direita
            (`object-[58%]`) porque a arte tem a logo à esquerda e a peça em
            destaque no centro — cortando pelo meio, o produto sumiria. */}
        <Link href="/loja" className="group block" aria-label="Ver a coleção Polo Street">
          <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[21/9] lg:aspect-[2000/712]">
            <Image
              src="/BANNER-HOME.jpg"
              alt="Coleção Polo Street — KR Multimarcas"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[58%_center] transition-transform duration-700 group-hover:scale-[1.02] lg:object-center"
            />
          </div>
        </Link>

        <div className="container-kr relative grid gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12 lg:py-12">
          <div className="animate-fade-up">
            <Selo tom="ouro" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Nova coleção
            </Selo>

            <h1 className="texto-equilibrado mt-4 font-display text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-5xl">
              Peça boa, atendimento{' '}
              <span className="bg-gold-gradient bg-clip-text text-transparent">de gente</span>.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              Roupas, calçados e acessórios das marcas que a gente escolhe a dedo. Você monta a
              sacola no site e fecha a compra no WhatsApp, falando com uma pessoa de verdade.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <BotaoLink href="/loja" tamanho="lg">
                Ver coleção
                <ArrowRight className="h-4 w-4" />
              </BotaoLink>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/20 px-7 text-base font-medium text-white transition hover:border-gold hover:text-gold"
              >
                <MessageCircle className="h-4 w-4" />
                Comprar pelo WhatsApp
              </a>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-x-6 gap-y-4 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            {[
              { rotulo: 'Frete grátis acima de', valor: formatBRL(configuracoes.freeShippingThreshold) },
              { rotulo: 'Envio para', valor: 'todo o Brasil' },
              { rotulo: 'Troca fácil em', valor: '7 dias' },
            ].map((item) => (
              <div key={item.rotulo} className="lg:whitespace-nowrap">
                <dt className="text-[11px] uppercase leading-tight tracking-[0.14em] text-white/45">
                  {item.rotulo}
                </dt>
                <dd className="mt-0.5 font-display text-sm font-semibold text-gold">
                  {item.valor}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --------------------------------------------------------- CATEGORIAS */}
      <section className="container-kr py-14 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="titulo-secao">Escolha por categoria</h2>
            <p className="mt-1.5 text-sm text-ink-text">Tudo separado do jeito que você procura.</p>
          </div>
          <Link
            href="/loja"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-ink transition hover:text-gold-600 sm:flex"
          >
            Ver tudo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {CATEGORIAS_DESTAQUE.map((categoria) => (
            <Link
              key={categoria.titulo}
              href={categoria.href}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink sm:aspect-[3/4]"
            >
              <ImagemProduto
                src={categoria.imagem}
                alt={categoria.titulo}
                sizes="(min-width: 640px) 33vw, 100vw"
                className="opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="font-display text-xl font-semibold">{categoria.titulo}</h3>
                <p className="mt-1 text-xs text-white/70">{categoria.descricao}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold">
                  Explorar <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- DESTAQUES */}
      {destaques.length > 0 && (
        <section className="container-kr py-4 sm:py-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="titulo-secao">Destaques da semana</h2>
              <p className="mt-1.5 text-sm text-ink-text">
                As peças que estão saindo mais rápido da loja.
              </p>
            </div>
            <Link
              href="/loja"
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-ink transition hover:text-gold-600 sm:flex"
            >
              Ver catálogo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <GradeProdutos produtos={destaques} className="mt-7" />
        </section>
      )}

      {/* ------------------------------------------------------ COMO FUNCIONA */}
      <section className="mt-16 bg-white py-14 sm:py-16">
        <div className="container-kr">
          <h2 className="titulo-secao text-center">Comprar aqui é simples</h2>
          <div className="mt-9 grid gap-6 sm:grid-cols-3">
            {PASSOS.map((passo) => (
              <div key={passo.numero} className="card-kr p-6">
                <span className="font-display text-3xl font-bold text-gold">{passo.numero}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{passo.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-text">{passo.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ OFERTAS */}
      {ofertas.length > 0 && (
        <section className="container-kr py-14 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Selo tom="ouro">Ofertas</Selo>
              <h2 className="titulo-secao mt-2">Preço bom com tamanho disponível</h2>
            </div>
            <Link
              href="/loja?ofertas=1"
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-ink transition hover:text-gold-600 sm:flex"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {ofertas.map((produto) => (
              <CardProduto key={produto.id} produto={produto} />
            ))}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- CTA WHATSAPP */}
      <section className="container-kr pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-ink-gradient px-6 py-12 text-center text-white sm:px-12">
          <div
            className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="texto-equilibrado font-display text-2xl font-bold sm:text-3xl">
              Ficou na dúvida entre dois tamanhos?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Chama no WhatsApp. A gente confere a peça, tira foto real e ajuda você a escolher —
              sem robô, sem espera.
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gold px-7 text-base font-semibold text-ink transition hover:bg-gold-400"
            >
              <MessageCircle className="h-5 w-5" />
              Falar com a loja
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
