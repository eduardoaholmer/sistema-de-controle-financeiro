from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.enums import TipoTransacao


class CategoriaResumo(BaseModel):
    id: int
    nome: str
    tipo: TipoTransacao

    model_config = {"from_attributes": True}


class TransacaoCreate(BaseModel):
    descricao: str = Field(min_length=2, max_length=255)
    valor: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    data: date
    categoria_id: int


class TransacaoUpdate(TransacaoCreate):
    pass


class TransacaoResponse(BaseModel):
    id: int
    tipo: TipoTransacao
    descricao: str
    valor: Decimal
    data: date
    categoria: CategoriaResumo
    created_at: datetime

    model_config = {"from_attributes": True}
