# KR Multimarcas — e-commerce com fechamento no WhatsApp

Loja de moda multimarcas (roupas, calçados e acessórios, feminino e masculino) onde o cliente
monta a sacola no site e **finaliza a compra pelo WhatsApp**, com um painel de gestão completo
para produtos, pedidos, estoque e integrações.

- **Loja**: home, catálogo com filtros, página de produto, carrinho (gaveta + página) e checkout
  que registra o pedido e abre o WhatsApp com a mensagem pronta.
- **Painel** (`/admin`): dashboard com KPIs, CRUD de produtos com variações, gestão de pedidos,
  controle de estoque, integrações e configurações.

Identidade: preto `#0B0B0D` + ouro `#FFD131`, tipografia Sora (títulos) e Inter (texto).

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS 3 (design system em `tailwind.config.ts`) |
| Banco | PostgreSQL do Supabase, via Prisma |
| Estado do carrinho | Zustand com persistência em `localStorage` |
| Formulários | React Hook Form + Zod |
| Ícones | lucide-react |
| Deploy | Vercel |

---

## Modo demonstração

**O projeto roda sem banco nenhum.** Se `DATABASE_URL` não estiver configurada, a loja serve o
catálogo de exemplo (18 produtos) direto da memória: dá para navegar, adicionar à sacola, fechar
pedido e mexer no painel. Uma faixa amarela avisa que está nesse modo e os dados se perdem ao
reiniciar o servidor.

Assim que `DATABASE_URL` aponta para um Postgres válido, tudo passa a ser persistido — sem
mudar uma linha de código.

---

## Rodando localmente

```bash
npm install
cp .env.example .env      # no Windows: copy .env.example .env
npm run dev               # http://localhost:3000
```

O painel fica em `http://localhost:3000/admin`. A senha padrão é `kr-admin` enquanto
`ADMIN_PASSWORD` não for definida.

### Conectando ao Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → Database → Connection string**, copie as duas URLs:
   - a de **Connection pooling** (porta `6543`) para `DATABASE_URL`;
   - a **direta** (porta `5432`) para `DIRECT_URL` — o Prisma usa essa nas migrations.
3. Crie o schema e popule o catálogo:

```bash
npm run db:push    # cria as tabelas (ou: npm run db:migrate para migrations versionadas)
npm run db:seed    # insere os 18 produtos de exemplo
```

`db:seed` é idempotente: apaga os produtos com os SKUs do seed antes de recriá-los e nunca
toca em pedidos reais.

Ferramentas úteis: `npm run db:studio` abre o Prisma Studio.

---

## Variáveis de ambiente

Todas estão documentadas em [.env.example](.env.example). As sensíveis (sem prefixo
`NEXT_PUBLIC_`) só existem no servidor e nunca chegam ao navegador.

### Fase 1 — necessárias para vender

| Variável | Para que serve |
| --- | --- |
| `NEXT_PUBLIC_STORE_WHATSAPP` | **Número que recebe os pedidos.** Formato `55` + DDD + número, só dígitos (ex.: `5547999999999`). |
| `NEXT_PUBLIC_STORE_NAME` | Nome exibido na loja e nas mensagens. |
| `NEXT_PUBLIC_SITE_URL` | URL pública — usada em SEO, sitemap e Open Graph. |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | Valor mínimo para frete grátis (em reais). |
| `ADMIN_PASSWORD` | Senha do painel `/admin`. |
| `DATABASE_URL` | Postgres do Supabase (pooler, porta 6543). Sem ela → modo demonstração. |
| `DIRECT_URL` | Postgres direto (porta 5432), usado pelas migrations. |

> ⚠️ **Configuração obrigatória antes de publicar:** troque `NEXT_PUBLIC_STORE_WHATSAPP` pelo
> número real da loja e defina um `ADMIN_PASSWORD` forte. O número também pode ser alterado
> depois em **Painel → Configurações**, que tem prioridade sobre a variável de ambiente.

### Fase 2 — auth, imagens, frete e pagamento

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_STORAGE_BUCKET`, `MELHORENVIO_TOKEN`, `MELHORENVIO_SANDBOX`, `ORIGIN_CEP`,
`MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`, `MERCADOPAGO_WEBHOOK_SECRET`.

### Fase 3 — ERP e catálogo Meta

`BLING_CLIENT_ID`, `BLING_CLIENT_SECRET`, `BLING_ACCESS_TOKEN`, `NEXT_PUBLIC_META_PIXEL_ID`,
`META_CATALOG_ID`, `META_ACCESS_TOKEN`.

---

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Em [vercel.com](https://vercel.com) → **New Project** → importe o repositório (o Next.js é
   detectado sozinho).
3. Em **Settings → Environment Variables**, cadastre as variáveis da Fase 1. Não esqueça de
   apontar `NEXT_PUBLIC_SITE_URL` para o domínio final.
4. Faça o deploy. Depois, rode as migrations uma vez apontando para o banco de produção:

```bash
npx prisma db push     # com DATABASE_URL/DIRECT_URL de produção no .env local
npm run db:seed        # opcional, só se quiser o catálogo de exemplo
```

O `postinstall` já roda `prisma generate` no build da Vercel.

---

## Estrutura

```
prisma/
  schema.prisma            Modelo de dados (products, variants, images, orders, settings)
  seed.ts                  Popula o banco com o catálogo de exemplo
