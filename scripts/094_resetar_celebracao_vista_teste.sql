-- Script para resetar a flag celebracao_vista do discípulo TESTE
-- Isso permitirá que o modal de celebração apareça na próxima vez que o discípulo fizer login

-- Removido pontuacao_passo_anterior pois a coluna será adicionada no script 095
-- Atualizar a flag para false
UPDATE progresso_fases
SET 
  celebracao_vista = false
WHERE discipulo_id = (
  SELECT id FROM discipulos WHERE email_temporario = 'teste@gmail.com'
);

-- Verificar o resultado
SELECT 
  pf.discipulo_id,
  d.nome_completo_temp as nome,
  d.passo_atual as passo_discipulo,
  pf.fase_atual,
  pf.passo_atual as passo_progresso,
  pf.celebracao_vista,
  pf.pontuacao_passo_atual
FROM progresso_fases pf
JOIN discipulos d ON d.id = pf.discipulo_id
WHERE d.email_temporario = 'teste@gmail.com';
