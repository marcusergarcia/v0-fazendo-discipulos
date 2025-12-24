-- Adicionar campos para controle de decisão por Cristo e batismo
ALTER TABLE discipulos
ADD COLUMN IF NOT EXISTS decisao_por_cristo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_decisao_por_cristo TIMESTAMP WITH TIMEZONE,
ADD COLUMN IF NOT EXISTS confissao_fe_assinada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_assinatura_confissao TIMESTAMP WITH TIMEZONE,
ADD COLUMN IF NOT EXISTS ja_batizado BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_resposta_batismo TIMESTAMP WITH TIMEZONE,
ADD COLUMN IF NOT EXISTS necessita_fase_batismo BOOLEAN DEFAULT FALSE;

-- Comentários explicativos
COMMENT ON COLUMN discipulos.decisao_por_cristo IS 'Indica se o discípulo recebeu Cristo como Salvador';
COMMENT ON COLUMN discipulos.confissao_fe_assinada IS 'Indica se o discípulo assinou a confissão de fé';
COMMENT ON COLUMN discipulos.ja_batizado IS 'TRUE se batizado, FALSE se não, NULL se ainda não respondeu';
COMMENT ON COLUMN discipulos.necessita_fase_batismo IS 'TRUE se precisa passar pela fase intermediária de batismo';
