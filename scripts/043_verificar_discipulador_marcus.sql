-- Verifica se o Pr. Marcus tem um discipulador configurado

SELECT 
  'Marcus Info' as tipo,
  d.id as discipulo_id,
  d.user_id,
  d.discipulador_id,
  d.aprovado_discipulador,
  d.nivel_atual,
  d.status
FROM discipulos d
WHERE d.user_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';

-- Verifica se o discipulador (12 Apóstolos) existe nas tabelas necessárias
SELECT 
  '12 Apostolos Auth' as tipo,
  au.id,
  au.email,
  au.created_at
FROM auth.users au
WHERE au.email = '12apostolos@fazendodiscipulos.com.br';

SELECT 
  '12 Apostolos Profile' as tipo,
  p.id,
  p.email,
  p.nome_completo,
  p.status,
  p.created_at
FROM profiles p
WHERE p.email = '12apostolos@fazendodiscipulos.com.br'
   OR p.id = '28e0b52f-2d6b-4cf9-aae8-d80f935748fa';
