-- Verificar respostas do Pr. Marcus Emerson no histórico
SELECT 
  id,
  passo_numero,
  pergunta,
  resposta_pergunta,
  missao_pratica, -- corrigido de 'missao' para 'missao_pratica'
  resposta_missao,
  situacao,
  xp_ganho,
  feedback_discipulador,
  data_envio,
  data_aprovacao
FROM historico_respostas_passo
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND passo_numero = 1
ORDER BY data_envio DESC;

-- Se não houver respostas, isso significa que o discípulo não enviou ainda
-- ou o sistema não está salvando corretamente

-- Para liberar o passo 2 manualmente (execute apenas se as respostas estiverem aprovadas):
-- UPDATE discipulos 
-- SET passo_atual = 2 
-- WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';
