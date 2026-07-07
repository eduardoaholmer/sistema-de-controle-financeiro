from fastapi import FastAPI

from app.api.routes import auth, categoria

app = FastAPI(title="Sistema de Controle Financeiro API")

app.include_router(auth.router)
app.include_router(categoria.router)


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
