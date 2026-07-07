from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=72)


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}
