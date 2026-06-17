# Frontend — Eu Amo Piri

Interface React (Vite) do projeto **Eu Amo Piri**.

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. Em dev, requisições para `/api` são proxyadas para `http://localhost:3000` (ver `vite.config.js`).

Em produção, configure `VITE_API_URL` com a URL pública da API.

## Camadas

```
pages/          → UI e formulários
context/        → Estado global (ex.: AuthContext)
presentation/   → Componentes Atomic Design (atoms, molecules, organisms)
api/
  client.js     → Axios + interceptors (HTTP)
  auth/         → Módulo de autenticação (SRP)
infra/
  adaptor/      → Adaptadores de locais e relatos (places, experiences)
```

## Módulo de autenticação (SRP)

Em `src/api/auth/`:

| Arquivo | Padrão GoF | Responsabilidade |
|---------|------------|------------------|
| `authApi.js` | Gateway HTTP | Chamadas REST a `/auth/*` |
| `authMapper.js` | **Adapter** | Mapeamento frontend ↔ backend |
| `authSessionStorage.js` | — | Token e usuário no `localStorage` |
| `authFacade.js` | **Facade** | Orquestra os módulos acima |

`AuthContext` importa apenas `api/auth/authFacade`.

## Testes

```bash
npm run test:run
```
