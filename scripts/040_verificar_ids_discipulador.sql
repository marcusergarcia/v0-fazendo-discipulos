-- Verifica o ID do Marcus e o discipulador_id da Viviane
SELECT 
  'Marcus Auth User' as tipo,
  au.id as user_id,
  au.email,
  p.id as profile_id,
  p.nome_completo
FROM auth.users au
-- Corrigindo nome da tabela para profiles (plural)
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'marcus.macintel@terra.com.br'

UNION ALL

SELECT 
  'Marcus como Discipulador' as tipo,
  d.discipulador_id as user_id,
  d.email_temporario as email,
  NULL as profile_id,
  d.nome_completo_temp as nome_completo
FROM discipulos d
WHERE d.email_temporario = 'vivianegarciia4@gmail.com'

UNION ALL

SELECT 
  'Viviane Discipulo' as tipo,
  d.user_id,
  d.email_temporario as email,
  NULL as profile_id,
  d.nome_completo_temp as nome_completo
FROM discipulos d
WHERE d.email_temporario = 'vivianegarciia4@gmail.com';
