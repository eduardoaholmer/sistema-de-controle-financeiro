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
- **Pendente:** validar `docker compose up` — Docker não está disponível neste ambiente de execução, precisa ser testado localmente pelo usuário (tarefa 1.7).
