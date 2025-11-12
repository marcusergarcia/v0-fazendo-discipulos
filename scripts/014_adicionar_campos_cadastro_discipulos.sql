-- Script para adicionar campos de cadastro na tabela discipulos

ALTER TABLE public.discipulos
ADD COLUMN IF NOT EXISTS aceitou_lgpd BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aceitou_compromisso BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_aceite_termos TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS localizacao_cadastro TEXT,
ADD COLUMN IF NOT EXISTS latitude_cadastro DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude_cadastro DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS data_cadastro TEXT,
ADD COLUMN IF NOT EXISTS hora_cadastro TEXT,
ADD COLUMN IF NOT EXISTS semana_cadastro TEXT,
ADD COLUMN IF NOT EXISTS aprovado_discipulador BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_aprovacao_discipulador TIMESTAMPTZ;
