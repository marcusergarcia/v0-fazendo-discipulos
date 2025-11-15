-- Script para corrigir o discipulo_id das reflexões existentes
-- Usando o discipulo_id correto que aparece nos logs: f7ff6309-32a3-45c8-96a6-b76a687f2e7a

-- Atualizar todas as reflexões existentes para o discípulo correto
UPDATE reflexoes_conteudo
SET discipulo_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a'
WHERE discipulo_id IS NULL 
   OR discipulo_id != 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';

-- Verificar os resultados
SELECT 
  rc.id,
  rc.conteudo_id,
  rc.tipo,
  rc.titulo,
  LEFT(rc.reflexao, 50) as reflexao_preview,
  rc.discipulo_id,
  d.user_id as discipulo_user_id
FROM reflexoes_conteudo rc
LEFT JOIN discipulos d ON rc.discipulo_id = d.id
ORDER BY rc.data_criacao DESC;
