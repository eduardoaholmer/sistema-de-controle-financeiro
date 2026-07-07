-- Schema de referência do Sistema de Controle Financeiro.
-- Ver docs/database/modelagem.md para o diagrama ER e as decisões de design.

CREATE TYPE tipo_transacao AS ENUM ('RECEITA', 'DESPESA');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    tipo tipo_transacao NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, nome, tipo)
);

CREATE TABLE transacoes (
    id SERIAL PRIMARY KEY,
    tipo tipo_transacao NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
    data DATE NOT NULL,
    categoria_id INTEGER NOT NULL REFERENCES categorias (id) ON DELETE RESTRICT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transacoes_usuario_data ON transacoes (usuario_id, data);
CREATE INDEX idx_transacoes_categoria ON transacoes (categoria_id);
