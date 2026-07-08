from sqlalchemy.orm import Session, joinedload

from app.crud.utils import filtrar_por_mes
from app.models.enums import TipoTransacao
from app.models.transacao import Transacao
from app.schemas.transacao import TransacaoCreate, TransacaoUpdate


def get_transacao(db: Session, transacao_id: int, usuario_id: int) -> Transacao | None:
    return (
        db.query(Transacao)
        .options(joinedload(Transacao.categoria))
        .filter(Transacao.id == transacao_id, Transacao.usuario_id == usuario_id)
        .first()
    )


def listar_transacoes(
    db: Session,
    usuario_id: int,
    tipo: TipoTransacao | None = None,
    categoria_id: int | None = None,
    ano: int | None = None,
    mes: int | None = None,
) -> list[Transacao]:
    query = (
        db.query(Transacao)
        .options(joinedload(Transacao.categoria))
        .filter(Transacao.usuario_id == usuario_id)
    )
    if tipo is not None:
        query = query.filter(Transacao.tipo == tipo)
    if categoria_id is not None:
        query = query.filter(Transacao.categoria_id == categoria_id)
    query = filtrar_por_mes(query, Transacao.data, ano, mes)
    return query.order_by(Transacao.data.desc(), Transacao.id.desc()).all()


def criar_transacao(db: Session, usuario_id: int, dados: TransacaoCreate, tipo: TipoTransacao) -> Transacao:
    transacao = Transacao(
        tipo=tipo,
        descricao=dados.descricao,
        valor=dados.valor,
        data=dados.data,
        categoria_id=dados.categoria_id,
        usuario_id=usuario_id,
    )
    db.add(transacao)
    db.commit()
    db.refresh(transacao)
    return transacao


def atualizar_transacao(db: Session, transacao: Transacao, dados: TransacaoUpdate, tipo: TipoTransacao) -> Transacao:
    transacao.descricao = dados.descricao
    transacao.valor = dados.valor
    transacao.data = dados.data
    transacao.categoria_id = dados.categoria_id
    transacao.tipo = tipo
    db.commit()
    db.refresh(transacao)
    return transacao


def deletar_transacao(db: Session, transacao: Transacao) -> None:
    db.delete(transacao)
    db.commit()
