from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TipoTransacao


class Categoria(Base):
    __tablename__ = "categorias"
    __table_args__ = (UniqueConstraint("usuario_id", "nome", "tipo", name="uq_categoria_usuario_nome_tipo"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(80), nullable=False)
    tipo: Mapped[TipoTransacao] = mapped_column(nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuario: Mapped["Usuario"] = relationship(back_populates="categorias")
    transacoes: Mapped[list["Transacao"]] = relationship(back_populates="categoria")
