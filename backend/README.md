# Backend — Eu Amo Piri

API REST do projeto **Eu Amo Piri**, desenvolvida para compartilhar experiências de quem visitou Pirenópolis (pousadas, restaurantes, cachoeiras).

Este documento explica tudo o que outro desenvolvedor precisa saber para clonar o repositório, configurar o ambiente e começar a contribuir.

---

## Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **Node.js** | Runtime JavaScript |
| **TypeScript** | Tipagem estática |
| **Express 5** | Servidor HTTP e rotas |
| **Prisma 7** | ORM e migrations do banco |
| **PostgreSQL** | Banco de dados relacional |
| **tsx** | Executa TypeScript em desenvolvimento |

---

## Pré-requisitos

Antes de começar, instale na sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [PostgreSQL](https://www.postgresql.org/) rodando localmente ou em um serviço na nuvem
- Git

---

## Primeiros passos (setup completo)

### 1. Clonar o repositório e entrar na pasta do backend

```bash
git clone <url-do-repositorio>
cd backend
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com os dados do seu banco:

```bash
cp .env.example .env
```

Edite o `.env` com a connection string do PostgreSQL:

```env
DATABASE_URL="postgres://usuario:senha@localhost:5432/euamopiri"
PORT=3000
```

> **Importante:** o arquivo `.env` **não é versionado** no Git (contém senhas e segredos). Cada desenvolvedor cria o seu localmente a partir do `.env.example`. Credenciais serão compartilhadas individualmente para o grupo

### 4. Gerar o Prisma Client

A pasta `generated/prisma/` **não está no Git** de propósito. Ela é recriada automaticamente a partir do schema.

```bash
npx prisma generate
```

Isso gera o cliente em `backend/generated/prisma/`, que é usado pelo código em `src/config/prisma.ts`, `src/model/` e `src/views/`.

> **Por que não versionar o `generated/`?**
> O conteúdo é gerado automaticamente pelo Prisma a partir de `prisma/schema.prisma`. Versionar essa pasta causaria conflitos desnecessários entre desenvolvedores. O fluxo correto é: clonar → `npm install` → `npx prisma generate`.

### 5. Aplicar as migrations no banco

As migrations (em `prisma/migrations/`) **são versionadas** e criam as tabelas no PostgreSQL:

```bash
npx prisma migrate deploy
```

Em desenvolvimento, se precisar sincronizar um banco novo:

```bash
npx prisma migrate dev
```

### 6. Subir o servidor

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
[ ] PostgreSQL rodando
[ ] git clone + cd backend
[ ] npm install
[ ] cp .env.example .env  (e preencher DATABASE_URL)
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
│   ├── schema.prisma          # definição dos models (Place, Experiences)
│   └── migrations/            # histórico de alterações do banco (versionado)
├── generated/prisma/          # cliente Prisma gerado (NÃO versionado — rode prisma generate)
├── src/
│   ├── config/
│   │   └── prisma.ts          # instância única do PrismaClient
│   ├── model/
│   │   ├── placeModel.ts      # operações de banco: locais
│   │   └── experienceModel.ts # operações de banco: experiências
│   ├── views/
│   │   ├── placeView.ts       # formata JSON de locais
│   │   └── experienceView.ts  # formata JSON de experiências
│   ├── controllers/
│   │   ├── placeController.ts
│   │   └── experienceController.ts
│   ├── routes/
│   │   ├── placeRoutes.ts
│   │   └── experienceRoutes.ts
│   └── server.ts              # ponto de entrada (bootstrap)
├── .env.example               # modelo de variáveis de ambiente
├── .env                       # suas credenciais locais (não versionado)
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
| `rating` | Int | Avaliação de 0 a 5 |
| `placeId` | Int | FK para Place |
| `createdAt` | DateTime | Data de criação (automática) |

---

## Endpoints da API

Base URL: `http://localhost:3000`

### Health check

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Verifica se a API está online |

### Locais (Places)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/places` | Lista todos os locais |
| `POST` | `/places` | Cadastra um novo local |

**Exemplo — criar local:**

```bash
curl -X POST http://localhost:3000/places \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Cachoeira dos Dragões\", \"category\": \"cachoeira\", \"description\": \"Linda cachoeira com trilha fácil\"}"
```

**Exemplo — listar locais:**

```bash
curl http://localhost:3000/places
```

### Experiências (Experiences)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/places/:placeId/experiences` | Lista experiências de um local |
| `POST` | `/places/:placeId/experiences` | Cadastra experiência em um local |

**Exemplo — criar experiência (placeId = 1):**

```bash
curl -X POST http://localhost:3000/places/1/experiences \
  -H "Content-Type: application/json" \
  -d "{\"userName\": \"Maria\", \"rating\": 5}"
```

**Exemplo — listar experiências de um local:**

```bash
curl http://localhost:3000/places/1/experiences
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

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento |
| `npx prisma generate` | Gera o cliente Prisma em `generated/prisma/` |
| `npx prisma migrate dev` | Cria/aplica migration em desenvolvimento |
| `npx prisma migrate deploy` | Aplica migrations em produção/CI |
| `npx prisma studio` | Interface visual para ver/editar dados do banco |
| `npx prisma db pull` | Atualiza o schema a partir de um banco existente |

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

- Verifique se o PostgreSQL está rodando.
- Confira usuário, senha, porta e nome do banco na `DATABASE_URL`.
- Teste a conexão com `npx prisma studio`.

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
| `prisma/schema.prisma` | `.env` |
| `prisma/migrations/` | `generated/prisma/` |
| `.env.example` | `dist/`, logs |

---

## Scripts disponíveis

```json
{
  "dev": "node --import tsx ./src/server.ts"
}
```

Por enquanto só existe o script `dev`. Para produção, será necessário adicionar um script de build/start (ex.: compilar com `tsc` ou usar `tsx` diretamente).

---

## Contato e documentação do projeto

Documentação geral da equipe: consulte o README na raiz do repositório e a Wiki/GitPages do projeto **Eu Amo Piri — Grupo 05**.
