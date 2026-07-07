from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import TipoTransacao


class CategoriaCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=80)
    tipo: TipoTransacao


class CategoriaUpdate(BaseModel):
    nome: str = Field(min_length=2, max_length=80)


class CategoriaResponse(BaseModel):
    id: int
    nome: str
    tipo: TipoTransacao
    created_at: datetime

    model_config = {"from_attributes": True}
