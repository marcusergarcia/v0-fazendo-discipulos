-- Limpar todos os registros de progresso_fases
DELETE FROM progresso_fases;

-- Adicionar novos campos se não existirem
DO $$ 
BEGIN
  -- Campo nivel (1, 2, 3, 4, 5)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'progresso_fases' AND column_name = 'nivel') THEN
    ALTER TABLE progresso_fases ADD COLUMN nivel INTEGER DEFAULT 1;
  END IF;

  -- Campo passo (1-10 por nivel)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'progresso_fases' AND column_name = 'passo') THEN
    ALTER TABLE progresso_fases ADD COLUMN passo INTEGER DEFAULT 1;
  END IF;

  -- Campo reflexoes_concluidas (0-6)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'progresso_fases' AND column_name = 'reflexoes_concluidas') THEN
    ALTER TABLE progresso_fases ADD COLUMN reflexoes_concluidas INTEGER DEFAULT 0;
  END IF;

  -- Campo pontuacao_total
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'progresso_fases' AND column_name = 'pontuacao_total') THEN
    ALTER TABLE progresso_fases ADD COLUMN pontuacao_total INTEGER DEFAULT 0;
  END IF;
END $$;

-- Criar índice único para garantir uma linha por discípulo
CREATE UNIQUE INDEX IF NOT EXISTS idx_progresso_fases_discipulo 
ON progresso_fases(discipulo_id);

-- Adicionar comentários para documentação
COMMENT ON COLUMN progresso_fases.nivel IS 'Nível atual do discípulo (1-5)';
COMMENT ON COLUMN progresso_fases.passo IS 'Passo atual no nível (1-10)';
COMMENT ON COLUMN progresso_fases.reflexoes_concluidas IS 'Contador de reflexões concluídas no passo atual (0-6)';
COMMENT ON COLUMN progresso_fases.pontuacao_total IS 'Pontuação total acumulada do discípulo';
