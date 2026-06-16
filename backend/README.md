# Backend — Eu Amo Piri

API REST do projeto **Eu Amo Piri**, desenvolvida para compartilhar experiências de quem visitou Pirenópolis (pousadas, restaurantes, cachoeiras).

Este documento explica tudo o que outro desenvolvedor precisa saber para clonar o repositório, configurar o ambiente e começar a contribuir.

### Índice rápido

- [Desenvolvimento local (Docker)](#banco-de-dados-com-docker)
- [Produção (Supabase) — passo a passo](#banco-de-dados-de-produção-supabase)
- [Primeiros passos (setup local)](#primeiros-passos-setup-completo--desenvolvimento-local)
- [Arquitetura MVC](#arquitetura-mvc)
- [Endpoints da API](#endpoints-da-api)
- [Problemas comuns](#problemas-comuns)

---

## Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **Node.js** | Runtime JavaScript |
| **TypeScript** | Tipagem estática |
| **Express 5** | Servidor HTTP e rotas |
| **Passport.js** | Autenticação (Facade + Strategy) |
| **google-auth-library** | Validação OAuth Google |
| **Swagger** | Documentação interativa da API (`/api-docs`) |
| **Prisma 7** | ORM e migrations do banco |
| **PostgreSQL** | Banco de dados relacional |
| **Docker** | Sobe o PostgreSQL local de forma padronizada (desenvolvimento) |
| **Supabase** | PostgreSQL na nuvem (banco de produção) |
| **tsx** | Executa TypeScript em desenvolvimento |

---

## Pré-requisitos

Antes de começar, instale na sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recomendado para o banco de dados)
- Git

> **Alternativa ao Docker:** é possível usar PostgreSQL instalado diretamente no sistema operacional ou um banco na nuvem. Nesse caso, ajuste a `DATABASE_URL` no `.env` conforme o seu ambiente.

---

## Banco de dados com Docker

O projeto utiliza **PostgreSQL rodando em um container Docker** no ambiente de desenvolvimento. Isso garante que **todos os desenvolvedores usem a mesma versão e configuração do banco**, sem precisar instalar o PostgreSQL manualmente.

### Como funciona para cada desenvolvedor?

| O que | Explicação |
|-------|------------|
| **Container Docker** | Roda **localmente** na máquina de cada desenvolvedor — não é compartilhado via Git |
| **Comando `docker run`** | Cada pessoa executa o mesmo comando após clonar o projeto |
| **Dados do banco** | Ficam no container/volume local de cada máquina (cada dev tem seu próprio banco) |
| **Código e migrations** | Versionados no Git — todos aplicam as mesmas tabelas com `prisma migrate` |
| **`.env`** | Cada dev cria o seu localmente (não versionado), apontando para `localhost:5432` |

Ou seja: o **Docker não vai no repositório**, mas o **comando para subir o banco** e a **connection string** ficam documentados aqui para que qualquer pessoa replique o ambiente.

### Subir o PostgreSQL (primeira vez)

Com o Docker Desktop aberto e rodando, execute na pasta `backend/` (ou em qualquer terminal):

```bash
docker run --name euamopiri-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=euamopiri \
  -p 5432:5432 \
  -d postgres:16
```

| Parâmetro | Significado |
|-----------|-------------|
| `--name euamopiri-db` | Nome do container (facilita start/stop) |
| `POSTGRES_PASSWORD=postgres` | Senha do usuário padrão `postgres` |
| `POSTGRES_DB=euamopiri` | Nome do banco criado automaticamente |
| `-p 5432:5432` | Expõe a porta 5432 do container no `localhost` |
| `-d` | Roda em segundo plano (detached) |
| `postgres:16` | Imagem oficial do PostgreSQL 16 |

Verifique se o container está rodando:

```bash
docker ps
```

Você deve ver o container `euamopiri-db` com status **Up** e porta `0.0.0.0:5432->5432/tcp`.

### Connection string correspondente

Com o container acima, use no `.env`:

```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/euamopiri"
PORT=3000
```

| Parte da URL | Valor |
|--------------|-------|
| Usuário | `postgres` (padrão da imagem) |
| Senha | `postgres` |
| Host | `localhost` |
| Porta | `5432` |
| Banco | `euamopiri` |

### Uso no dia a dia

O container **não precisa ser recriado** a cada vez que você for desenvolver. Use:

```bash
# Parar o banco (ao encerrar o trabalho)
docker stop euamopiri-db

# Iniciar novamente (no próximo dia)
docker start euamopiri-db

# Ver logs do banco (útil para debug)
docker logs euamopiri-db

# Ver se está rodando
docker ps
```

### Remover e recriar o container

Se precisar zerar o banco local ou corrigir configuração:

```bash
docker stop euamopiri-db
docker rm euamopiri-db
```

Depois rode o comando `docker run` novamente (seção acima) e reaplique as migrations:

```bash
npx prisma migrate deploy
```

> **Atenção:** remover o container apaga os dados locais desse banco. O código e as migrations no Git não são afetados.

---

## Banco de dados de produção (Supabase)

Este projeto usa **dois bancos separados**:

| Ambiente | Onde fica | Arquivo de config | Quem usa os dados |
|----------|-----------|-------------------|-------------------|
| **Desenvolvimento** | Docker na sua máquina | `.env` | Só você (testes locais) |
| **Produção** | Supabase na nuvem | `.env.prod` | Toda a equipe + usuários reais |

O banco de produção **não roda na sua máquina**. Ele fica no [Supabase](https://supabase.com) e é compartilhado pela equipe.

### Como tudo se conecta (visão geral)

```
DESENVOLVIMENTO (seu computador)
  npm run dev  →  API (localhost:3000)  →  Docker (localhost:5432)

PRODUÇÃO (nuvem — futuro deploy no Render)
  Usuário  →  Site (Render)  →  API (Render)  →  Supabase (banco)
```

> **Importante:** o usuário final **nunca acessa o Supabase diretamente**. Ele usa o site; o site chama a API; a API grava no banco.

---

### Passo 1 — Obter acesso ao Supabase

1. Peça a um membro da equipe:
   - convite para o projeto no painel do Supabase, **ou**
   - o arquivo `.env.prod` por um **canal seguro** (Discord privado, gerenciador de senhas da equipe)
2. **Nunca** envie `.env.prod` pelo Git — ele contém senhas e está no `.gitignore`.
3. Salve o arquivo em `backend/.env.prod` (mesma pasta do `package.json`).

> Modelo sem senhas: copie `.env.prod.example` para `.env.prod` e preencha com os dados da equipe:
> ```bash
> cp .env.prod.example .env.prod
> ```

Estrutura esperada do `.env.prod`:

```env
# API em produção usa o pooler (porta 6543)
DATABASE_URL="postgresql://postgres.[REF]:[SENHA]@....pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migrations usam conexão direta (porta 5432)
DIRECT_URL="postgresql://postgres.[REF]:[SENHA]@....pooler.supabase.com:5432/postgres"

PORT=3000
```

| Variável | Para que serve |
|----------|----------------|
| `DATABASE_URL` | API rodando (pooler, porta `6543`) |
| `DIRECT_URL` | Comandos `prisma migrate` (porta `5432`) |

---

### Passo 2 — Preparar o projeto (primeira vez com produção)

Na pasta `backend/`:

```bash
npm install
npx prisma generate
```

---

### Passo 3 — Aplicar as tabelas no Supabase (migrations)

Se o banco de produção ainda não tiver as tabelas, ou se alguém adicionou migrations novas no Git:

```bash
npm run prisma:migrate:prod
```

Saída esperada:

```
All migrations have been successfully applied.
```

Isso cria/atualiza as tabelas `Place` e `Experiences` no Supabase.

> **Regra de ouro:**
> - `npx prisma migrate dev` → **só no Docker local** (desenvolvimento)
> - `npm run prisma:migrate:prod` → **Supabase** (produção)

---

### Passo 4 — Ver os dados no painel do Supabase (modo visual)

1. Acesse [https://supabase.com](https://supabase.com) e faça login.
2. Abra o projeto da equipe (ex.: `euamopiri-prod`).
3. No menu lateral, clique em **Table Editor**.
4. Selecione a tabela `Place` ou `Experiences`.
5. Você pode **ver**, **filtrar** e **editar** registros manualmente (cuidado em produção!).

---

### Passo 5 — Ver e editar dados com Prisma Studio (alternativa)

Na pasta `backend/`:

```bash
npm run prisma:studio:prod
```

Abre uma interface no navegador (geralmente `http://localhost:5555`) conectada ao **Supabase**.

Útil para:
- Conferir se um cadastro via API realmente chegou no banco
- Ver estrutura das tabelas
- Editar ou apagar registros de teste

---

### Passo 6 — Conectar a API ao banco de produção (teste local)

Por padrão, `npm run dev` usa o **Docker local** (`.env`).

Para testar a API apontando para o **Supabase**:

```bash
npm run dev:prod
```

Deve aparecer: `Servidor rodando em http://localhost:3000`

Agora os cadastros vão para o banco de **produção** no Supabase.

| Comando | Banco usado |
|---------|-------------|
| `npm run dev` | Docker local (`.env`) |
| `npm run dev:prod` | Supabase (`.env.prod`) |

> **Cuidado:** com `dev:prod`, tudo que você cadastrar vai para o banco real da equipe. Use nomes como `"Teste - seu nome"` para identificar registros de teste.

---

### Passo 7 — Testar cadastros na API (PowerShell / Windows)

Com `npm run dev:prod` rodando em um terminal, abra **outro** terminal:

**Listar locais:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/places" -Method GET
```

**Cadastrar um local:**

```powershell
$body = @{
    name = "Teste - Amanda"
    category = "restaurante"
    description = "Cadastro de teste em producao"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/places" -Method POST -Body $body -ContentType "application/json"
```

**Cadastrar experiência (substitua `1` pelo id do local):**

```powershell
$body = @{
    userName = "Amanda"
    rating = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/places/1/experiences" -Method POST -Body $body -ContentType "application/json"
```

Confirme no **Table Editor** do Supabase ou com `npm run prisma:studio:prod`.

---

### Passo 8 — Alterar a estrutura do banco (novas tabelas/colunas)

Fluxo completo para a equipe:

```
1. Altere prisma/schema.prisma no seu computador
2. Teste localmente:
     npx prisma migrate dev --name descricao_da_mudanca
3. Commit da pasta prisma/migrations/ no Git
4. Cada dev (ou CI) aplica em produção:
     npm run prisma:migrate:prod
```

**Nunca** rode `prisma migrate dev` apontando para o Supabase. Esse comando é só para o Docker local.

---

### Passo 9 — Conexão com o Render (quando a API for publicada)

Quando o backend for deployado no [Render](https://render.com):

1. Crie um **Web Service** apontando para a pasta `backend/` do repositório.
2. No painel do Render, em **Environment**, adicione:
   - `DATABASE_URL` = valor do **pooler** (porta `6543`) do `.env.prod`
3. Configure os comandos de build/start:

| Campo | Valor sugerido |
|-------|----------------|
| Build Command | `npm install && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `node --import tsx ./src/server.ts` |

A API pública no Render usará a mesma `DATABASE_URL` do Supabase — igual ao `npm run dev:prod`, mas acessível pela internet.

---

### Scripts de produção disponíveis

| Comando | O que faz |
|---------|-----------|
| `npm run dev:prod` | Sobe a API local conectada ao Supabase |
| `npm run prisma:migrate:prod` | Aplica migrations no Supabase |
| `npm run prisma:studio:prod` | Abre Prisma Studio no Supabase |
| `npm run prisma:generate:prod` | Gera o Prisma Client (raramente necessário separado) |

> Os scripts acima usam `dotenv-cli` internamente. Se quiser rodar manualmente: `npx dotenv -e .env.prod -o -- <comando>`.

---

### Regras de segurança em produção

| Pode | Não pode |
|------|----------|
| Ver dados no Table Editor | Commitar `.env.prod` no Git |
| Cadastrar dados de teste identificados | Apagar tabelas sem combinar com a equipe |
| Rodar `prisma:migrate:prod` após merge de migrations | Rodar `prisma migrate dev` no Supabase |
| Compartilhar credenciais por canal seguro da equipe | Postar senhas em chat público |

---

### Problemas comuns — produção (Supabase)

#### `dotenv` não é reconhecido no terminal

O `dotenv` só funciona via `npm run` ou `npx`:

```bash
# Errado (PowerShell)
dotenv -e .env.prod -o -- npm run dev

# Certo
npm run dev:prod
# ou
npx dotenv -e .env.prod -o -- npm run dev
```

#### `P1000: Authentication failed`

- Senha incorreta ou mal formatada na URL.
- Copie a connection string **direto do painel do Supabase** (Database → Connection string → URI).
- Se a senha tiver `@`, `#`, `[`, `]` etc., ela precisa estar **URL-encoded** na string.

#### Migration ok, mas API cadastra no Docker local

Você provavelmente rodou `npm run dev` em vez de `npm run dev:prod`. Pare o servidor (Ctrl+C) e suba com `npm run dev:prod`.

#### `prisma migrate deploy` conecta no localhost

Use sempre `npm run prisma:migrate:prod`, não `npx prisma migrate deploy` direto (esse usa o `.env` local).

#### Como saber se estou no banco certo?

Ao rodar `npm run prisma:migrate:prod`, a saída deve mostrar o host do Supabase:

```
Datasource "db": PostgreSQL ... at "....pooler.supabase.com:5432"
```

Se aparecer `localhost`, você está no banco errado.

---

### Checklist — banco de produção

```
[ ] Recebi o .env.prod (ou convite no Supabase) pela equipe
[ ] Arquivo salvo em backend/.env.prod (não commitado)
[ ] npm install
[ ] npx prisma generate
[ ] npm run prisma:migrate:prod  → migrations aplicadas
[ ] Table Editor do Supabase mostra Place e Experiences
[ ] npm run dev:prod  → API conectada ao Supabase
[ ] POST /places  → registro aparece no Supabase
```

---

## Primeiros passos (setup completo — desenvolvimento local)

### 1. Clonar o repositório e entrar na pasta do backend

```bash
git clone <url-do-repositorio>
cd backend
```

### 2. Subir o banco PostgreSQL com Docker

Siga a seção [Banco de dados com Docker](#banco-de-dados-com-docker) e execute o `docker run` (ou `docker start euamopiri-db` se o container já existir).

### 3. Instalar dependências

```bash
npm install
```

### 4. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

O `.env.example` já traz a `DATABASE_URL` compatível com o container Docker. Em geral, **não é necessário alterar nada** se você usou o comando documentado acima.

```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/euamopiri"
PORT=3000
```

> **Importante:** o arquivo `.env` **não é versionado** no Git (contém senhas e segredos). Cada desenvolvedor cria o seu localmente a partir do `.env.example`. Credenciais serão compartilhadas individualmente para o grupo

### 5. Gerar o Prisma Client

A pasta `generated/prisma/` **não está no Git** de propósito. Ela é recriada automaticamente a partir do schema.

```bash
npx prisma generate
```

Isso gera o cliente em `backend/generated/prisma/`, que é usado pelo código em `src/config/prisma.ts`, `src/model/` e `src/views/`.

> **Por que não versionar o `generated/`?**
> O conteúdo é gerado automaticamente pelo Prisma a partir de `prisma/schema.prisma`. Versionar essa pasta causaria conflitos desnecessários entre desenvolvedores. O fluxo correto é: clonar → `npm install` → `npx prisma generate`.

### 6. Aplicar as migrations no banco

As migrations (em `prisma/migrations/`) **são versionadas** e criam as tabelas no PostgreSQL:

```bash
npx prisma migrate deploy
```

Em desenvolvimento, se precisar sincronizar um banco novo:

```bash
npx prisma migrate dev
```

### 7. Subir o servidor

```bash
npm run dev
```

Se tudo estiver certo, você verá:

```
Servidor rodando em http://localhost:3000
```

Teste no navegador ou com curl:

```bash
curl http://localhost:3000
```

Resposta esperada:

```json
{ "message": "Bem-vindo À API do Eu Amo Piri!" }
```

---

## Checklist rápido para novo desenvolvedor

```
[ ] Node.js instalado
[ ] Docker Desktop instalado e rodando
[ ] git clone + cd backend
[ ] docker run ... (ou docker start euamopiri-db)
[ ] docker ps  → container euamopiri-db com status Up
[ ] npm install
[ ] cp .env.example .env
[ ] npx prisma generate
[ ] npx prisma migrate deploy
[ ] npm run dev
[ ] GET http://localhost:3000 responde OK
```

---

## Arquitetura MVC

O backend segue o padrão **MVC** (Model — View — Controller), adaptado para uma API REST:

```
Requisição HTTP
      ↓
  server.ts        → inicializa o Express e registra as rotas
      ↓
  routes/          → mapeia URL + método HTTP → controller
      ↓
  controllers/     → recebe req/res, chama o model, usa a view
      ↓
  model/           → acessa o banco via Prisma
      ↓
  views/           → formata os dados para JSON de resposta
      ↓
  Resposta HTTP
```

### Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma          # Place, Experiences, User
│   └── migrations/
├── generated/prisma/          # cliente Prisma gerado (NÃO versionado)
├── src/
│   ├── config/
│   │   ├── prisma.ts
│   │   ├── passport.ts        # Facade Passport (local + jwt)
│   │   └── swagger.ts         # OpenAPI spec
│   ├── services/
│   │   ├── authService.ts
│   │   └── googleAuthService.ts
│   ├── model/
│   │   ├── placeModel.ts
│   │   ├── experienceModel.ts
│   │   └── userModel.ts
│   ├── views/
│   │   ├── placeView.ts
│   │   ├── experienceView.ts
│   │   └── userView.ts
│   ├── controllers/
│   │   ├── placeController.ts
│   │   ├── experienceController.ts
│   │   └── authController.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── placeRoutes.ts
│   │   └── experienceRoutes.ts
│   ├── middleware/
│   │   └── authMiddleware.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── password.ts
│   └── server.ts              # ponto de entrada (bootstrap)
├── .env.example               # modelo para desenvolvimento (Docker)
├── .env                       # credenciais locais — Docker (não versionado)
├── .env.prod                  # credenciais Supabase — produção (não versionado)
├── prisma.config.ts           # configuração do Prisma CLI
├── package.json
└── tsconfig.json
```

### Responsabilidade de cada camada

| Camada | O que faz | O que **não** faz |
|--------|-----------|-------------------|
| `server.ts` | Sobe o servidor, middlewares, registra rotas | Lógica de negócio, queries |
| `routes/` | Define endpoints (`GET /places`, etc.) | Acesso ao banco |
| `controllers/` | Extrai dados de `req`, trata erros HTTP | Queries Prisma diretas |
| `model/` | CRUD no PostgreSQL via Prisma | Conhecer `req`/`res` |
| `views/` | Formata objeto para JSON da API | Acessar banco |
| `config/` | Configuração compartilhada (Prisma) | Rotas ou regras de negócio |

---

## Modelos de dados

Definidos em `prisma/schema.prisma`:

### Place (local)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Chave primária (auto) |
| `name` | String | Nome do local |
| `category` | String | Categoria (restaurante, cachoeira, etc.) |
| `description` | String | Descrição |
| `createdAt` | DateTime | Data de criação (automática) |
| `experiences` | Experiences[] | Experiências vinculadas |

### Experiences (experiência)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Chave primária (auto) |
| `userName` | String | Nome de quem compartilhou |
| `userId` | Int? | FK para User (preenchido quando autenticado) |
| `rating` | Int | Avaliação de 0 a 5 |
| `placeId` | Int | FK para Place |
| `createdAt` | DateTime | Data de criação (automática) |

### User (usuário)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Chave primária (auto) |
| `accountType` | AccountType? | `TURISTA` ou `MORADOR` |
| `name` | String | Nome completo |
| `email` | String | Email único |
| `birthDate` | DateTime? | Data de nascimento |
| `phone` | String? | Telefone |
| `passwordHash` | String? | Hash bcrypt (null se login só Google) |
| `googleId` | String? | ID Google OAuth |
| `createdAt` | DateTime | Data de criação (automática) |

---

## Endpoints da API

Base URL: `http://localhost:3000`

### Health check

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Verifica se a API está online |
| `GET` | `/api-docs` | Documentação Swagger (UI interativa) |

### Autenticação (Auth)

Documentação arquitetural completa (bibliotecas, padrões Facade/Strategy, ADRs): [`docs/requisitos/RF01-backend/4.4.Autenticacao.md`](../docs/requisitos/RF01-backend/4.4.Autenticacao.md)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/register` | Não | Cadastro (nome, email, senha, etc.) |
| `POST` | `/auth/login` | Não | Login email/senha → JWT |
| `POST` | `/auth/google` | Não | Login Google (body: `{ "credential": "<id_token>" }`) |
| `GET` | `/auth/me` | Bearer JWT | Dados do usuário logado |

**Exemplo — cadastro:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"accountType\":\"TURISTA\",\"name\":\"Maria Silva\",\"email\":\"maria@test.com\",\"birthDate\":\"1995-03-15\",\"phone\":\"(62) 99999-9999\",\"password\":\"SenhaForte1\",\"confirmPassword\":\"SenhaForte1\"}"
```

**Exemplo — login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"maria@test.com\",\"password\":\"SenhaForte1\"}"
```

**Exemplo — usuário logado:**

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

Resposta de conta inexistente no login (`404`):

```json
{ "error": "Conta não encontrada", "code": "USER_NOT_FOUND" }
```

### Locais (Places)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/places` | Lista todos os locais |
| `POST` | `/places` | Cadastra um novo local |

**Exemplo — criar local (PowerShell):**

```powershell
$body = @{
    name = "Cachoeira dos Dragões"
    category = "cachoeira"
    description = "Linda cachoeira com trilha fácil"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/places" -Method POST -Body $body -ContentType "application/json"
```

**Exemplo — listar locais (PowerShell):**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/places" -Method GET
```

> Para testar contra o **Supabase**, use `npm run dev:prod` antes de rodar os comandos acima.

### Experiências (Experiences)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/places/:placeId/experiences` | Lista experiências de um local |
| `POST` | `/places/:placeId/experiences` | Cadastra experiência (**requer JWT**) |

**Exemplo — criar experiência autenticada, placeId = 1 (PowerShell):**

```powershell
$headers = @{ Authorization = "Bearer SEU_TOKEN_JWT" }
$body = @{ rating = 5 } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/places/1/experiences" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```

**Exemplo — listar experiências de um local (PowerShell):**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/places/1/experiences" -Method GET
```

---

## Frontend de teste

Pasta `frontend/` na raiz do repositório — interface mínima para validar login, cadastro, Google OAuth e rotas protegidas.

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse `http://localhost:5173`. Configure `VITE_GOOGLE_CLIENT_ID` com o mesmo Client ID do backend.

Variáveis adicionais no `.env` do backend:

```env
JWT_SECRET=sua-chave-secreta
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
CORS_ORIGIN=http://localhost:5173
```

Após alterar o schema, aplique a migration de autenticação:

```bash
npx prisma migrate deploy
```

---

## Como adicionar uma nova funcionalidade

Siga sempre o fluxo MVC. Exemplo: adicionar `GET /places/:id` (buscar um local por ID):

1. **`model/placeModel.ts`** — função que consulta o banco:
   ```typescript
   export async function findPlaceById(id: number) {
       return prisma.place.findUnique({ where: { id } });
   }
   ```

2. **`controllers/placeController.ts`** — handler HTTP:
   ```typescript
   export async function getPlace(req: Request, res: Response) { ... }
   ```

3. **`routes/placeRoutes.ts`** — registrar a rota:
   ```typescript
   router.get('/:id', placeController.getPlace);
   ```

4. Se alterar o banco, edite `prisma/schema.prisma` e rode:
   ```bash
   npx prisma migrate dev --name descricao_da_mudanca
   npx prisma generate
   ```

---

## Comandos úteis

### API e Prisma — desenvolvimento (Docker)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | API local → banco Docker (`.env`) |
| `npx prisma generate` | Gera o cliente Prisma em `generated/prisma/` |
| `npx prisma migrate dev` | Cria/aplica migration no Docker local |
| `npx prisma migrate deploy` | Aplica migrations no Docker local |
| `npx prisma studio` | Prisma Studio → banco Docker |

### API e Prisma — produção (Supabase)

| Comando | Descrição |
|---------|-----------|
| `npm run dev:prod` | API local → banco Supabase (`.env.prod`) |
| `npm run prisma:migrate:prod` | Aplica migrations no Supabase |
| `npm run prisma:studio:prod` | Prisma Studio → banco Supabase |
| `npm run prisma:generate:prod` | Gera Prisma Client com `.env.prod` |

### Docker (banco de dados)

| Comando | Descrição |
|---------|-----------|
| `docker ps` | Lista containers em execução |
| `docker start euamopiri-db` | Inicia o banco após reiniciar o PC |
| `docker stop euamopiri-db` | Para o banco |
| `docker logs euamopiri-db` | Exibe logs do PostgreSQL |
| `docker rm euamopiri-db` | Remove o container (após `docker stop`) |

---

## Problemas comuns

### Erro: `DATABASE_URL is not set`

O arquivo `.env` não existe ou não tem a variável `DATABASE_URL`. Copie `.env.example` para `.env` e preencha com as credenciais corretas a serem buscadas no canal interno do discord.

### Erro ao importar de `generated/prisma/...`

O Prisma Client ainda não foi gerado. Rode:

```bash
npx prisma generate
```

### Erro de conexão com o PostgreSQL

- Verifique se o Docker Desktop está aberto.
- Confirme que o container está rodando: `docker ps` (deve aparecer `euamopiri-db`).
- Se o container existir mas estiver parado: `docker start euamopiri-db`.
- Confira se a `DATABASE_URL` no `.env` é `postgres://postgres:postgres@localhost:5432/euamopiri`.
- Teste a conexão com `npx prisma studio`.

### Erro: porta 5432 já em uso

Outro PostgreSQL (local ou outro container) já está usando a porta 5432.

**Opção A** — parar o outro serviço e usar a porta padrão.

**Opção B** — mapear outra porta no Docker:

```bash
docker run --name euamopiri-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=euamopiri \
  -p 5433:5432 \
  -d postgres:16
```

E ajustar o `.env`:

```env
DATABASE_URL="postgres://postgres:postgres@localhost:5433/euamopiri"
```

### Erro: container `euamopiri-db` já existe

O container foi criado anteriormente na sua máquina. Use `docker start euamopiri-db` em vez de `docker run` novamente. Para recriar do zero: `docker stop euamopiri-db && docker rm euamopiri-db` e então rode o `docker run` outra vez.

### Tabelas não existem no banco

As migrations não foram aplicadas. Rode:

```bash
npx prisma migrate deploy
```

### Alterei o `schema.prisma` e o TypeScript quebrou

Após mudar o schema, sempre execute:

```bash
npx prisma migrate dev
npx prisma generate
```

---

## O que é versionado no Git

| Versionado | Não versionado |
|------------|----------------|
| `src/` (código-fonte) | `node_modules/` |
| `prisma/schema.prisma` | `.env`, `.env.prod` |
| `prisma/migrations/` | `generated/prisma/` |
| `.env.example` | Modelo para desenvolvimento (Docker) |
| `.env.prod.example` | Modelo para produção (Supabase, sem senhas) |
| `README.md` (este guia) | Dados dos bancos (local e Supabase) |
| | `dist/`, logs |

---

## Scripts disponíveis

```json
{
  "dev": "node --import tsx ./src/server.ts",
  "dev:prod": "dotenv -e .env.prod -o -- node --import tsx ./src/server.ts",
  "prisma:migrate:prod": "dotenv -e .env.prod -o -- prisma migrate deploy",
  "prisma:studio:prod": "dotenv -e .env.prod -o -- prisma studio",
  "prisma:generate:prod": "dotenv -e .env.prod -o -- prisma generate"
}
```

| Script | Ambiente |
|--------|----------|
| `npm run dev` | Desenvolvimento — Docker local |
| `npm run dev:prod` | Teste local apontando para Supabase |
| `npm run prisma:migrate:prod` | Atualiza tabelas no Supabase |

---

## Contato e documentação do projeto

Documentação geral da equipe: consulte o README na raiz do repositório e a Wiki/GitPages do projeto **Eu Amo Piri — Grupo 05**.
