from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.models.enums import TipoTransacao
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate


def get_categoria(db: Session, categoria_id: int, usuario_id: int) -> Categoria | None:
    return (
        db.query(Categoria)
        .filter(Categoria.id == categoria_id, Categoria.usuario_id == usuario_id)
        .first()
    )


def listar_categorias(db: Session, usuario_id: int, tipo: TipoTransacao | None = None) -> list[Categoria]:
    query = db.query(Categoria).filter(Categoria.usuario_id == usuario_id)
    if tipo is not None:
        query = query.filter(Categoria.tipo == tipo)
    return query.order_by(Categoria.nome).all()


def existe_categoria_com_nome(db: Session, usuario_id: int, nome: str, tipo: TipoTransacao) -> bool:
    return (
        db.query(Categoria)
        .filter(Categoria.usuario_id == usuario_id, Categoria.nome == nome, Categoria.tipo == tipo)
        .first()
        is not None
    )


def criar_categoria(db: Session, usuario_id: int, dados: CategoriaCreate) -> Categoria:
    categoria = Categoria(nome=dados.nome, tipo=dados.tipo, usuario_id=usuario_id)
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


def atualizar_categoria(db: Session, categoria: Categoria, dados: CategoriaUpdate) -> Categoria:
    categoria.nome = dados.nome
    db.commit()
    db.refresh(categoria)
    return categoria


def deletar_categoria(db: Session, categoria: Categoria) -> None:
    db.delete(categoria)
    db.commit()
