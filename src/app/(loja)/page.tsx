import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react'

import { CardProduto, GradeProdutos } from '@/components/loja/card-produto'
import { BotaoLink } from '@/components/ui/botao'
import { Selo } from '@/components/ui/selo'
import { COLECOES } from '@/lib/colecoes'
import { formatBRL } from '@/lib/format'
import {
  contarPorColecao,
  obterConfiguracoes,
  produtosEmDestaque,
  produtosEmOferta,
} from '@/lib/repo'
import { linkWhatsApp, mensagemAtendimento } from '@/lib/whatsapp'

const PASSOS = [
  { numero: '01', titulo: 'Escolha no site', texto: 'Navegue pelo catálogo e monte sua sacola com tamanho e cor.' },
  { numero: '02', titulo: 'Finalize no WhatsApp', texto: 'O pedido chega prontinho para a gente no seu nome.' },
  { numero: '03', titulo: 'Pague e receba', texto: 'Pix, cartão ou combinado — enviamos para todo o Brasil.' },
]

export default async function PaginaInicial() {
  const [destaques, ofertas, configuracoes, contagem] = await Promise.all([
    produtosEmDestaque(8),
    produtosEmOferta(4),
    obterConfiguracoes(),
    contarPorColecao(),
  ])

  // Vitrine só mostra categoria com produto — card que leva a página vazia
  // é pior do que categoria nenhuma.
  const categorias = COLECOES.filter((c) => (contagem[c.slug] ?? 0) > 0)

  const whatsapp = linkWhatsApp(
    configuracoes.whatsapp,
    mensagemAtendimento(configuracoes.storeName),
  )

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        {/* Banner de campanha com art direction: são duas artes diferentes, não
            um recorte da mesma. `<picture>` (em vez de dois <Image> com
            `hidden`) garante que o navegador baixe SÓ a arte que vai usar — com
            classes utilitárias o arquivo escondido também seria buscado,
            pesando justamente no mobile. As dimensões em cada fonte reservam o
            espaço e evitam salto de layout. */}
        <Link
          href="/loja"
          className="group block overflow-hidden"
          aria-label="Ver a coleção Polo Street"
        >
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet="/BANNER-HOME.jpg"
              width={2000}
              height={712}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/banner-home-mobile.jpg"
              alt="Coleção Polo Street — KR Multimarcas"
              width={900}
              height={1200}
              fetchPriority="high"
              decoding="async"
              className="w-full transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </picture>
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
      {categorias.length > 0 && (
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

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {categorias.map((colecao, i) => (
            <Link
              key={colecao.slug}
              href={`/loja?colecao=${colecao.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink"
            >
              <Image
                src={colecao.imagem}
                alt={colecao.titulo}
                fill
                priority={i < 3}
                sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 text-white lg:p-3">
                <h3 className="font-display text-sm font-semibold leading-tight sm:text-base lg:text-sm">
                  {colecao.titulo}
                </h3>
                <p className="mt-0.5 text-[11px] leading-snug text-white/65">
                  {colecao.descricao}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-gold">
                  Ver
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

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
