-- Corrige o estado do discípulo TESTE para garantir que está na fase intermediária de batismo
-- Usando nome_completo_temp ao invés de nome que não existe
UPDATE discipulos
SET 
  necessita_fase_batismo = true,
  ja_batizado = false,
  fase_atual = 1  -- Mantém em fase 1 porque está na intermediária antes de ir para fase 2
WHERE nome_completo_temp = 'TESTE' OR email_temporario ILIKE '%teste%';

-- Verifica o resultado
-- Usando nome_completo_temp na query de verificação
SELECT id, nome_completo_temp, fase_atual, passo_atual, necessita_fase_batismo, ja_batizado
FROM discipulos
WHERE nome_completo_temp = 'TESTE' OR email_temporario ILIKE '%teste%';
