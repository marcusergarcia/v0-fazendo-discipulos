-- Adicionar campos para controle de decisão por Cristo e batismo na tabela discipulos
ALTER TABLE discipulos
ADD COLUMN IF NOT EXISTS decisao_por_cristo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_decisao_por_cristo TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confissao_fe_assinada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_assinatura_confissao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nome_assinatura_confissao TEXT,
ADD COLUMN IF NOT EXISTS ja_batizado BOOLEAN,
ADD COLUMN IF NOT EXISTS data_resposta_batismo TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS necessita_fase_batismo BOOLEAN DEFAULT FALSE;

-- Adicionar comentários explicativos
COMMENT ON COLUMN discipulos.decisao_por_cristo IS 'Indica se o discípulo recebeu Cristo como Salvador';
COMMENT ON COLUMN discipulos.confissao_fe_assinada IS 'Indica se o discípulo assinou a confissão de fé';
COMMENT ON COLUMN discipulos.nome_assinatura_confissao IS 'Nome completo usado na assinatura da confissão de fé';
COMMENT ON COLUMN discipulos.ja_batizado IS 'TRUE se batizado, FALSE se não, NULL se ainda não respondeu';
COMMENT ON COLUMN discipulos.necessita_fase_batismo IS 'TRUE se precisa passar pela fase intermediária de batismo';

-- Adicionar campo para marcar conclusão da fase 1 na tabela progresso_fases
ALTER TABLE progresso_fases
ADD COLUMN IF NOT EXISTS fase_1_completa BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN progresso_fases.fase_1_completa IS 'Indica se o discípulo completou todos os passos da Fase 1';
