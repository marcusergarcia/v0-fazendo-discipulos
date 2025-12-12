-- Script direto para forçar update da flag celebracao_vista
-- Atualiza TODOS os registros de progresso_fases para celebracao_vista = false

UPDATE progresso_fases
SET celebracao_vista = false
WHERE discipulo_id IN (
  SELECT id FROM discipulos WHERE email_temporario = 'teste@gmail.com'
);

-- Verificar o resultado
SELECT 
  pf.fase_atual,
  pf.passo_atual,
  pf.celebracao_vista,
  d.nome_completo_temp
FROM progresso_fases pf
JOIN discipulos d ON d.id = pf.discipulo_id
WHERE d.email_temporario = 'teste@gmail.com';
