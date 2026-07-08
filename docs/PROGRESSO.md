# Progresso do Projeto

Log incremental do que foi construído, por milestone/tarefa. Serve como referência rápida e material de apoio para explicar o projeto em entrevistas.

---

## Milestone 1 — Estrutura do projeto, Docker, Git

### 1.1 — Estrutura de pastas do monorepo
- Criadas as pastas `backend/` e `frontend/` (com `.gitkeep` temporário, até receberem código real).
- Criado `README.md` na raiz com descrição do projeto e stack.
- Decisão: monorepo (backend + frontend no mesmo repositório Git), por ser projeto pessoal de um único dev, com deploy único e histórico unificado — bom para apresentar em entrevista.

### 1.2 — Git + .gitignore
- `git init` na raiz do projeto.
- `.gitignore` cobrindo Python (`__pycache__`, `venv`), Node (`node_modules`, `build`), `.env`, arquivos de editor/SO e configs locais da máquina.
- Commit inicial: `chore: initialize project structure and git config`.

### 1.3 — Husky + Commitlint
- `package.json` na raiz (só para gerenciar tooling de Git, não é o backend nem o frontend).
- Instalado `husky`, `@commitlint/cli`, `@commitlint/config-conventional`.
- `commitlint.config.js` estendendo a config padrão `@commitlint/config-conventional` (regras do Conventional Commits).
- Hook `.husky/commit-msg` chamando `commitlint --edit` a cada commit — mensagens fora do padrão são rejeitadas automaticamente.
- Script `"prepare": "husky"` no `package.json` garante que os hooks sejam reinstalados por qualquer pessoa que clonar o repo e rodar `npm install`.
- Testado: mensagem inválida foi rejeitada pelo commitlint; commit real seguindo o padrão passou.
- Commit: `chore: add husky and commitlint for conventional commits`.

### 1.4 — Dockerfile do backend
- `backend/main.py`: FastAPI mínimo com endpoint `GET /` de health check.
- `backend/requirements.txt`: `fastapi` + `uvicorn[standard]`.
- `backend/Dockerfile`: baseado em `python:3.12-slim`, copia `requirements.txt` antes do código (cache de camadas do Docker), roda `uvicorn --reload`.
- `backend/.dockerignore`: evita copiar `__pycache__`/`venv` para dentro da imagem.

### 1.5 — Dockerfile do frontend
- Scaffold com **Vite** (`npm create vite@latest -- --template react`), não Create React App (descontinuado).
- `frontend/Dockerfile`: baseado em `node:22-slim`, `npm install`, roda `vite --host 0.0.0.0` (necessário pra expor a porta de dentro do container).
- `frontend/.dockerignore`: evita copiar `node_modules`/`dist` locais para dentro da imagem.
- Removido `frontend/README.md` gerado pelo Vite (redundante com o README raiz).

### 1.6 — docker-compose.yml
- Serviços: `db` (postgres:16-alpine), `backend`, `frontend`.
- Credenciais do banco via `.env` (não versionado) + `.env.example` (versionado, template).
- Volumes bind-mount em `backend`/`frontend` para hot-reload; volume anônimo em `frontend/node_modules` para não ser sobrescrito pelo host.
- Volume nomeado `postgres_data` para persistir dados do banco entre restarts.
### 1.7 — Validação com Docker
- Docker Desktop instalado via `winget` (backend WSL2, distro `Ubuntu` já existia).
- Troubleshooting: na primeira tentativa o engine não subia (`Docker Desktop is unable to start`) — a distro `docker-desktop` não tinha sido registrada no WSL. Resolvido com `wsl --shutdown` + reabertura do Docker Desktop, que recriou a distro corretamente.
- `docker compose up --build -d`: as 3 imagens buildaram e os 3 containers (`db`, `backend`, `frontend`) subiram com sucesso.
- Testado: `GET http://localhost:8000/` → `{"status":"ok"}`; `http://localhost:8000/docs` (Swagger) → 200; `http://localhost:5173/` (Vite/React) → 200.

