from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_usuario, get_db
from app.crud.categoria import get_categoria
from app.crud.transacao import (
    atualizar_transacao,
    criar_transacao,
    deletar_transacao,
    get_transacao,
    listar_transacoes,
)
from app.models.enums import TipoTransacao
from app.models.usuario import Usuario
from app.schemas.transacao import TransacaoCreate, TransacaoResponse, TransacaoUpdate

router = APIRouter(prefix="/transacoes", tags=["Transações"])


def _categoria_do_usuario_ou_400(db: Session, categoria_id: int, usuario: Usuario):
    categoria = get_categoria(db, categoria_id, usuario.id)
    if categoria is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Categoria inválida")
    return categoria


def _obter_transacao_ou_404(db: Session, transacao_id: int, usuario: Usuario):
    transacao = get_transacao(db, transacao_id, usuario.id)
    if transacao is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada")
    return transacao


@router.post("/", response_model=TransacaoResponse, status_code=status.HTTP_201_CREATED)
def criar(
    dados: TransacaoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    categoria = _categoria_do_usuario_ou_400(db, dados.categoria_id, usuario)
    return criar_transacao(db, usuario.id, dados, categoria.tipo)


@router.get("/", response_model=list[TransacaoResponse])
def listar(
    tipo: TipoTransacao | None = None,
    categoria_id: int | None = None,
    ano: int | None = None,
    mes: int | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return listar_transacoes(db, usuario.id, tipo, categoria_id, ano, mes)


@router.get("/{transacao_id}", response_model=TransacaoResponse)
def obter(
    transacao_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return _obter_transacao_ou_404(db, transacao_id, usuario)


@router.put("/{transacao_id}", response_model=TransacaoResponse)
def atualizar(
    transacao_id: int,
    dados: TransacaoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    transacao = _obter_transacao_ou_404(db, transacao_id, usuario)
    categoria = _categoria_do_usuario_ou_400(db, dados.categoria_id, usuario)
    return atualizar_transacao(db, transacao, dados, categoria.tipo)


@router.delete("/{transacao_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(
    transacao_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    transacao = _obter_transacao_ou_404(db, transacao_id, usuario)
    deletar_transacao(db, transacao)
