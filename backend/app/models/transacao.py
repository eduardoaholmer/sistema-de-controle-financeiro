from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TipoTransacao


class Transacao(Base):
    __tablename__ = "transacoes"
    __table_args__ = (
        CheckConstraint("valor > 0", name="ck_transacao_valor_positivo"),
        Index("idx_transacoes_usuario_data", "usuario_id", "data"),
        Index("idx_transacoes_categoria", "categoria_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    tipo: Mapped[TipoTransacao] = mapped_column(nullable=False)
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)
    valor: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    data: Mapped[date] = mapped_column(Date, nullable=False)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id", ondelete="RESTRICT"), nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    categoria: Mapped["Categoria"] = relationship(back_populates="transacoes")
    usuario: Mapped["Usuario"] = relationship(back_populates="transacoes")