---

## Milestone 2 — Banco de dados

### 2.1 a 2.4 — Modelagem, ER, schema SQL
- Decisão de design: tabela única `transacoes` com coluna `tipo` (ENUM `RECEITA`/`DESPESA`), em vez de tabelas separadas `receitas`/`despesas` — evita duplicação de schema e de CRUD, simplifica agregações do dashboard.
- 3 tabelas: `usuarios`, `categorias` (com `tipo` e `usuario_id`), `transacoes` (com `tipo`, `categoria_id`, `usuario_id`).
- `docs/database/modelagem.md`: diagrama ER (Mermaid) + tabela de decisões de design.
- `docs/database/schema.sql`: DDL de referência. Vai ser recriado via SQLAlchemy + Alembic no Milestone 3; este arquivo fica como documentação/validação manual.
- Constraints aplicadas: `valor NUMERIC(12,2) CHECK (valor > 0)`, `UNIQUE (usuario_id, nome, tipo)` em categorias, `ON DELETE RESTRICT` em `transacoes.categoria_id`, `ON DELETE CASCADE` em `usuario_id`. Índices em `(usuario_id, data)` e `categoria_id`.

### 2.5 — Validação no Postgres real
- Schema aplicado no container `db` via `psql -f`.
- Testado com dados reais: constraint UNIQUE, CHECK e FK RESTRICT rejeitaram inserts/deletes inválidos como esperado.
- Dados de teste limpos com `TRUNCATE ... RESTART IDENTITY CASCADE` para o banco começar zerado no Milestone 3.

---

## Milestone 3 — Backend base (FastAPI + SQLAlchemy + Alembic)

- Backend reorganizado em pacote `app/` (`core/`, `db/`, `models/`), separando configuração, conexão e entidades. `main.py` movido para `app/main.py`.
- `app/core/config.py`: `Settings` (pydantic-settings) lê `DATABASE_URL` do ambiente — falha rápido na inicialização se a variável não existir.
- `app/db/session.py` (engine + `SessionLocal`) e `app/db/base.py` (`Base` declarativa).
- Models SQLAlchemy (`Usuario`, `Categoria`, `Transacao`) mapeando 1:1 o schema do Milestone 2, incluindo `relationship`, `ForeignKey` com `ondelete`, `CheckConstraint`, `UniqueConstraint` e os dois índices compostos.
- `docker-compose.yml`: adicionado `DATABASE_URL` ao serviço `backend` e `healthcheck` no `db` (`pg_isready`) com `depends_on: condition: service_healthy` — o backend só sobe depois que o Postgres aceita conexões de fato.
- Alembic inicializado (`alembic init`), `env.py` configurado para usar `settings.database_url` e `Base.metadata` (autogenerate).
- 2 migrations: criação das 3 tabelas, e depois os índices que faltaram na primeira rodada (correção feita como migration nova, não editando a já aplicada — mesmo princípio de não reescrever commits publicados).
- Tabelas antigas do Milestone 2 (criadas via `schema.sql` manual) foram derrubadas — a partir de agora, as migrations do Alembic são a fonte de verdade do schema.
- Validado: `docker compose run --rm backend alembic upgrade head` aplica limpo; `\d transacoes` no Postgres bate exatamente com os models; backend reiniciado e `GET /` segue respondendo `{"status":"ok"}`.

---

## Milestone 4 — Autenticação

