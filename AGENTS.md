# HoursControl SaaS — Guia Técnico para Agentes IA

> **Versão:** 2.0 — Baseado na análise do código-fonte em julho/2026.

---

## 1. Visão Geral

**HoursControl** é um SaaS corporativo multi-tenant para gestão de demandas, apontamento de horas e controle de analistas alocados em clientes. O sistema é voltado para consultorias e empresas de TI que precisam rastrear o tempo consumido em contratos, gerar relatórios e acompanhar indicadores.

**Repositório:** `persch-tech`
**Linguagem:** TypeScript (strict mode)
**Framework:** Next.js 16 (App Router) com React 19
**Banco de Dados:** PostgreSQL 16 via Prisma ORM 7 (driver adapter `@prisma/adapter-pg`)
**Idioma da UI:** Português Brasileiro (`pt-BR`)

---

## 2. Stack Tecnológica Atual

### Front-end

| Tecnologia      | Versão  | Uso                                                     |
| --------------- | ------- | ------------------------------------------------------- |
| Next.js         | 16.2.10 | Framework Full-Stack (App Router)                       |
| React           | 19.2.4  | UI Library                                              |
| TailwindCSS     | 4.3.2   | Estilização (via `@tailwindcss/postcss`)                |
| shadcn/ui       | 4.13.0  | Componentes UI (estilo `base-nova`, cor base `neutral`) |
| Lucide React    | 1.23.0  | Ícones                                                  |
| TanStack Table  | 8.21.3  | Tabelas de dados com ordenação/paginação                |
| React Hook Form | 7.80.0  | Formulários                                             |
| Zod             | 4.4.3   | Validação de schemas                                    |
| SWR             | 2.4.2   | Data fetching e cache no client                         |
| Recharts        | 3.8.0   | Gráficos no Dashboard                                   |
| Framer Motion   | 12.42.2 | Animações                                               |
| next-themes     | 0.4.6   | Dark/Light mode                                         |
| Sonner          | 2.0.7   | Toasts/Notificações                                     |
| date-fns        | 4.4.0   | Manipulação de datas                                    |

### Back-end

| Tecnologia         | Versão        | Uso                                           |
| ------------------ | ------------- | --------------------------------------------- |
| Prisma ORM         | 7.8.0         | ORM com driver adapter (`@prisma/adapter-pg`) |
| PostgreSQL         | 16            | Banco relacional (via Docker)                 |
| Auth.js / NextAuth | 5.0.0-beta.31 | Autenticação (Credentials + JWT)              |
| @node-rs/argon2    | 2.0.2         | Hashing de senhas                             |
| Pino               | 10.3.1        | Logs estruturados (pino-pretty em dev)        |
| IORedis            | 5.11.1        | Cliente Redis                                 |
| BullMQ             | 5.79.2        | Filas de processamento assíncrono             |
| @aws-sdk/client-s3 | 3.1078.0      | Upload de arquivos (MinIO)                    |
| jsPDF              | 4.2.1         | Geração de PDF                                |
| xlsx               | 0.18.5        | Exportação XLSX                               |
| html-to-image      | 1.11.13       | Captura de tela para exportação PNG           |

### Infraestrutura (Docker Compose)

| Serviço    | Imagem               | Porta     |
| ---------- | -------------------- | --------- |
| `postgres` | `postgres:16-alpine` | 5432      |
| `redis`    | `redis:7-alpine`     | 6379      |
| `minio`    | `minio/minio:latest` | 9000/9001 |
| `mailpit`  | `axllent/mailpit`    | 1025/8025 |
| `nginx`    | `nginx:alpine`       | 80        |
| `app`      | Dockerfile local     | 3000      |

---

## 3. Estrutura de Diretórios

