from fastapi import FastAPI

app = FastAPI(title="Sistema de Controle Financeiro API")


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