src/
  app/
    (loja)/                Grupo de rotas da loja — layout com header, footer e carrinho
      page.tsx             Home
      loja/                Catálogo com filtros, ordenação e paginação
      produto/[slug]/      Página de produto + JSON-LD schema.org/Product
      carrinho/            Sacola completa
      checkout/            Formulário + tela de "pedido enviado"
    admin/
      login/               Gate por senha (Fase 1)
      (painel)/            Layout com sidebar: dashboard, produtos, pedidos, estoque,
                           integrações e configurações
      acoes.ts             Server Actions do painel
    api/
      checkout/            Cria o pedido e devolve o link do WhatsApp
      frete/               Cotação de frete
      admin/exportar/      Backup JSON
    sitemap.ts, robots.ts, manifest.ts
  components/
    loja/                  Header, footer, cards, gaveta do carrinho, checkout…
    admin/                 Sidebar, tabelas, formulários do painel
    ui/                    Logo, botões, selos
  lib/
    repo.ts                Camada única de acesso a dados (Prisma ou memória)
    db.ts                  Cliente Prisma + detecção do modo demonstração
    demo-store.ts          Armazenamento em memória do modo demonstração
    whatsapp.ts            Montagem das mensagens
    frete.ts               Cotação (substituída pelo Melhor Envio na Fase 2)
    cores.ts               HEX → nome de cor em português (comparação em Lab)
    seed-data.ts           Catálogo de exemplo
    validacao.ts           Schemas Zod
    auth.ts                Sessão do painel
  store/carrinho.ts        Zustand + localStorage
  middleware.ts            Protege /admin e /api/admin
```

### Onde mexer primeiro

| Quero… | Arquivo |
| --- | --- |
| Mudar cores, sombras, tipografia | `tailwind.config.ts` e `src/app/globals.css` |
| Mudar o texto da mensagem do WhatsApp | `src/lib/whatsapp.ts` |
| Mudar a regra de frete | `src/lib/frete.ts` |
| Trocar a logo | `src/components/ui/logo.tsx` e `public/favicon.svg` |
| Ajustar o catálogo de exemplo | `src/lib/seed-data.ts` |

---

## Decisões que valem saber

- **Preço nunca vem do navegador.** O `POST /api/checkout` recebe apenas slug, tamanho, cor e
  quantidade; preço, nome, marca e frete são recalculados no servidor a partir do catálogo.
- **Cor por nome, não por hexadecimal.** `src/lib/cores.ts` converte o HEX da variação para um
  nome em português comparando no espaço Lab (distância euclidiana em RGB erra em tons escuros).
  O cliente nunca vê `#6E1B2C` — vê "Vinho".
- **Pop-up do WhatsApp.** A janela é aberta no clique (antes do `await`) e só depois recebe a
  URL final, senão o bloqueador de pop-up barraria. A tela de sucesso reconstrói o mesmo link no
  servidor como plano B.
- **Foto do produto na mensagem.** Um link `wa.me?text=` só transporta texto — a API não permite
  anexar arquivo. A imagem aparece pela *prévia de link*: cada item da mensagem leva a URL do seu
  produto, e o WhatsApp lê as tags Open Graph da página para montar o cartão com a foto. Duas
  consequências práticas: só funciona com `NEXT_PUBLIC_SITE_URL` apontando para um domínio
  público (em `localhost` não há prévia), e o WhatsApp gera prévia apenas para o **primeiro**
  link — a foto exibida é a do primeiro item do pedido. Por isso `order_items` guarda o `slug`:
  o link continua válido mesmo que o produto seja renomeado depois.
- **Estoque por variação.** O campo `stock` do produto é sempre a soma das variações, recalculado
  a cada gravação.
- **Filtros em memória.** O banco faz o filtro grosso (gênero, categoria) e o resto — tamanho,
  faixa de preço, ordenação por preço promocional, paginação — acontece em `aplicarFiltros`.
  É a escolha certa para centenas ou poucos milhares de SKUs; acima disso, migre para SQL.
- **Baixa de estoque não acontece no checkout.** O pedido nasce como `novo` e o estoque só é
  debitado quando a venda é confirmada — na Fase 3 isso passa a ser feito pelo Bling.

---

## Roadmap

- [x] **Fase 1** — design system, loja completa, checkout com WhatsApp, banco + seed, painel com
      CRUD de produtos, pedidos, estoque, integrações e configurações.
- [ ] **Fase 2** — Supabase Auth no painel, upload de imagens para o Storage, cotação real do
      Melhor Envio, Mercado Pago (Pix/cartão) com webhook que muda o pedido para `pago`.
- [ ] **Fase 3** — Bling (sincronização de estoque + NF-e) e catálogo Meta (feed de produtos,
      Instagram Shopping, Pixel com ViewContent/AddToCart/Purchase).

## Scripts

```bash
npm run dev         # desenvolvimento
npm run build       # build de produção
npm run start       # serve o build
npm run lint        # ESLint
npm run db:push     # aplica o schema no banco
npm run db:migrate  # migrations versionadas
npm run db:seed     # popula o catálogo de exemplo
npm run db:studio   # Prisma Studio
```
