from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_usuario, get_db
from app.crud.dashboard import calcular_resumo, gastos_por_categoria, ultimas_movimentacoes
from app.models.usuario import Usuario
from app.schemas.dashboard import GastoPorCategoria, ResumoResponse
from app.schemas.transacao import TransacaoResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/resumo", response_model=ResumoResponse)
def resumo(
    ano: int | None = None,
    mes: int | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return calcular_resumo(db, usuario.id, ano, mes)


@router.get("/gastos-por-categoria", response_model=list[GastoPorCategoria])
def gastos_categoria(
    ano: int | None = None,
    mes: int | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return gastos_por_categoria(db, usuario.id, ano, mes)


@router.get("/ultimas-movimentacoes", response_model=list[TransacaoResponse])
def ultimas(
    limite: int = 10,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return ultimas_movimentacoes(db, usuario.id, limite)
