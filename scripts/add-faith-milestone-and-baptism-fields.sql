-- Script para adicionar campos de Marco de Fé e Fase Intermediária de Batismo
-- Versão 1.0

-- Adicionar campos ao perfil do discípulo relacionados ao Marco de Fé
ALTER TABLE discipulos
ADD COLUMN IF NOT EXISTS confissao_fe_assinada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_confissao_fe TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS eh_batizado BOOLEAN,
ADD COLUMN IF NOT EXISTS data_resposta_batismo TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assinatura_digital TEXT,
ADD COLUMN IF NOT EXISTS compromisso_discipulador BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_compromisso_discipulador TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fase_intermediaria_concluida BOOLEAN DEFAULT FALSE;

-- Comentários nas colunas
COMMENT ON COLUMN discipulos.confissao_fe_assinada IS 'Se o discípulo assinou a confissão de fé após completar a Fase 1';
COMMENT ON COLUMN discipulos.data_confissao_fe IS 'Data em que o discípulo assinou a confissão de fé';
COMMENT ON COLUMN discipulos.eh_batizado IS 'Status do batismo: true=batizado, false=não batizado, null=não respondeu';
COMMENT ON COLUMN discipulos.data_resposta_batismo IS 'Data em que o discípulo respondeu sobre o batismo';
COMMENT ON COLUMN discipulos.assinatura_digital IS 'Nome completo como assinatura digital';
COMMENT ON COLUMN discipulos.compromisso_discipulador IS 'Se o discípulo se comprometeu a ser um discipulador';
COMMENT ON COLUMN discipulos.data_compromisso_discipulador IS 'Data do compromisso com o discipulado';
COMMENT ON COLUMN discipulos.fase_intermediaria_concluida IS 'Se completou a fase intermediária sobre batismo';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_discipulos_confissao_fe ON discipulos(confissao_fe_assinada);
CREATE INDEX IF NOT EXISTS idx_discipulos_eh_batizado ON discipulos(eh_batizado);
CREATE INDEX IF NOT EXISTS idx_discipulos_fase_intermediaria ON discipulos(fase_intermediaria_concluida);

-- Atualizar RLS policies para permitir que discípulos atualizem esses campos
-- Nota: A policy já existente deve cobrir esses campos, mas vamos garantir