- `app/schemas/`: `UsuarioCreate`/`UsuarioResponse` (Pydantic, contrato da API — separado dos models do banco) e `Token`.
- `app/core/security.py`: hash de senha com `bcrypt` (salt automático) e JWT com `pyjwt` (`criar_access_token`/`decodificar_access_token`, `sub` = id do usuário, expiração configurável).
- `SECRET_KEY` adicionada ao `.env`/`.env.example` e passada ao container `backend` via `docker-compose.yml`.
- `app/crud/usuario.py`: acesso a dados isolado das rotas (`get_usuario_by_email`, `get_usuario_by_id`, `criar_usuario`).
- `app/api/deps.py`: `get_db` (sessão por requisição, padrão `yield`) e `get_current_usuario` (decodifica o JWT do header `Authorization`, busca o usuário, 401 se inválido) — dependência reutilizável pra proteger qualquer rota futura.
- `app/api/routes/auth.py`: `POST /auth/register` (409 se e-mail duplicado), `POST /auth/login` (`OAuth2PasswordRequestForm`, 401 se credenciais inválidas), `GET /auth/me` (rota protegida de teste).
- Logout: decisão consciente de **não** ter endpoint no backend — JWT é stateless; "logout" é o frontend descartar o token guardado (implementação real no Milestone 8).
- Validado via `curl`: registro, e-mail duplicado (409), senha errada (401), rota protegida sem token (401), login válido, rota protegida com token válido, token adulterado (401) — os 7 casos se comportaram como esperado.
- Usuário de teste (`eduardo@teste.com`) mantido no banco propositalmente, para uso nos próximos milestones (Categorias/Receitas/Despesas dependem de um `usuario_id` válido).

---

## Milestone 5 — CRUD de Categorias

- `app/schemas/categoria.py`: `CategoriaCreate`/`CategoriaUpdate`/`CategoriaResponse`. Nenhum deles aceita `usuario_id` do cliente — sempre vem do token. `CategoriaUpdate` só permite editar `nome`: `tipo` é imutável após a criação (evita inconsistência com transações já vinculadas).
- `app/crud/categoria.py`: toda consulta filtra por `id` **e** `usuario_id` juntos (não só depois de buscar) — categoria de outro usuário nunca é encontrada, retorna 404 em vez de vazar existência via 403.
- `app/api/routes/categoria.py`: `POST/GET/GET-by-id/PUT/DELETE /categorias`, todas protegidas com `Depends(get_current_usuario)`. `GET /categorias?tipo=DESPESA` filtra por tipo (uso futuro: dropdown do frontend). `DELETE` captura `IntegrityError` do `ON DELETE RESTRICT` e devolve `409` com mensagem amigável em vez de erro 500 cru.
- Validado via `curl` com o usuário de teste: criação (com acento — via arquivo, `curl -d` inline tem problema de encoding no Git Bash com caracteres UTF-8), duplicidade (409), listagem com e sem filtro, sem token (401), atualização, não encontrada (404), exclusão bem-sucedida (204), e exclusão bloqueada por transação vinculada (409) — inserida manualmente via SQL só para esse teste, já que o CRUD de Transações ainda não existe.

---

## Milestone 6 — CRUD de Transações (Receitas + Despesas)

Os Milestones 6 e 7 do roadmap original (CRUD de Receitas e CRUD de Despesas separados) foram unificados num único CRUD de `Transações`, refletindo a decisão de modelagem do Milestone 2 (tabela única com discriminador `tipo`).

- `app/schemas/transacao.py`: `TransacaoCreate`/`Update` **não têm campo `tipo`** — ele é derivado automaticamente do `tipo` da categoria escolhida (`categoria_id`), eliminando por construção a possibilidade de uma transação DESPESA numa categoria RECEITA. `TransacaoResponse` inclui a categoria aninhada (`CategoriaResumo`).
- `app/crud/transacao.py` + `app/crud/utils.py` (`filtrar_por_mes`, reaproveitado depois no dashboard): filtro por mês usa **intervalo de datas** (`data >= primeiro_dia AND data <= ultimo_dia`), não `EXTRACT()`, para aproveitar o índice composto `(usuario_id, data)` criado no Milestone 3.
- `app/api/routes/transacao.py`: mesmo padrão de escopo por usuário e tratamento de erros dos Milestones 4/5. Categoria inválida ou de outro usuário → `400`.
- Validado via `curl`: criação de RECEITA e DESPESA com `tipo` corretamente derivado, categoria inválida (400), valor negativo rejeitado pelo Pydantic (422), atualização, exclusão (204 → 404 depois).

## Milestone 9 e 11 — Dashboard, Filtros e Gráficos (backend)

