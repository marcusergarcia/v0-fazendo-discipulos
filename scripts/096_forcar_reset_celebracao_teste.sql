-- Script direto para forçar o reset da flag celebracao_vista do discípulo TESTE
-- Execute este script no Supabase para permitir que o modal de celebração apareça

UPDATE progresso_fases
SET celebracao_vista = false
WHERE discipulo_id = (
  SELECT id 
  FROM discipulos 
  WHERE email_temporario = 'teste@gmail.com'
);

-- Verificar se foi atualizado
SELECT 
  pf.fase_atual,
  pf.passo_atual,
  pf.celebracao_vista,
  d.nome_completo_temp,
  d.email_temporario
FROM progresso_fases pf
JOIN discipulos d ON d.id = pf.discipulo_id
WHERE d.email_temporario = 'teste@gmail.com';
