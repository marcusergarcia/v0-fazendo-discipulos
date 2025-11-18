-- Primeiro remover a constraint única que impede ter múltiplos registros
ALTER TABLE historico_respostas_passo 
DROP CONSTRAINT IF EXISTS historico_respostas_passo_discipulo_fase_passo_idx;

-- Agora separar as perguntas em dois registros
DO $$
DECLARE
    registro_atual RECORD;
    novo_id_pergunta UUID;
    novo_id_missao UUID;
BEGIN
    -- Buscar registros que têm ambas as respostas
    FOR registro_atual IN 
        SELECT * FROM historico_respostas_passo 
        WHERE resposta_pergunta IS NOT NULL 
        AND resposta_missao IS NOT NULL
    LOOP
        -- Gerar novos UUIDs
        novo_id_pergunta := gen_random_uuid();
        novo_id_missao := gen_random_uuid();
        
        -- Criar registro separado para a PERGUNTA
        INSERT INTO historico_respostas_passo (
            id,
            discipulo_id,
            discipulador_id,
            fase_numero,
            passo_numero,
            pergunta,
            resposta_pergunta,
            situacao,
            data_envio,
            data_aprovacao,
            xp_ganho,
            feedback_discipulador
        ) VALUES (
            novo_id_pergunta,
            registro_atual.discipulo_id,
            registro_atual.discipulador_id,
            registro_atual.fase_numero,
            registro_atual.passo_numero,
            registro_atual.pergunta,
            registro_atual.resposta_pergunta,
            registro_atual.situacao,
            registro_atual.data_envio,
            registro_atual.data_aprovacao,
            CASE 
                WHEN registro_atual.xp_ganho IS NOT NULL THEN registro_atual.xp_ganho / 2 
                ELSE NULL 
            END,
            registro_atual.feedback_discipulador
        );
        
        -- Criar registro separado para a MISSÃO
        INSERT INTO historico_respostas_passo (
            id,
            discipulo_id,
            discipulador_id,
            fase_numero,
            passo_numero,
            missao_pratica,
            resposta_missao,
            situacao,
            data_envio,
            data_aprovacao,
            xp_ganho,
            feedback_discipulador
        ) VALUES (
            novo_id_missao,
            registro_atual.discipulo_id,
            registro_atual.discipulador_id,
            registro_atual.fase_numero,
            registro_atual.passo_numero,
            registro_atual.missao_pratica,
            registro_atual.resposta_missao,
            registro_atual.situacao,
            registro_atual.data_envio,
            registro_atual.data_aprovacao,
            CASE 
                WHEN registro_atual.xp_ganho IS NOT NULL THEN registro_atual.xp_ganho / 2 
                ELSE NULL 
            END,
            registro_atual.feedback_discipulador
        );
        
        -- Deletar o registro original
        DELETE FROM historico_respostas_passo WHERE id = registro_atual.id;
        
        RAISE NOTICE 'Separado registro % em dois: pergunta (%) e missão (%)', 
            registro_atual.id, novo_id_pergunta, novo_id_missao;
    END LOOP;
END $$;

-- Verificar o resultado
SELECT 
    id,
    discipulo_id,
    passo_numero,
    CASE 
        WHEN pergunta IS NOT NULL THEN 'Pergunta'
        WHEN missao_pratica IS NOT NULL THEN 'Missão'
        ELSE 'Indefinido'
    END as tipo,
    COALESCE(LEFT(pergunta, 50), LEFT(missao_pratica, 50)) as questao_inicio,
    COALESCE(LEFT(resposta_pergunta, 50), LEFT(resposta_missao, 50)) as resposta_inicio,
    situacao,
    xp_ganho
FROM historico_respostas_passo
ORDER BY passo_numero, tipo;