```
persch-tech/
├── app/                          # Next.js App Router
│   ├── globals.css               # Design tokens (oklch), Tailwind config
│   ├── layout.tsx                # Root layout (ThemeProvider, fonts, Toaster)
│   ├── page.tsx                  # Rota raiz (redireciona)
│   ├── (auth)/                   # Grupo de rotas públicas (login, register, forgot-password)
│   │   ├── layout.tsx            # Layout centralizado com gradiente
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/              # Grupo de rotas protegidas (requer sessão)
│   │   ├── layout.tsx            # Verifica auth, envolve com AppLayout + SessionProvider
│   │   ├── session-provider.tsx  # Client component wrapper do SessionProvider
│   │   ├── dashboard/page.tsx    # Dashboard com Recharts
│   │   ├── demands/              # Módulo Demandas (padrão de referência)
│   │   │   ├── page.tsx          # Página principal (DataTable + formulário)
│   │   │   ├── _columns.tsx      # Definição das colunas TanStack Table
│   │   │   ├── hooks/            # Hooks específicos do módulo
│   │   │   ├── schema/           # Schemas Zod de validação
│   │   │   └── ui/               # Componentes UI específicos (form, dialogs)
│   │   ├── clients/
│   │   ├── contracts/
│   │   ├── analysts/
│   │   ├── requesters/
│   │   ├── departments/
│   │   ├── demand-types/
│   │   ├── tags/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── reports/
│   │   ├── notifications/
│   │   └── settings/
│   └── api/                      # Route Handlers (REST API)
│       ├── auth/                 # Auth.js endpoints
│       ├── demands/
│       │   ├── route.ts          # GET (list+filter) / POST (create)
│       │   ├── [id]/             # GET/PUT/DELETE por ID
│       │   └── stats/            # Estatísticas do dashboard
│       ├── clients/
│       ├── contracts/
│       ├── analysts/
│       ├── requesters/
│       ├── departments/
│       ├── demand-types/
│       ├── tags/
│       ├── users/
│       ├── roles/
│       ├── permissions/
│       ├── notifications/
│       ├── exports/
│       └── upload/
├── components/                   # Componentes compartilhados
│   ├── app-layout.tsx            # Shell principal (sidebar + header + content)
│   ├── sidebar.tsx               # Navegação lateral (colapsável/mobile)
│   ├── header.tsx                # Cabeçalho (tema, avatar, logout)
│   ├── data-table.tsx            # Componente genérico de tabela (TanStack Table)
│   └── ui/                      # ~62 componentes shadcn/ui
├── services/                     # Camada de Serviço (regras de negócio)
│   ├── base.ts                   # BaseService<T, TCreate, TUpdate> genérico
│   ├── demand.ts                 # DemandService (stats do dashboard, filtros)
│   ├── client.ts                 # ClientService (favoritos, busca)
│   ├── audit.ts                  # AuditService (log de alterações)
│   ├── notification.ts           # NotificationService
│   ├── user.ts
│   ├── role.ts
│   ├── analyst.ts
│   ├── contract.ts
│   └── ... (14 services no total)
├── repositories/                 # Camada de Acesso a Dados (Prisma)
│   ├── base.ts                   # BaseRepository<T, TCreate, TUpdate> abstrato
│   ├── demand.ts                 # DemandRepository (inclui eager loading)
│   ├── client.ts                 # ClientRepository (favoritos, busca por nome)
│   └── ... (13 repositories no total)
├── lib/                          # Utilitários e configurações core
│   ├── auth.ts                   # Configuração NextAuth (Credentials, JWT, RBAC)
│   ├── prisma.ts                 # Singleton do PrismaClient (com driver adapter pg)
│   ├── logger.ts                 # Pino logger (redação de dados sensíveis)
│   ├── fetcher.ts                # Fetch wrapper + FetchError (usado por SWR)
│   ├── utils.ts                  # cn(), formatCurrency(), formatDate(), formatDuration()
│   └── generated/prisma/         # Prisma Client gerado (output customizado)
├── hooks/                        # React Hooks compartilhados
│   ├── use-api.ts                # SWR hooks para cada entidade + useCreate/useUpdate/useRemove
│   └── use-mobile.ts             # Detecção de viewport mobile
├── types/
│   └── next-auth.d.ts            # Extensão de tipos do NextAuth (organizationId, permissions)
├── prisma/
│   ├── schema.prisma             # Schema completo (~487 linhas, 22 models)
│   ├── seed.ts                   # Seed com org padrão, roles, permissions, dados de exemplo
│   └── migrations/               # 2 migrations aplicadas
├── generated/prisma/             # Alias para Prisma Client gerado
├── proxy.ts                      # Middleware de auth, logging e injeção de headers
├── docker-compose.yml
├── Dockerfile                    # Multi-stage build (Node 20 Alpine)
├── nginx.conf                    # Reverse proxy com headers de segurança
├── prisma.config.ts              # Configuração do Prisma (datasource via env)
├── eslint.config.mjs             # ESLint strict + stylistic com typescript-eslint
├── tsconfig.json                 # Strict mode, target ES2017, path alias @/*
└── package.json
```

