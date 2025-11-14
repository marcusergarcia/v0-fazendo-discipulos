-- Verificar dados completos da Viviane
SELECT 
  id,
  discipulador_id,
  user_id,
  aprovado_discipulador,
  nome_completo_temp,
  email_temporario,
  status,
  nivel_atual,
  fase_atual,
  passo_atual,
  xp_total
FROM discipulos 
WHERE email_temporario = 'vivianegarciia4@gmail.com'
OR nome_completo_temp LIKE '%Viviane%';

-- Ver se ela tem profile criado
SELECT 
  id,
  nome_completo,
  email,
  foto_perfil_url,
  avatar_url
FROM profiles
WHERE email = 'vivianegarciia4@gmail.com';

-- Ver todos os discípulos do Marcus
SELECT 
  d.id,
  d.user_id,
  d.aprovado_discipulador,
  d.nome_completo_temp,
  d.email_temporario,
  p.nome_completo as profile_nome,
  p.email as profile_email
FROM discipulos d
LEFT JOIN profiles p ON d.user_id = p.id
WHERE d.discipulador_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';
