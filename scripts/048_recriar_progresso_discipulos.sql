-- Recriar progresso para todos os discípulos aprovados que não têm progresso
INSERT INTO progresso_fases (id, discipulo_id, fase_numero, passo_numero, nivel, passo, reflexoes_concluidas, pontuacao_total, data_inicio)
SELECT 
  gen_random_uuid(),
  d.id,
  1, -- fase_numero
  1, -- passo_numero  
  1, -- nivel
  1, -- passo
  0, -- reflexoes_concluidas
  0, -- pontuacao_total
  NOW()
FROM discipulos d
WHERE d.aprovado_discipulador = true
AND NOT EXISTS (
  SELECT 1 FROM progresso_fases pf WHERE pf.discipulo_id = d.id
);