---

## 4. Arquitetura e Padrões

### 4.1 Camadas (Clean Architecture Simplificada)

```
API Route Handlers  ←→  Services  ←→  Repositories  ←→  Prisma/PostgreSQL
       ↑                    ↑
  Zod Schemas          Logger/Audit
```

- **Route Handlers** (`app/api/`): Recebem requisições HTTP, verificam autenticação via `auth()`, extraem `X-Organization-Id` dos headers, delegam para Services.
- **Services** (`services/`): Contêm regras de negócio. Herdam de `BaseService` que fornece CRUD genérico. Retornam `{ data?: T; error?: string }`.
- **Repositories** (`repositories/`): Acesso direto ao Prisma. Herdam de `BaseRepository` abstrato. Implementam `softDelete` como padrão, todas as queries filtram `deletedAt: null`.
- **Auditoria** (`services/audit.ts`): Serviço dedicado para registrar alterações (entity, field, oldValue, newValue, userId, IP).

### 4.2 Multi-tenant

- Cada entidade principal possui `organizationId` como FK para `Organization`.
- O `organizationId` do usuário logado é injetado na sessão JWT (`lib/auth.ts`) e propagado via header `X-Organization-Id` pelo proxy middleware (`proxy.ts`).
- Todas as queries no `BaseRepository` filtram por `organizationId`.
- A entidade `Demand` é indiretamente multi-tenant via `client.organizationId` (tenant acessado pela relação com o Client).

### 4.3 Autenticação e Autorização

- **Auth.js v5** (NextAuth) com provider `Credentials`.
- Senhas hasheadas com **Argon2** (`@node-rs/argon2`).
- Sessão via **JWT** (30 dias de expiração).
- **RBAC**: Roles → RolePermissions → Permissions (`resource:action` format, ex: `demand:create`).
- Permissions carregadas no JWT token no login e disponíveis em `session.user.permissions[]`.
- Seed cria roles `admin` (todas permissões) e `user` (demand CRUD parcial).
- Rotas protegidas pelo `DashboardLayout` (server component que chama `auth()` e redireciona para `/login`).

### 4.4 Data Fetching (Client-side)

- **SWR** (não TanStack Query, apesar de listado no package.json como dependência) para fetching e cache.
- `hooks/use-api.ts` exporta hooks nomeados: `useClients()`, `useDemands(filters)`, `useDemandStats()`, etc.
- Mutations via `useCreate(key)`, `useUpdate(key)`, `useRemove(key)` (wrappers de `useSWRMutation`).
- `lib/fetcher.ts` fornece `fetcher<T>` (GET) e `apiMutate<T>` (POST/PUT/DELETE) com tratamento de erros via `FetchError`.

### 4.5 UI/UX

- **Layout**: Sidebar colapsável (desktop) / Sheet (mobile) + Header fixo com tema toggle e menu de usuário.
- **DataTable**: Componente genérico em `components/data-table.tsx` usando TanStack Table com: busca global, ordenação, paginação, visibilidade de colunas, skeleton loading, empty state.
- **Formulários**: React Hook Form + Zod schemas (schemas colocados em `schema/` dentro de cada módulo de página).
- **Módulo de página padrão** (ex: `demands/`):
  - `page.tsx` — Página principal com listagem e diálogo de formulário
  - `_columns.tsx` — Definição de colunas do TanStack Table
  - `hooks/` — Hooks locais do módulo
  - `schema/` — Zod schemas de validação
  - `ui/` — Componentes UI locais (formulários, dialogs de delete)
