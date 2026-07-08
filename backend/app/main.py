from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, categoria, dashboard, transacao

app = FastAPI(title="Sistema de Controle Financeiro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categoria.router)
app.include_router(transacao.router)
app.include_router(dashboard.router)


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
