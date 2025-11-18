-- Buscar respostas do Pr. Marcus Emerson no histórico
SELECT 
  id,
  passo_numero,
  fase_numero,
  situacao,
  pergunta,
  LEFT(resposta_pergunta, 100) as resposta_pergunta_preview,
  missao_pratica,
  LEFT(resposta_missao, 100) as resposta_missao_preview,
  xp_ganho,
  feedback_discipulador,
  data_envio,
  data_aprovacao
FROM historico_respostas_passo
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
ORDER BY passo_numero, fase_numero;
