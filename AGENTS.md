# HoursControl SaaS - Especificação Técnica e Prompt Mestre

> **Versão:** 1.0

## Visão Geral

HoursControl é um SaaS para gestão de apontamentos de horas, contratos, clientes, analistas e indicadores.

## Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- TailwindCSS + shadcn/ui
- TanStack Query/Table
- React Hook Form + Zod
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- MinIO
- Docker Compose
- Nginx
- Pino
- Sentry
- Auth.js

## Funcionalidades

### Autenticação

- Login
- Recuperação de senha
- MFA preparado
- RBAC
- Auditoria

### Cadastros

- Usuários
- Perfis
- Permissões
- Analistas
- Clientes
- Contratos
- Solicitantes
- Setores
- Tipos de demanda
- Tags

### Demandas

Campos:

- Data
- Analista
- Cliente
- Solicitante
- Setor
- Tipo
- Nome da demanda (obrigatório)
- Descrição (TEXT obrigatório)
- Duração (armazenar em minutos)
- Prioridade
- Status
- Anexos
- Comentários

## Banco

Armazenar duração como INTEGER em minutos.

Exemplo:

- 04:30 = 270

## Dashboard

- Horas por cliente
- Horas por analista
- Demandas por cliente
- Demandas por setor
- Horas contratadas x consumidas
- Evolução mensal
- Top clientes
- Top analistas

Exportação PNG/PDF.

## Relatórios

Filtros:

- Data
- Mês
- Ano
- Período
- Cliente
- Analista
- Setor
- Solicitante

Exportar:

- XLSX
- PDF
- CSV

## Notificações

- Sistema
- Email
- WhatsApp
- Telegram
- Discord
- Webhooks

## Automações

- Aviso de horas consumidas
- Aviso de contrato vencendo
- SLA
- Cron jobs

## Segurança

- OWASP
- Helmet
- CSP
- Argon2
- JWT
- Refresh Token
- Soft Delete
- Auditoria
- Rate Limit
- XSS
- CSRF
- SQL Injection Protection

## Arquitetura

Clean Architecture

```
src/
  app/
  components/
  features/
  services/
  repositories/
  lib/
  prisma/
```

## Docker Compose

Serviços:

- app
- postgres
- redis
- minio
- mailpit
- nginx

## Funcionalidades Extras

- Cronômetro
- Templates
- Importação Excel
- API REST
- Swagger
- Comentários
- Anexos
- Multiempresa
- Dark Mode
- Internacionalização
- Dashboard customizável
- Busca global
- Favoritos

# Prompt Mestre para Opencode

Desenvolva um sistema SaaS corporativo chamado HoursControl utilizando toda a arquitetura e tecnologias descritas neste documento.

Requisitos:

1. Código production-ready.
2. TypeScript estrito.
3. Clean Architecture.
4. SOLID.
5. Prisma.
6. PostgreSQL.
7. Docker.
8. Testes automatizados.
9. UI moderna responsiva.
10. Componentes reutilizáveis.
11. APIs documentadas com OpenAPI.
12. RBAC completo.
13. Dashboard com gráficos.
14. Exportação XLSX e PDF.
15. Notificações e automações.
16. Logs e auditoria.
17. Segurança seguindo OWASP.
18. Multiempresa preparado.
19. Código limpo e documentado.
20. Gere o projeto completo, incluindo banco, migrations, seeds, Docker, documentação e testes.

# Contexto e Objetivo

Você atuará como um Arquiteto de Software Sênior e Desenvolvedor Full-Stack Especialista. O objetivo é projetar e desenvolver do zero um sistema corporativo SaaS Multi-tenant para gestão de demandas, apontamento de horas e controle de SLAs de analistas alocados em clientes.

O sistema deve ter nível empresarial, preparado para integrações via API (TOTVS RM, Jira, GLPI, etc.), alta escalabilidade, segurança robusta e trilha de auditoria completa.

---

# Stack Tecnológica Exigida

