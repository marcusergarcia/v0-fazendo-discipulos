-- Adiciona coluna pontuacao_passo_anterior na tabela progresso_fases
-- Esta coluna armazena o XP ganho no passo anterior para exibir no modal de celebração

ALTER TABLE progresso_fases
ADD COLUMN IF NOT EXISTS pontuacao_passo_anterior integer DEFAULT 0;

COMMENT ON COLUMN progresso_fases.pontuacao_passo_anterior IS 'XP ganho no passo anterior, usado para exibir no modal de celebração';
