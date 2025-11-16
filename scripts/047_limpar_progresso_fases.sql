-- Limpar tabela progresso_fases completamente
TRUNCATE TABLE progresso_fases;

-- Remover colunas antigas que não são mais usadas
ALTER TABLE progresso_fases 
DROP COLUMN IF EXISTS videos_assistidos,
DROP COLUMN IF EXISTS artigos_lidos,
DROP COLUMN IF EXISTS resposta_missao,
DROP COLUMN IF EXISTS enviado_para_validacao,
DROP COLUMN IF EXISTS status_validacao,
DROP COLUMN IF EXISTS feedback_discipulador,
DROP COLUMN IF EXISTS data_completado,
DROP COLUMN IF EXISTS alertado_tempo_excessivo,
DROP COLUMN IF EXISTS rascunho_resposta,
DROP COLUMN IF EXISTS data_envio_validacao,
DROP COLUMN IF EXISTS completado,
DROP COLUMN IF EXISTS xp_ganho,
DROP COLUMN IF EXISTS nota_discipulador,
DROP COLUMN IF EXISTS data_validacao,
DROP COLUMN IF EXISTS resposta_pergunta,
DROP COLUMN IF EXISTS validado_por,
DROP COLUMN IF EXISTS dias_no_passo;

-- Garantir que as colunas necessárias existam
ALTER TABLE progresso_fases 
ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS passo INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS reflexoes_concluidas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pontuacao_total INTEGER DEFAULT 0;

-- Adicionar constraint para garantir valores positivos
ALTER TABLE progresso_fases 
ADD CONSTRAINT nivel_positivo CHECK (nivel > 0),
ADD CONSTRAINT passo_positivo CHECK (passo > 0),
ADD CONSTRAINT reflexoes_positivas CHECK (reflexoes_concluidas >= 0),
ADD CONSTRAINT pontuacao_positiva CHECK (pontuacao_total >= 0);

-- Criar índice único para garantir apenas uma linha por discípulo
CREATE UNIQUE INDEX IF NOT EXISTS idx_progresso_discipulo_unico 
ON progresso_fases(discipulo_id);
