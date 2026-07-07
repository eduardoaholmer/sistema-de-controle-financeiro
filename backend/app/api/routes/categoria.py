from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_usuario, get_db
from app.crud.categoria import (
    atualizar_categoria,
    criar_categoria,
    deletar_categoria,
    existe_categoria_com_nome,
    get_categoria,
    listar_categorias,
)
from app.models.enums import TipoTransacao
from app.models.usuario import Usuario
from app.schemas.categoria import CategoriaCreate, CategoriaResponse, CategoriaUpdate

router = APIRouter(prefix="/categorias", tags=["Categorias"])


def _obter_categoria_ou_404(db: Session, categoria_id: int, usuario: Usuario):
    categoria = get_categoria(db, categoria_id, usuario.id)
    if categoria is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria não encontrada")
    return categoria


@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def criar(
    dados: CategoriaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    if existe_categoria_com_nome(db, usuario.id, dados.nome, dados.tipo):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Categoria já cadastrada")
    return criar_categoria(db, usuario.id, dados)


@router.get("/", response_model=list[CategoriaResponse])
def listar(
    tipo: TipoTransacao | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return listar_categorias(db, usuario.id, tipo)


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def obter(
    categoria_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return _obter_categoria_ou_404(db, categoria_id, usuario)


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def atualizar(
    categoria_id: int,
    dados: CategoriaUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    categoria = _obter_categoria_ou_404(db, categoria_id, usuario)
    if existe_categoria_com_nome(db, usuario.id, dados.nome, categoria.tipo) and dados.nome != categoria.nome:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Categoria já cadastrada")
    return atualizar_categoria(db, categoria, dados)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(
    categoria_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    categoria = _obter_categoria_ou_404(db, categoria_id, usuario)
    try:
        deletar_categoria(db, categoria)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não é possível excluir uma categoria com transações vinculadas",
        )
