-- Script para limpar todas as respostas do discípulo TESTE
-- Isso permite testar o sistema do zero

-- ID do discípulo TESTE
-- discipulo_id: 63de2c78-0e35-4099-b1b7-3eae011ba4df

BEGIN;

-- 1. Deletar todas as reflexões de vídeos e artigos (reflexoes_passo)
DELETE FROM reflexoes_passo 
WHERE discipulo_id = '63de2c78-0e35-4099-b1b7-3eae011ba4df';

-- 2. Deletar todas as respostas de perguntas reflexivas
DELETE FROM perguntas_reflexivas 
WHERE discipulo_id = '63de2c78-0e35-4099-b1b7-3eae011ba4df';

-- 3. Deletar notificações relacionadas (opcional - para limpar completamente)
DELETE FROM notificacoes 
WHERE discipulo_id = '63de2c78-0e35-4099-b1b7-3eae011ba4df'
  AND tipo IN ('reflexao_enviada', 'reflexao_aprovada', 'reflexao_reprovada', 'pergunta_reflexiva_enviada', 'pergunta_reflexiva_aprovada');

-- 4. Verificar o que foi deletado
SELECT 
  'reflexoes_passo' as tabela,
  COUNT(*) as registros_restantes
FROM reflexoes_passo 
WHERE discipulo_id = '63de2c78-0e35-4099-b1b7-3eae011ba4df'

UNION ALL

SELECT 
  'perguntas_reflexivas' as tabela,
  COUNT(*) as registros_restantes
FROM perguntas_reflexivas 
WHERE discipulo_id = '63de2c78-0e35-4099-b1b7-3eae011ba4df'

UNION ALL

SELECT 
  'notificacoes' as tabela,
  COUNT(*) as registros_restantes
FROM notificacoes 
WHERE discipulo_id = '63de2c78-0e35-4099-b1b7-3eae011ba4df';

COMMIT;

-- Resultado esperado: todas as tabelas devem mostrar 0 registros restantes
