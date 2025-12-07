-- Deletar respostas do Passo 4 do discípulo TESTE usando ID direto
-- Discípulo: TESTE (ID: 63de2c78-0e35-4099-b1b7-3eae011ba4df)
-- Este discípulo submeteu apenas 3 respostas quando deveria ter 4

-- Deletar o registro específico do Passo 4
DELETE FROM perguntas_reflexivas 
WHERE discipulo_id = '63de2c78-0e35-4099-b1b7-3eae011ba4df'
  AND passo_numero = 4;

-- Verificar se foi deletado
SELECT 
  'Após deleção' as momento,
  COUNT(*) as total_registros
FROM perguntas_reflexivas
WHERE discipulo_id = '63de2c78-0e35-4099-b1b7-3eae011ba4df'
  AND passo_numero = 4;
