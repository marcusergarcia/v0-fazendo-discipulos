-- Script para corrigir o discipulo_id das reflexões existentes
-- Este script vincula as reflexões ao discípulo correto baseado no user_id

-- Primeiro, vamos verificar qual é o discipulo_id correto
-- Assumindo que a usuária Viviane tem user_id = 'a0Nc1c579-92f8-42a8-84cc-faf1b8ebd73c'
-- (baseado nos logs que mostram esse ID nas queries)

-- Atualizar todas as reflexões que não têm discipulo_id ou têm um ID incorreto
UPDATE reflexoes_conteudo
SET discipulo_id = (
  SELECT id 
  FROM discipulos 
  WHERE user_id = 'a0Nc1c579-92f8-42a8-84cc-faf1b8ebd73c'
  LIMIT 1
)
WHERE discipulo_id IS NULL OR discipulo_id NOT IN (
  SELECT id FROM discipulos
);

-- Verificar os resultados
SELECT 
  rc.id,
  rc.conteudo_id,
  rc.tipo,
  rc.titulo,
  rc.discipulo_id,
  d.user_id as discipulo_user_id,
  p.nome_completo as discipulo_nome
FROM reflexoes_conteudo rc
LEFT JOIN discipulos d ON rc.discipulo_id = d.id
LEFT JOIN profiles p ON d.user_id = p.id
ORDER BY rc.data_criacao DESC;
