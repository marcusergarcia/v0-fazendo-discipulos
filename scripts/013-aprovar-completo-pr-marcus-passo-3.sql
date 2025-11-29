-- Script para aprovar automaticamente todas as tarefas do Pr. Marcus no Passo 3
-- Inclui: 3 vídeos, 3 artigos, e 3 perguntas reflexivas
-- Discipulador Virtual: Sistema Automático

-- Aprovar 3 reflexões de vídeos (conteudo_id 1, 2, 3)
UPDATE historico_respostas_passo
SET 
    situacao = 'aprovado',
    pontuacao_recebida = 10,
    feedback_discipulador = 'Excelente reflexão! Você demonstrou compreensão profunda do conteúdo apresentado no vídeo. Continue assim!',
    data_aprovacao = NOW()
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1
AND passo_numero = 3
AND tipo_resposta = 'reflexao'
AND conteudo_id IN (1, 2, 3)
AND situacao = 'aguardando_aprovacao';

-- Aprovar 3 reflexões de artigos (conteudo_id 4, 5, 6)
UPDATE historico_respostas_passo
SET 
    situacao = 'aprovado',
    pontuacao_recebida = 10,
    feedback_discipulador = 'Ótima análise! Você extraiu pontos importantes do artigo e relacionou bem com sua experiência pessoal. Parabéns!',
    data_aprovacao = NOW()
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1
AND passo_numero = 3
AND tipo_resposta = 'reflexao'
AND conteudo_id IN (4, 5, 6)
AND situacao = 'aguardando_aprovacao';

-- Aprovar 3 perguntas reflexivas (conteudo_id 1, 2, 3 - tipo reflexao_guiada)
UPDATE historico_respostas_passo
SET 
    situacao = 'aprovado',
    pontuacao_recebida = 10,
    feedback_discipulador = 'Resposta profunda e bem fundamentada! Você demonstrou maturidade espiritual ao refletir sobre este tema. Continue buscando crescimento!',
    data_aprovacao = NOW()
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1
AND passo_numero = 3
AND tipo_resposta = 'reflexao_guiada'
AND conteudo_id IN (1, 2, 3)
AND situacao = 'aguardando_aprovacao';

-- Verificar resultados
SELECT 
    tipo_resposta,
    conteudo_id,
    situacao,
    pontuacao_recebida,
    LEFT(feedback_discipulador, 50) as feedback_preview
FROM historico_respostas_passo
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND fase_numero = 1
AND passo_numero = 3
ORDER BY tipo_resposta, conteudo_id;
