-- Consultar respostas do histórico para o Pr. Marcus Emerson
SELECT 
    id,
    discipulo_id,
    discipulador_id,
    passo_numero,
    fase_numero,
    pergunta,
    resposta_pergunta,
    missao_pratica,
    resposta_missao,
    situacao,
    xp_ganho,
    feedback_discipulador,
    data_aprovacao
FROM historico_respostas_passo
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
ORDER BY passo_numero, fase_numero;
