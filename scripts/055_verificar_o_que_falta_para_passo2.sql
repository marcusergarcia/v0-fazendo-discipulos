-- Verificar o que falta para liberar o Passo 2 do Pr. Marcus Emerson

-- 1. Contar reflexões aprovadas vs total (precisa de 6 aprovadas)
SELECT 
  COUNT(*) FILTER (WHERE situacao = 'aprovado') as reflexoes_aprovadas,
  COUNT(*) as total_reflexoes
FROM reflexoes_conteudo rc
WHERE rc.discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND rc.passo_numero = 1;

-- 2. Verificar se respostas existem e estão aprovadas (precisa de 1 aprovada)
SELECT 
  COUNT(*) FILTER (WHERE situacao = 'aprovado') as respostas_aprovadas,
  COUNT(*) FILTER (WHERE situacao = 'enviado') as respostas_enviadas,
  COUNT(*) as total_respostas
FROM historico_respostas_passo
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND passo_numero = 1;

-- 3. Diagnóstico final
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FILTER (WHERE situacao = 'aprovado') FROM reflexoes_conteudo WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d' AND passo_numero = 1) = 6
         AND (SELECT COUNT(*) FILTER (WHERE situacao = 'aprovado') FROM historico_respostas_passo WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d' AND passo_numero = 1) >= 1
    THEN '✅ PRONTO PARA LIBERAR PASSO 2'
    ELSE '❌ FALTA APROVAR: ' || 
         CASE WHEN (SELECT COUNT(*) FILTER (WHERE situacao = 'aprovado') FROM reflexoes_conteudo WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d' AND passo_numero = 1) < 6
         THEN 'Reflexões | ' ELSE '' END ||
         CASE WHEN (SELECT COUNT(*) FILTER (WHERE situacao = 'aprovado') FROM historico_respostas_passo WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d' AND passo_numero = 1) < 1
         THEN 'Respostas' ELSE '' END
  END as diagnostico;
