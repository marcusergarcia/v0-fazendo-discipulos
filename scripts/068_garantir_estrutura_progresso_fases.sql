-- Garantir que a tabela progresso_fases tem apenas os campos corretos
-- Remove campos antigos se existirem e adiciona os campos corretos

-- 1. Remover campos antigos se existirem
ALTER TABLE IF EXISTS progresso_fases 
  DROP COLUMN IF EXISTS fase_numero,
  DROP COLUMN IF EXISTS passo_numero,
  DROP COLUMN IF EXISTS pontuacao_total,
  DROP COLUMN IF EXISTS completado,
  DROP COLUMN IF EXISTS data_completado;

-- 2. Garantir que os campos corretos existem
ALTER TABLE progresso_fases 
  ADD COLUMN IF NOT EXISTS fase_atual integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS passo_atual integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS pontuacao_passo_atual integer DEFAULT 0;

-- 3. Garantir que existe apenas UMA linha por discípulo
-- Criar constraint única
ALTER TABLE progresso_fases 
  DROP CONSTRAINT IF EXISTS progresso_fases_discipulo_id_key;
  
ALTER TABLE progresso_fases 
  ADD CONSTRAINT progresso_fases_discipulo_id_key UNIQUE (discipulo_id);

-- 4. Atualizar progresso para refletir o passo_atual do discípulo
UPDATE progresso_fases pf
SET 
  fase_atual = d.fase_atual,
  passo_atual = d.passo_atual
FROM discipulos d
WHERE pf.discipulo_id = d.id;