- **Tema**: oklch color space com dark mode via `next-themes`, paleta base `neutral` com primária verde (`oklch(0.527 0.154 150.069)`).
- **Fontes**: Outfit (sans), Geist Sans, Geist Mono (via `next/font/google`).

---

## 5. Banco de Dados (Prisma Schema)

### 5.1 Models (22 tabelas)

| Model                 | Descrição                                               |
| --------------------- | ------------------------------------------------------- |
| `Organization`        | Multi-tenant root. Campos: slug, plan, configs          |
| `User`                | Usuários com passwordHash (Argon2)                      |
| `Account`             | OAuth accounts (Auth.js)                                |
| `Session`             | Sessões de banco (Auth.js)                              |
| `VerificationToken`   | Tokens de verificação (Auth.js)                         |
| `Role`                | Perfis (admin, user) scoped por org                     |
| `Permission`          | Permissões (`resource:action`)                          |
| `RolePermission`      | Pivot role↔permission                                   |
| `UserRole`            | Pivot user↔role                                         |
| `Analyst`             | Analistas com hourlyRate, color, level                  |
| `Client`              | Clientes com favorite, color                            |
| `ClientContract`      | Contratos (horas, valor hora, período, status)          |
| `Requester`           | Solicitantes de demandas                                |
| `Department`          | Setores                                                 |
| `DemandType`          | Tipos de demanda (color)                                |
| `Demand`              | **Entidade central**. `durationMinutes: Int`            |
| `Attachment`          | Anexos (MinIO). filename, mimeType, url, size           |
| `Comment`             | Comentários com replies (self-referencing)              |
| `Tag` / `DemandTag`   | Tags com pivot many-to-many                             |
| `Notification`        | Notificações in-app (type, title, body, readAt)         |
| `NotificationSetting` | Configuração por canal por usuário                      |
| `AuditLog`            | Logs de auditoria (entity, field, old/new, IP)          |
| `Export`              | Exportações assíncronas (status, format, fileUrl)       |
| `DashboardPreference` | Preferências de dashboard por usuário (widgets, layout) |

### 5.2 Enums

- `DemandStatus`: PENDING, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD
- `Priority`: LOW, MEDIUM, HIGH, URGENT
- `ContractStatus`: ACTIVE, SUSPENDED, EXPIRED, CANCELLED
- `NotificationChannel`: EMAIL, WHATSAPP, TELEGRAM, DISCORD, IN_APP, WEBHOOK
- `ExportStatus`: PENDING, PROCESSING, COMPLETED, FAILED
- `ExportFormat`: XLSX, PDF, CSV, JSON

### 5.3 Regras Críticas do Banco

> ⚠️ **NUNCA armazene horas como VARCHAR ou decimal.** Utilize `durationMinutes: Int` (ex: 270 = 4h30). A conversão para `HH:mm` é feita apenas no front-end via `formatDuration()` em `lib/utils.ts`.

> ⚠️ **Campos de descrição longa usam `@db.Text`** (TEXT no PostgreSQL), não VARCHAR(255).

> ⚠️ **Soft Delete**: Toda tabela principal tem `deletedAt: DateTime?`. Todas as queries DEVEM filtrar `deletedAt: null`.

### 5.4 IDs e Prisma Client

- IDs gerados via `@default(cuid())`.
- Prisma Client gerado em `lib/generated/prisma/` (output customizado no `schema.prisma`).
- Conexão via **driver adapter** (`@prisma/adapter-pg` + `pg.Pool`), não via URL direta do Prisma.
- Singleton em `lib/prisma.ts` com cache em `globalThis` para hot-reload em dev.

---

## 6. Scripts e Comandos

