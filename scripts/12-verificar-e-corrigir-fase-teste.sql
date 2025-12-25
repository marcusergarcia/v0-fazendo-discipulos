-- Primeiro, vamos ver o estado atual do discípulo TESTE
SELECT 
  d.id,
  d.nome_completo,
  d.fase_atual,
  d.passo_atual,
  d.decisao_por_cristo,
  d.ja_batizado,
  d.necessita_fase_batismo,
  p.fase_atual as progresso_fase_atual,
  p.passo_atual as progresso_passo_atual,
  p.fase_1_completa
FROM discipulos d
LEFT JOIN progresso_fases p ON p.discipulo_id = d.id
WHERE d.nome_completo = 'TESTE';

-- Se o discípulo TESTE respondeu "não batizado", devemos ajustar para fase intermediária
UPDATE discipulos
SET 
  fase_atual = 1,
  passo_atual = 1,
  necessita_fase_batismo = true,
  ja_batizado = false
WHERE nome_completo = 'TESTE';

-- Atualizar progresso_fases também
UPDATE progresso_fases
SET 
  fase_atual = 1,
  passo_atual = 1
WHERE discipulo_id IN (
  SELECT id FROM discipulos WHERE nome_completo = 'TESTE'
);
