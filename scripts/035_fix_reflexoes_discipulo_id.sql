-- Script para corrigir o discipulo_id das reflexões existentes
-- Este script vincula as reflexões ao discípulo correto

-- Atualizar todas as reflexões para o discípulo correto
-- baseado no user_id que aparece nos logs: aMc1c579-92f8-42a8-84cc-faf1b8ebd73c
UPDATE reflexoes_conteudo
SET discipulo_id = (
  SELECT id 
  FROM discipulos 
  WHERE user_id = 'aMc1c579-92f8-42a8-84cc-faf1b8ebd73c'
  LIMIT 1
)
WHERE id IN (
  SELECT id FROM reflexoes_conteudo 
  WHERE discipulo_id IS NULL 
     OR discipulo_id != (SELECT id FROM discipulos WHERE user_id = 'aMc1c579-92f8-42a8-84cc-faf1b8ebd73c' LIMIT 1)
);

-- Verificar os resultados
SELECT 
  rc.id,
  rc.conteudo_id,
  rc.tipo,
  rc.titulo,
  LEFT(rc.reflexao, 50) as reflexao_preview,
  rc.discipulo_id,
  d.user_id as discipulo_user_id,
  p.nome_completo as discipulo_nome
FROM reflexoes_conteudo rc
LEFT JOIN discipulos d ON rc.discipulo_id = d.id
LEFT JOIN profiles p ON d.user_id = p.id
ORDER BY rc.data_criacao DESC;
