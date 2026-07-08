from decimal import Decimal

from pydantic import BaseModel


class ResumoResponse(BaseModel):
    total_receitas: Decimal
    total_despesas: Decimal
    saldo: Decimal


class GastoPorCategoria(BaseModel):
    categoria: str
    total: Decimal
