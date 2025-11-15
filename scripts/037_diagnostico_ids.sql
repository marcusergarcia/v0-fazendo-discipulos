-- Diagnóstico completo para entender os IDs

-- 1. Verificar dados da Viviane na tabela profiles
SELECT 
  'PROFILE' as tabela,
  id,
  nome_completo,
  email
FROM profiles
WHERE nome_completo ILIKE '%viviane%'
LIMIT 5;

-- 2. Verificar dados da Viviane na tabela discipulos
SELECT 
  'DISCIPULO' as tabela,
  id as discipulo_id,
  user_id,
  discipulador_id,
  fase_atual,
  passo_atual
FROM discipulos
WHERE user_id IN (
  SELECT id FROM profiles WHERE nome_completo ILIKE '%viviane%'
)
LIMIT 5;

-- 3. Verificar reflexões existentes
SELECT 
  'REFLEXAO' as tabela,
  id,
  conteudo_id,
  titulo,
  discipulo_id,
  fase_numero,
  passo_numero,
  LEFT(reflexao, 50) as reflexao_preview
FROM reflexoes_conteudo
ORDER BY data_criacao DESC
LIMIT 10;

-- 4. Verificar se há reflexões sem discipulo_id
SELECT 
  'REFLEXOES_SEM_DISCIPULO' as tabela,
  COUNT(*) as quantidade
FROM reflexoes_conteudo
WHERE discipulo_id IS NULL;
