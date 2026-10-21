-- =========================================================================
-- SISTEMA DE MOEDA ESTUDANTIL - SCRIPT DDL (MODELO ER - SPRINT 2)
-- Banco de Dados: PostgreSQL
-- Estratégia de Herança: JOINED (1:1 com Diagrama de Classes da Sprint 1)
-- =========================================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    login VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(31) NOT NULL
);

CREATE TABLE IF NOT EXISTS instituicoes_ensino (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS enderecos (
    id BIGSERIAL PRIMARY KEY,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS alunos (
    usuario_id BIGINT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    rg VARCHAR(20) NOT NULL,
    curso VARCHAR(120) NOT NULL,
    saldo_moedas INTEGER NOT NULL DEFAULT 0,
    instituicao_id BIGINT NOT NULL REFERENCES instituicoes_ensino(id),
    endereco_id BIGINT NOT NULL UNIQUE REFERENCES enderecos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS professores (
    usuario_id BIGINT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    departamento VARCHAR(120) NOT NULL,
    saldo_moedas INTEGER NOT NULL DEFAULT 1000,
    instituicao_id BIGINT NOT NULL REFERENCES instituicoes_ensino(id)
);

CREATE TABLE IF NOT EXISTS empresas_parceiras (
    usuario_id BIGINT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS vantagens (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    foto VARCHAR(500) NOT NULL,
    custo_moedas INTEGER NOT NULL CHECK (custo_moedas > 0),
    empresa_id BIGINT NOT NULL REFERENCES empresas_parceiras(usuario_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transacoes (
    id BIGSERIAL PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor INTEGER NOT NULL CHECK (valor > 0),
    tipo_transacao VARCHAR(31) NOT NULL
);

CREATE TABLE IF NOT EXISTS transferencias_moedas (
    transacao_id BIGINT PRIMARY KEY REFERENCES transacoes(id) ON DELETE CASCADE,
    motivo TEXT NOT NULL,
    professor_id BIGINT NOT NULL REFERENCES professores(usuario_id),
    aluno_id BIGINT NOT NULL REFERENCES alunos(usuario_id)
);

CREATE TABLE IF NOT EXISTS resgates_vantagem (
    transacao_id BIGINT PRIMARY KEY REFERENCES transacoes(id) ON DELETE CASCADE,
    aluno_id BIGINT NOT NULL REFERENCES alunos(usuario_id),
    vantagem_id BIGINT NOT NULL REFERENCES vantagens(id)
);

CREATE TABLE IF NOT EXISTS cupons (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(60) NOT NULL UNIQUE,
    emitido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('EMITIDO', 'UTILIZADO')),
    resgate_id BIGINT NOT NULL UNIQUE REFERENCES resgates_vantagem(transacao_id) ON DELETE CASCADE
);
