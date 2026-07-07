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
- `.gitignore` cobrindo Python (`__pycache__`, `venv`), Node (`node_modules`, `build`), `.env`, arquivos de editor/SO e config local do Claude Code.
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
