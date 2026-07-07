import enum


class TipoTransacao(str, enum.Enum):
    RECEITA = "RECEITA"
    DESPESA = "DESPESA"
