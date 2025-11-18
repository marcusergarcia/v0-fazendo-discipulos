-- Verificar status completo do Pr. Marcus Emerson para liberar Passo 2
-- ID do discípulo: d4d131f7-de70-48e6-943b-840f6fe7c51d

-- 1. Verificar reflexões do passo 1
SELECT 
    rc.id,
    rc.titulo,
    rc.situacao as situacao_reflexao,
    rc.xp_ganho,
    rc.data_aprovacao
FROM reflexoes_conteudo rc
WHERE rc.discipulador_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
    AND rc.passo_numero = 1
ORDER BY rc.id;

-- 2. Verificar respostas do passo 1 no histórico
SELECT 
    hrp.id,
    hrp.passo_numero,
    hrp.pergunta,
    hrp.resposta_pergunta,
    hrp.missao_pratica,
    hrp.resposta_missao,
    hrp.situacao,
    hrp.xp_ganho,
    hrp.data_aprovacao
FROM historico_respostas_passo hrp
WHERE hrp.discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
    AND hrp.passo_numero = 1
ORDER BY hrp.id;

-- 3. Verificar passo atual do discípulo
SELECT 
    d.id,
    d.nome_completo_temp,
    d.passo_atual,
    d.nivel_atual
FROM discipulos d
WHERE d.id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';

-- 4. SE TUDO ESTIVER APROVADO, descomente as linhas abaixo para liberar o passo 2:
-- UPDATE discipulos 
-- SET passo_atual = 2 
-- WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';
