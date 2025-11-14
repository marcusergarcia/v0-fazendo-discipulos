-- Verificar o status completo da Viviane
SELECT 
  d.id as discipulo_id,
  d.nome_completo_temp,
  d.email_temporario,
  d.user_id,
  d.aprovado_discipulador,
  d.status,
  d.discipulador_id,
  p.id as profile_id,
  p.nome_completo as profile_nome,
  p.email as profile_email,
  u.email as auth_email
FROM discipulos d
LEFT JOIN profiles p ON d.user_id = p.id
LEFT JOIN auth.users u ON d.user_id = u.id
WHERE d.email_temporario = 'vivianegarciia4@gmail.com';

-- Contar discípulos do Marcus
SELECT 
  COUNT(*) FILTER (WHERE d.user_id IS NOT NULL) as total_aprovados,
  COUNT(*) FILTER (WHERE d.user_id IS NULL AND d.aprovado_discipulador = false) as total_pendentes,
  COUNT(*) as total_geral
FROM discipulos d
WHERE d.discipulador_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';
