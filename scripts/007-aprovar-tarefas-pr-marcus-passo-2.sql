-- Aprovar automaticamente todas as tarefas do Pr. Marcus no Passo 2
-- Execute este script quando o Pr. Marcus completar o Passo 2

-- 1. Aprovar todas as reflexões de conteúdo (vídeos e artigos)
UPDATE reflexoes_conteudo 
SET 
    situacao = 'aprovado',
    feedback_discipulador = 'Excelente reflexão! Continue assim.',
    xp_ganho = 30
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1 
AND passo_numero = 2
AND situacao != 'aprovado';

-- 2. Aprovar a pergunta do passo
UPDATE historico_respostas_passo 
SET 
    situacao = 'aprovado',
    feedback_discipulador = 'Resposta muito boa! Parabéns!',
    xp_ganho = 30
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1 
AND passo_numero = 2
AND tipo_resposta = 'pergunta'
AND situacao != 'aprovado';

-- 3. Aprovar a missão do passo
UPDATE historico_respostas_passo 
SET 
    situacao = 'aprovado',
    feedback_discipulador = 'Missão cumprida com sucesso! Continue firme!',
    xp_ganho = 30
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1 
AND passo_numero = 2
AND tipo_resposta = 'missao'
AND situacao != 'aprovado';

-- Verificar resultado
SELECT 
    'Reflexões' as tipo,
    COUNT(*) as total_aprovadas
FROM reflexoes_conteudo 
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1 
AND passo_numero = 2
AND situacao = 'aprovado'

UNION ALL

SELECT 
    'Pergunta' as tipo,
    COUNT(*) as total_aprovadas
FROM historico_respostas_passo 
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1 
AND passo_numero = 2
AND tipo_resposta = 'pergunta'
AND situacao = 'aprovado'

UNION ALL

SELECT 
    'Missão' as tipo,
    COUNT(*) as total_aprovadas
FROM historico_respostas_passo 
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1 
AND passo_numero = 2
AND tipo_resposta = 'missao'
AND situacao = 'aprovado';
