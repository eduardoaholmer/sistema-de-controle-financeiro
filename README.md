# Sistema de Controle Financeiro

Aplicação full stack para controle de receitas e despesas pessoais, com autenticação, dashboard e gráficos.

## Stack

- **Frontend:** React (Vite) + React Router + Recharts
- **Backend:** Python + FastAPI + SQLAlchemy + Alembic
- **Banco de dados:** PostgreSQL
- **Infra:** Docker + Docker Compose

## Funcionalidades

- Autenticação (cadastro, login, JWT, proteção de rotas)
- CRUD de Categorias, Receitas e Despesas (unificadas em "Transações")
- Dashboard com totais, saldo e últimas movimentações
- Filtro por mês
- Gráficos (Receitas x Despesas, Gastos por categoria)

## Como rodar

1. Copie o arquivo de variáveis de ambiente e gere uma `SECRET_KEY`:

   ```bash
   cp .env.example .env
   python -c "import secrets; print(secrets.token_hex(32))"
   # cole o resultado em SECRET_KEY no .env
   ```

2. Suba os containers:

   ```bash
   docker compose up --build
   ```

3. Acesse:
   - Frontend: http://localhost:5173
   - API (Swagger): http://localhost:8000/docs

4. Aplique as migrations do banco (primeira vez):

   ```bash
   docker compose run --rm backend alembic upgrade head
   ```

## Estrutura do projeto

```
.
├── backend/    # API em FastAPI (app/, alembic/)
├── frontend/   # Aplicação em React (src/)
├── docs/       # Documentação de progresso e modelagem do banco
└── README.md
```

Documentação detalhada de cada milestone em [`docs/PROGRESSO.md`](docs/PROGRESSO.md) e a modelagem do banco em [`docs/database/`](docs/database/).

## Status

✅ Funcional de ponta a ponta — auth, CRUDs, dashboard e gráficos implementados e validados.
