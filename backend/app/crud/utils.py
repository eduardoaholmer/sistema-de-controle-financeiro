from calendar import monthrange
from datetime import date

from sqlalchemy import Date
from sqlalchemy.orm import Query
from sqlalchemy.sql.elements import ColumnElement


def filtrar_por_mes(query: Query, coluna_data: ColumnElement[Date], ano: int | None, mes: int | None) -> Query:
    if ano is None or mes is None:
        return query
    primeiro_dia = date(ano, mes, 1)
    ultimo_dia = date(ano, mes, monthrange(ano, mes)[1])
    return query.filter(coluna_data >= primeiro_dia, coluna_data <= ultimo_dia)
