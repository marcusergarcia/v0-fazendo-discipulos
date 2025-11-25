-- Remover índices únicos incorretos que impedem múltiplos passos por discípulo
-- O único índice único correto é (discipulo_id, fase_numero, passo_numero)

DROP INDEX IF EXISTS idx_progresso_discipulo_unico;
DROP INDEX IF EXISTS idx_progresso_fases_discipulo_unico;

-- Verificar que o índice correto existe
-- progresso_fases_discipulo_id_fase_numero_passo_numero_key já existe e é o correto