```bash
npm run dev            # Next.js dev server (Turbopack habilitado)
npm run build          # Build de produção
npm run lint           # ESLint
npm run db:generate    # prisma generate (com prisma.config.ts)
npm run db:migrate     # prisma migrate dev
npm run db:seed        # Executa prisma/seed.ts
npm run db:setup       # generate + migrate + seed (tudo junto)
npm run up             # Docker Compose (postgres, redis, minio, mailpit) + db:setup + dev
npm run up:prod        # Docker Compose completo + setup prod + start
```

### Seed Padrão

- Organização: "Empresa Padrão" (slug: `default`, plan: `enterprise`)
- Usuário admin: `admin@perschtech.com` / senha no seed
- Roles: `admin` (todas permissões), `user` (demand CRU parcial)
- Permissions: 13 recursos × 4 ações (CRUD) = 52 permissões
- Dados de exemplo: 1 analista, 1 cliente, 1 contrato, 1 requester, 1 department, 1 demand type, 1 demand

---

## 7. Convenções e Padrões de Código

### 7.1 TypeScript

- `strict: true` no `tsconfig.json`
- ESLint com `strictTypeChecked` + `stylisticTypeChecked`
- `type` preferido sobre `interface` (`consistent-type-definitions: ["warn", "type"]`)
- Variáveis não usadas com prefixo `_` são permitidas
- `no-console: warn` (apenas `console.warn` e `console.error` permitidos)
- `prefer-nullish-coalescing` e `prefer-optional-chain` enforced
- Nullish coalescing obrigatório: use `??` ao invés de `||`
- Path alias: `@/*` mapeia para a raiz do projeto

### 7.2 Padrão de Retorno dos Services

Todos os métodos de service retornam:

```typescript
Promise<{ data?: T; error?: string }>;
// ou
Promise<{ success?: boolean; error?: string }>;
```

### 7.3 API Route Handlers

Padrão de implementação:

```typescript
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const organizationId = request.headers.get('X-Organization-Id');
  if (!organizationId)
    return NextResponse.json(
      { error: 'Organization not found' },
      { status: 403 },
    );

  // ... lógica de negócio
}
```

### 7.4 Estrutura de Módulo de Página

Ao criar uma nova funcionalidade (CRUD), siga o padrão de `demands/`:

```
app/(dashboard)/[nome-do-modulo]/
├── page.tsx               # Página principal (listagem + ações)
├── _columns.tsx           # Definição de colunas TanStack Table
├── hooks/
│   └── use-[modulo].ts    # Hook de dados local (se necessário)
├── schema/
│   └── [modulo]-schema.ts # Schema Zod para formulários
└── ui/
    ├── [modulo]-form.tsx           # Formulário (React Hook Form)
    └── [modulo]-delete-dialog.tsx  # Dialog de confirmação de exclusão
```

### 7.5 Novos CRUDs

Para adicionar uma nova entidade ao sistema:

1. **Schema Prisma**: Adicionar model em `prisma/schema.prisma` com `organizationId`, `createdAt`, `updatedAt`, `deletedAt`
2. **Migration**: `npm run db:migrate`
3. **Repository**: Criar em `repositories/` estendendo `BaseRepository`
4. **Service**: Criar em `services/` estendendo `BaseService`
5. **API Route**: Criar em `app/api/[entidade]/route.ts` (GET + POST) e `app/api/[entidade]/[id]/route.ts` (GET + PUT + DELETE)
6. **Hook SWR**: Adicionar `use[Entidade]()` em `hooks/use-api.ts`
7. **Página**: Criar módulo em `app/(dashboard)/[entidade]/` seguindo o padrão acima
8. **Sidebar**: Adicionar item em `components/sidebar.tsx` no array `navItems`

### 7.6 Formatação e Utilitários

- `cn()` — Merge de classes Tailwind (`clsx` + `twMerge`)
- `formatCurrency(value)` — Formata para BRL (`R$ 1.234,56`)
- `formatDate(date)` — Formata para pt-BR (`DD/MM/YYYY`)
- `formatDateTime(date)` — Formata para pt-BR com hora
- `formatDuration(minutes)` — Converte minutos para `HH:mm` (ex: `270` → `04:30`)

