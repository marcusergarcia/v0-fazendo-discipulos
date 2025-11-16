-- Buscar Viviane em todas as tabelas relacionadas

-- 1. Verificar na tabela auth.users
SELECT 
  'auth.users' as tabela,
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'vivianegarciia4@gmail.com';

-- 2. Verificar na tabela profiles
SELECT 
  'profiles' as tabela,
  id,
  email,
  nome_completo,
  status,
  created_at
FROM profiles
WHERE email = 'vivianegarciia4@gmail.com';

-- 3. Verificar na tabela discipulos (TODOS os registros, não só aprovados)
SELECT 
  'discipulos' as tabela,
  id,
  user_id,
  discipulador_id,
  aprovado_discipulador,
  status,
  created_at
FROM discipulos
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'vivianegarciia4@gmail.com');

-- 4. Verificar registros temporários aguardando aprovação
SELECT
  'discipulos_temp' as tabela,
  id,
  discipulador_id,
  nome_completo_temp,
  email_temporario,
  aprovado_discipulador,
  status,
  created_at
FROM discipulos
WHERE email_temporario = 'vivianegarciia4@gmail.com';