## Front-end

- **Framework:** Next.js 15 (App Router) com React 19.
- **Linguagem:** TypeScript.
- **Estilização & UI:** TailwindCSS, Shadcn/UI, Framer Motion.
- **Gerenciamento de Estado & Dados:** TanStack Query (React Query), TanStack Table.
- **Formulários & Validação:** React Hook Form e Zod.
- **Gráficos:** Recharts.

## Back-end (Next.js + Ferramentas)

- **Arquitetura:** Route Handlers, Server Actions e Middleware do Next.js.
- **Autenticação & Autorização:** NextAuth/Auth.js (Login, JWT, Refresh Token, Controle de Sessão, MFA futuro), RBAC (Role Based Access Control).
- **Banco de Dados:** PostgreSQL utilizando Prisma ORM.
- **Cache & Filas:** Redis (Sessão, cache, fila) + BullMQ (E-mails, WhatsApp, Telegram, Exportações).
- **Armazenamento:** MinIO (PDF, XLSX, anexos, imagens).
- **Observabilidade:** Pino (Logs estruturados) e Sentry (Monitoramento de erros).
- **Infraestrutura:** Docker Compose contendo Next.js, PostgreSQL, Redis, Mailpit e Nginx.

---

# Arquitetura e Padrões de Projeto

1. **Multi-tenant Nativo:** A aplicação deve isolar completamente os dados, permitindo que várias empresas (consultorias) utilizem o sistema sob a mesma infraestrutura.
2. **Armazenamento de Horas:** É terminantemente proibido salvar horas como `VARCHAR` (ex: "04:30") ou decimais soltos. O banco de dados deve armazenar um campo `duration_minutes` do tipo `INTEGER` (ex: 270 minutos). A conversão para `HH:mm` deve ser feita apenas na camada de apresentação (Front-end).
3. **Descrições Longas:** O campo de descrição da demanda deve ser configurado como `TEXT` no PostgreSQL, descartando a limitação de 255 caracteres do `VARCHAR`.
4. **Arquitetura em Camadas:** Manter separação clara entre Domain, Application e Infrastructure para facilitar a manutenção e escalabilidade.

---

# Entidades do Banco de Dados (Prisma Schema)