---

## 8. Segurança

### Implementado

- **Argon2** para hashing de senhas
- **JWT** com expiração de 30 dias
- **RBAC** granular (`resource:action`)
- **Soft Delete** em todas tabelas principais
- **Auditoria** (AuditLog com entity, field, oldValue, newValue, userId, IP, userAgent)
- **Pino Logger** com redação de dados sensíveis (authorization, cookie, password)
- **Nginx** com headers de segurança (X-Frame-Options, X-Content-Type-Options, XSS-Protection, Referrer-Policy, CSP)
- **Middleware** (`proxy.ts`) valida sessão e injeta `X-User-Id` e `X-Organization-Id` nos headers
- **Multi-tenant isolation** via `organizationId` em todas as queries

### Preparado/Planejado

- MFA (campos de sessão presentes)
- Rate Limiting
- CSRF Protection
- Sentry (variável `NEXT_PUBLIC_SENTRY_DSN` no .env)
- Criptografia de dados sensíveis
- Backups automatizados

---

## 9. Infraestrutura

### Docker Compose (Desenvolvimento)

O comando `npm run up` executa:

1. Sobe containers Docker (postgres, redis, minio, mailpit)
2. Executa `prisma generate` + `prisma migrate dev` + `seed.ts`
3. Inicia `next dev` (Turbopack)

### Docker Compose (Produção)

Inclui adicionalmente `nginx` (reverse proxy na porta 80) e `app` (build multi-stage do Next.js).

### Variáveis de Ambiente (.env)

```
DATABASE_URL        # PostgreSQL connection string
REDIS_URL           # Redis connection string
MINIO_ENDPOINT      # MinIO host
MINIO_PORT          # MinIO API port (9000)
MINIO_ACCESS_KEY    # MinIO credentials
MINIO_SECRET_KEY    # MinIO credentials
MINIO_BUCKET        # Bucket name
MINIO_USE_SSL       # SSL toggle
AUTH_SECRET          # NextAuth secret
AUTH_URL             # App base URL
SMTP_HOST/PORT/USER/PASS/FROM  # Email config (Mailpit em dev)
NEXT_PUBLIC_APP_URL  # Public app URL
NEXT_PUBLIC_APP_NAME # App display name
NEXT_PUBLIC_SENTRY_DSN  # Sentry DSN (opcional)
LOG_LEVEL            # Pino log level (default: info)
```

---

## 10. Checklist para Agentes IA

### Antes de Criar/Modificar Código

- [ ] Verificou se o campo de duração usa `durationMinutes: Int` (nunca VARCHAR/String)?
- [ ] Campos de texto longo usam `@db.Text` no schema Prisma?
- [ ] Toda query filtra por `organizationId` E `deletedAt: null`?
- [ ] Novas entidades seguem o padrão de `softDelete` (`deletedAt: DateTime?`)?
- [ ] O retorno dos Services segue `{ data?: T; error?: string }`?
- [ ] Route Handlers verificam `auth()` e `X-Organization-Id`?
- [ ] Novos componentes client-side usam `"use client"` no topo?
- [ ] Schemas Zod estão em arquivos separados dentro de `schema/`?
- [ ] Novos itens de navegação foram adicionados ao `navItems` em `sidebar.tsx`?

### Antes de Modificar o Schema Prisma

- [ ] Adicionou `organizationId` como FK para `Organization`?
- [ ] Incluiu `createdAt`, `updatedAt`, `deletedAt` nos fields?
- [ ] IDs usam `@default(cuid())`?
- [ ] Gerou migration com `npm run db:migrate`?
- [ ] Atualizou o `seed.ts` se necessário?

### Antes de Entregar

- [ ] `npm run lint` passa sem erros?
- [ ] O app compila com `npm run build`?
- [ ] Testou o fluxo de ponta a ponta (CRUD via UI)?
- [ ] Logs são feitos via `logger` (Pino), não via `console.log`?
