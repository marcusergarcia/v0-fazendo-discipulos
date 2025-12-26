-- Corrigir passo atual para discípulos na fase de batismo
-- Se fase_1_completa = true e necessita_fase_batismo = true e passo_atual < 11,
-- então deve ser passo 11 (primeiro passo de batismo)

UPDATE discipulos d
SET passo_atual = 11
FROM progresso_fases pf
WHERE d.id = pf.discipulo_id
  AND d.fase_atual = 1
  AND d.necessita_fase_batismo = true
  AND d.ja_batizado = false
  AND pf.fase_1_completa = true
  AND d.passo_atual < 11;

-- Verificar o resultado
SELECT 
  d.nome_completo_temp,
  d.fase_atual,
  d.passo_atual,
  d.necessita_fase_batismo,
  d.ja_batizado,
  pf.fase_1_completa
FROM discipulos d
LEFT JOIN progresso_fases pf ON d.id = pf.discipulo_id
WHERE d.necessita_fase_batismo = true
  AND d.ja_batizado = false;
