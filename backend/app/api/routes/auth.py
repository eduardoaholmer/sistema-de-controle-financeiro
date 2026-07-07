from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_usuario, get_db
from app.core.security import criar_access_token, verificar_senha
from app.crud.usuario import criar_usuario, get_usuario_by_email
from app.models.usuario import Usuario
from app.schemas.token import Token
from app.schemas.usuario import UsuarioCreate, UsuarioResponse

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar(dados: UsuarioCreate, db: Session = Depends(get_db)) -> Usuario:
    if get_usuario_by_email(db, dados.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado")
    return criar_usuario(db, dados)


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Token:
    usuario = get_usuario_by_email(db, form.username)
    if usuario is None or not verificar_senha(form.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = criar_access_token(usuario.id)
    return Token(access_token=access_token)


@router.get("/me", response_model=UsuarioResponse)
def me(usuario_atual: Usuario = Depends(get_current_usuario)) -> Usuario:
    return usuario_atual