O banco deverá contemplar as seguintes tabelas e seus respectivos relacionamentos:
`users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `analysts`, `clients`, `client_contracts`, `requesters`, `departments`, `demand_types`, `demands`, `attachments`, `comments`, `notifications`, `notification_settings`, `audit_logs`, `exports`, `dashboard_preferences`, `tags`, `demand_tags`.

---

# Módulos e Funcionalidades Core (CRUDs)

## 1. Gestão de Clientes e Contratos

- **Campos:** Nome, Razão Social, CNPJ, Email, Telefone, Responsável, Horas contratadas, Valor da Hora, Data início/fim do contrato, Status, Cor de identificação, Observações.
- **Recurso adicional:** Fixar clientes nos "Favoritos".

## 2. Gestão de Analistas

- **Campos:** Nome, Email, Telefone, Cargo, Valor Hora, Status, Foto, Equipe, Cor de identificação.

## 3. Estrutura de Atendimento

- **Solicitantes:** Nome, Email, Telefone, Cliente vinculado, Status.
- **Setores:** Nome, Cliente vinculado, Descrição.
- **Tipos de Demanda:** Categorização (ex: Suporte, Desenvolvimento, Consultoria, Treinamento, Integração).

## 4. Lançamento e Gestão de Demandas

- **Campos obrigatórios:** Nome da demanda, Descrição completa (`TEXT`).
- **Relacionamentos:** Analista, Cliente, Solicitante, Setor, Tipo.
- **Métricas de tempo:** Data (DD/MM/YYYY), Hora Inicial, Hora Final, Tempo Gasto (`duration_minutes`).
- **Controle:** Observações, Status, Prioridade, Tags.

---

# Funcionalidades de Alto Valor (Diferenciais SaaS)

1. **Apontamento Inteligente:**
   - Cronômetro integrado na UI para iniciar/parar contagem de horas automaticamente.
   - Botão para "Duplicar Demanda" (atividades recorrentes).
   - Templates de demandas pré-configurados.
2. **Visualização Avançada:**
   - Calendário (Visão diária, semanal e mensal de horas apontadas).
   - Modo Kanban interativo (Drag & Drop) para gestão de status das demandas.
3. **Colaboração e Anexos:**
   - Sistema de comentários na demanda (estilo GitHub), com menções (`@usuario`) e histórico.
   - Upload de múltiplos anexos (PDF, DOCX, Imagens, ZIP, XLSX, LOGs) via MinIO.
4. **Produtividade & Integração:**
   - Importação em lote via Excel para migração de dados legado.
   - API REST documentada (Swagger/OpenAPI) e Webhooks de saída para integração com RM, Jira, etc.
5. **Gestão de Nível de Serviço (SLA):**
   - Medição de tempo de primeiro atendimento e resolução final por cliente.

---

# Dashboard, Relatórios e Exportações

- **Painel Executivo e Personalizado:** Dashboard customizável por usuário (escolha de widgets), modo Dark/Light mode.
- **Cards Principais:** Horas no mês/ano, Demandas abertas/fechadas, Clientes ativos, Horas consumidas vs. Restantes, Indicadores financeiros (Margem por cliente, previsão de esgotamento).
- **Gráficos Recharts:** Horas por cliente/analista, Demandas por setor/solicitante, Evolução mensal, Comparativo com mês anterior, Top clientes.
- **Exportação Profissional:** Capacidade de gerar e exportar relatórios, gráficos e listas filtradas em PDF, XLSX, CSV, JSON, PNG ou SVG (com processamento assíncrono via BullMQ para relatórios pesados).
- **Filtros Avançados:** Filtros globais e específicos (Hoje, Ontem, Mês, Ano, Período customizado, Analista, Status, Cliente, etc.), com opção de salvar presets de busca.

---

# Automações e Alertas

O sistema deve avaliar regras em background e disparar notificações (via Email, WhatsApp, Telegram, Discord, Webhooks ou In-App).

- **Gatilhos de Alerta:**
  - Alerta de consumo de franquia (ex: "Cliente atingiu 90% das horas mensais contratadas").
  - Excedente de horas detectado.
  - Vencimento de contrato próximo (ex: 15 dias).
  - Ociosidade (ex: "Analista sem lançamentos há 3 dias").
- **Central de Notificações In-App:** Com histórico e controle de leitura.
- **Tela de Configuração:** Interface para o usuário habilitar/desabilitar canais de automação.

---

# Segurança, Auditoria e Logs

- **Auditoria (Histórico):** Toda alteração (UPDATE/DELETE) em registros críticos deve gerar um log com: Usuário, Data/Hora, Campo alterado, Valor antigo, Valor novo, IP e Navegador.
- **Segurança da Aplicação:** Rate Limit, Proteção CSRF e XSS, Prevenção de SQL Injection (via Prisma), Helmet, Content Security Policy (CSP).
- **Autenticação:** Senhas hasheadas com Argon2, Rotação de tokens, Política de senhas fortes.
- **Resiliência:** Soft delete em todas as tabelas principais, rotinas de backup automatizado e criptografia de dados sensíveis.
- **Log do Sistema:** Registro abrangente via Pino de eventos de Login, Logout, Erros, Chamadas de API e Exportações.

---

# Diretrizes para a Resposta da IA

A partir deste momento, atue como o Engenheiro Principal deste projeto.
Inicie fornecendo a modelagem detalhada do banco de dados (`schema.prisma`), incluindo as diretrizes de multi-tenant e o campo `duration_minutes`. Em seguida, proponha a estrutura de pastas do Next.js 15 (App Router) adequada para suportar os módulos descritos com Clean Architecture/Domain-Driven Design simplificado.
