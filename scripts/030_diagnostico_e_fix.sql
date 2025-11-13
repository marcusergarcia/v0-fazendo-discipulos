-- Script de DIAGNÓSTICO e CORREÇÃO FINAL
-- Verifica se o perfil do 12 Apóstolos existe e cria se necessário

-- 1. Mostrar o que existe na tabela discipulos
SELECT 'DISCIPULOS TABLE:' as info;
SELECT id, user_id, discipulador_id, nivel_atual 
FROM discipulos 
ORDER BY created_at;

-- 2. Mostrar o que existe na tabela profiles
SELECT 'PROFILES TABLE:' as info;
SELECT id, email, nome_completo 
FROM profiles 
ORDER BY created_at;

-- 3. Verificar se o perfil do discipulador de Marcus existe
SELECT 'VERIFICANDO PERFIL DO DISCIPULADOR:' as info;
SELECT p.id, p.nome_completo, p.email
FROM discipulos d
LEFT JOIN profiles p ON p.id = d.discipulador_id
WHERE d.user_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';

-- 4. Inserir o perfil do 12 Apóstolos se não existir usando o ID correto
INSERT INTO profiles (id, email, nome_completo, created_at, updated_at)
SELECT 
  '28e0b52f-2d6b-4cf9-aae8-d80f935748fa',
  '12apostolos@fazendodiscipulos.com.br',
  '12 Apóstolos',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE id = '28e0b52f-2d6b-4cf9-aae8-d80f935748fa'
);

-- 5. Verificar novamente após inserção
SELECT 'RESULTADO FINAL:' as info;
SELECT p.id, p.nome_completo, p.email
FROM discipulos d
LEFT JOIN profiles p ON p.id = d.discipulador_id
WHERE d.user_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';
