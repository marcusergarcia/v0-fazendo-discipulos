-- Adicionar campo fase_1_completa na tabela progresso_fases
ALTER TABLE progresso_fases 
ADD COLUMN IF NOT EXISTS fase_1_completa BOOLEAN DEFAULT FALSE;

-- Comentário explicativo
COMMENT ON COLUMN progresso_fases.fase_1_completa IS 'Indica se o discípulo completou todos os 10 passos da Fase 1 e está aguardando a decisão por Cristo';
