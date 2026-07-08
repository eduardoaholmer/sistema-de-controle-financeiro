from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.crud.utils import filtrar_por_mes
from app.models.categoria import Categoria
from app.models.enums import TipoTransacao
from app.models.transacao import Transacao
from app.schemas.dashboard import GastoPorCategoria, ResumoResponse


def calcular_resumo(db: Session, usuario_id: int, ano: int | None, mes: int | None) -> ResumoResponse:
    query = db.query(Transacao.tipo, func.sum(Transacao.valor)).filter(Transacao.usuario_id == usuario_id)
    query = filtrar_por_mes(query, Transacao.data, ano, mes)
    totais = dict(query.group_by(Transacao.tipo).all())

    total_receitas = totais.get(TipoTransacao.RECEITA, Decimal("0"))
    total_despesas = totais.get(TipoTransacao.DESPESA, Decimal("0"))
    return ResumoResponse(
        total_receitas=total_receitas,
        total_despesas=total_despesas,
        saldo=total_receitas - total_despesas,
    )


def gastos_por_categoria(db: Session, usuario_id: int, ano: int | None, mes: int | None) -> list[GastoPorCategoria]:
    query = (
        db.query(Categoria.nome, func.sum(Transacao.valor))
        .join(Transacao, Transacao.categoria_id == Categoria.id)
        .filter(Transacao.usuario_id == usuario_id, Transacao.tipo == TipoTransacao.DESPESA)
    )
    query = filtrar_por_mes(query, Transacao.data, ano, mes)
    resultado = query.group_by(Categoria.nome).order_by(func.sum(Transacao.valor).desc()).all()
    return [GastoPorCategoria(categoria=nome, total=total) for nome, total in resultado]


def ultimas_movimentacoes(db: Session, usuario_id: int, limite: int = 10) -> list[Transacao]:
    return (
        db.query(Transacao)
        .options(joinedload(Transacao.categoria))
        .filter(Transacao.usuario_id == usuario_id)
        .order_by(Transacao.data.desc(), Transacao.id.desc())
        .limit(limite)
        .all()
    )
