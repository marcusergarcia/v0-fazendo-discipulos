-- Verificar se existem respostas no histórico para Viviane
SELECT 
    id,
    discipulo_id,
    passo_numero,
    fase_numero,
    pergunta,
    resposta_pergunta,
    missao_pratica,
    resposta_missao,
    situacao,
    xp_ganho
FROM historico_respostas_passo
WHERE discipulo_id IN (
    SELECT id FROM discipulos 
    WHERE nome_completo_temp LIKE '%Viviane%'
);

-- Verificar o passo atual de Viviane
SELECT 
    nome_completo_temp,
    passo_atual,
    fase_atual,
    xp_total
FROM discipulos
WHERE nome_completo_temp LIKE '%Viviane%';
