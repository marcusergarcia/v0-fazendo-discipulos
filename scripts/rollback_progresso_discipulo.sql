-- ROLLBACK: Reverter migração de progresso_discipulo para progresso_fases
-- Remove a nova tabela progresso_discipulo e mantém progresso_fases original

-- 1. Dropar a nova tabela progresso_discipulo
DROP TABLE IF EXISTS progresso_discipulo CASCADE;

-- 2. Garantir que progresso_fases está com a estrutura original
-- (A tabela já existe e não foi modificada pela migração anterior)

-- 3. Remover quaisquer políticas RLS que foram criadas para progresso_discipulo
-- (Já foram removidas com o CASCADE acima)

-- Verificação final: Mostrar dados de progresso_fases
SELECT 
  pf.id,
  pf.discipulo_id,
  pf.fase_numero,
  pf.passo_numero,
  pf.reflexoes_concluidas,
  pf.pontuacao_total,
  d.id as discipulo_profile_id,
  p.nome_completo
FROM progresso_fases pf
JOIN discipulos d ON pf.discipulo_id = d.id
JOIN profiles p ON d.id = p.id
ORDER BY p.nome_completo, pf.fase_numero, pf.passo_numero;