- `app/schemas/dashboard.py` + `app/crud/dashboard.py`: três consultas agregadas —
  - `calcular_resumo`: soma de `valor` agrupada por `tipo` (`SUM ... GROUP BY tipo`), retorna receitas/despesas/saldo.
  - `gastos_por_categoria`: `JOIN transacoes/categorias`, soma por categoria, só DESPESA, ordenado do maior gasto pro menor.
  - `ultimas_movimentacoes`: últimas N transações com `joinedload(categoria)` (evita N+1 query ao serializar a categoria de cada transação).
- Todas aceitam `ano`/`mes` opcionais (mesmo filtro por mês reaproveitado de Transações) — sem eles, retornam o total geral.
- `app/api/routes/dashboard.py`: `GET /dashboard/resumo`, `GET /dashboard/gastos-por-categoria`, `GET /dashboard/ultimas-movimentacoes`.
- Validado via `curl`: resumo geral, resumo filtrado por mês com dados, resumo filtrado por mês sem dados (retorna zeros, não erro), gastos por categoria, últimas movimentações.

---

## Milestone 8, 9, 10, 11 — Frontend (React)

Frontend construído em cima da API já validada. Duas dependências adicionadas além do React puro (justificadas — funcionalidades exigidas pelo escopo que não dá pra fazer de forma simples e limpa sem elas):
- `react-router-dom`: roteamento SPA e proteção de rotas.
- `recharts`: gráficos (Receitas x Despesas, Gastos por categoria).

**Estrutura:**
- `src/api/`: `client.js` (wrapper sobre `fetch`, injeta `Authorization: Bearer` automaticamente, trata `401` global redirecionando pro login, erros viram `Error` com a mensagem do backend) + um módulo por recurso (`auth.js`, `categorias.js`, `transacoes.js`, `dashboard.js`).
- `src/context/AuthContext.jsx`: estado global do usuário logado. Token persistido em `localStorage`; ao carregar a página, se houver token, valida contra `GET /auth/me` antes de liberar rotas protegidas.
- `src/components/ProtectedRoute.jsx`: redireciona pro `/login` se não houver usuário autenticado — implementação real da "proteção de rotas".
- `src/components/Layout.jsx`: navegação entre Dashboard/Categorias/Transações + botão **Sair** (logout real: `localStorage.removeItem("token")`, sem chamada ao backend — JWT é stateless, como decidido no Milestone 4).
- `src/pages/`: `LoginPage`, `RegisterPage`, `CategoriasPage` (CRUD completo), `TransacoesPage` (CRUD completo + filtro por mês via `<input type="month">`), `DashboardPage` (cartões de totais/saldo, gráfico de barras Receitas x Despesas, gráfico de pizza de gastos por categoria, tabela de últimas movimentações — tudo filtrável por mês).
- CORS habilitado no backend (`app/main.py`) para a origem `http://localhost:5173`.
- `VITE_API_URL` passado via `docker-compose.yml` — aponta pra `http://localhost:8000` porque quem faz as requisições é o **navegador** (fora da rede Docker), não outro container, então não pode usar o nome de serviço `backend`.

**Validação:** como não há acesso a navegador interativo neste ambiente, a validação foi feita com um script Playwright headless (`chromium.launch`) dirigindo o fluxo completo: cadastro → redirecionamento pro login → login → criação de categoria RECEITA e DESPESA → criação de transação → volta ao dashboard conferindo totais e gráficos. Zero erros de console em todo o fluxo. Screenshots conferidos visualmente em cada etapa.

**Gotcha de Docker encontrado e resolvido:** depois de instalar `react-router-dom`/`recharts` e reconstruir a imagem, o Vite continuava reclamando "Failed to resolve import" — o volume anônimo `/app/node_modules` (criado no Milestone 1) não é atualizado automaticamente quando a imagem é reconstruída, só na primeira criação do volume. Resolvido com `docker compose up --build --force-recreate -V frontend` (a flag `-V` força recriar volumes anônimos).
