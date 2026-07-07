from sqlalchemy.orm import Session

from app.core.security import hash_senha
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate


def get_usuario_by_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()


def get_usuario_by_id(db: Session, usuario_id: int) -> Usuario | None:
    return db.get(Usuario, usuario_id)


def criar_usuario(db: Session, dados: UsuarioCreate) -> Usuario:
    usuario = Usuario(nome=dados.nome, email=dados.email, senha_hash=hash_senha(dados.senha))
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario
