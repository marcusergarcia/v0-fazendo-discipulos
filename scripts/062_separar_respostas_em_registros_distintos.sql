-- Script para separar perguntas e missões em registros distintos

-- 1. Remover constraint única se existir (para permitir múltiplos registros)
ALTER TABLE historico_respostas_passo 
DROP CONSTRAINT IF EXISTS historico_respostas_passo_discipulo_fase_passo_idx;

-- 2. Para cada registro existente com ambas as respostas, criar dois registros separados
DO $$
DECLARE
    registro RECORD;
BEGIN
    FOR registro IN 
        SELECT * FROM historico_respostas_passo 
        WHERE resposta_pergunta IS NOT NULL AND resposta_missao IS NOT NULL
    LOOP
        -- Inserir registro para a PERGUNTA
        INSERT INTO historico_respostas_passo (
            discipulo_id,
            discipulador_id,
            fase_numero,
            passo_numero,
            pergunta,
            resposta_pergunta,
            missao_pratica,
            resposta_missao,
            situacao,
            xp_ganho,
            feedback_discipulador,
            data_envio,
            data_aprovacao,
            notificacao_id,
            tipo_resposta
        ) VALUES (
            registro.discipulo_id,
            registro.discipulador_id,
            registro.fase_numero,
            registro.passo_numero,
            registro.pergunta,
            registro.resposta_pergunta,
            NULL, -- missao_pratica vazia para pergunta
            NULL, -- resposta_missao vazia para pergunta
            registro.situacao,
            CASE WHEN registro.xp_ganho IS NOT NULL THEN registro.xp_ganho / 2 ELSE NULL END,
            registro.feedback_discipulador,
            registro.data_envio,
            registro.data_aprovacao,
            registro.notificacao_id,
            'pergunta' -- Tipo: pergunta
        );

        -- Inserir registro para a MISSÃO
        INSERT INTO historico_respostas_passo (
            discipulo_id,
            discipulador_id,
            fase_numero,
            passo_numero,
            pergunta,
            resposta_pergunta,
            missao_pratica,
            resposta_missao,
            situacao,
            xp_ganho,
            feedback_discipulador,
            data_envio,
            data_aprovacao,
            notificacao_id,
            tipo_resposta
        ) VALUES (
            registro.discipulo_id,
            registro.discipulador_id,
            registro.fase_numero,
            registro.passo_numero,
            NULL, -- pergunta vazia para missão
            NULL, -- resposta_pergunta vazia para missão
            registro.missao_pratica,
            registro.resposta_missao,
            registro.situacao,
            CASE WHEN registro.xp_ganho IS NOT NULL THEN registro.xp_ganho / 2 ELSE NULL END,
            registro.feedback_discipulador,
            registro.data_envio,
            registro.data_aprovacao,
            NULL, -- Sem notificação duplicada
            'missao' -- Tipo: missão
        );

        -- Deletar o registro original
        DELETE FROM historico_respostas_passo WHERE id = registro.id;
    END LOOP;
END $$;

-- 3. Adicionar coluna tipo_resposta se não existir
ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS tipo_resposta text CHECK (tipo_resposta IN ('pergunta', 'missao'));

-- 4. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_historico_tipo_resposta 
ON historico_respostas_passo(discipulo_id, passo_numero, tipo_resposta);

-- 5. Mostrar resultado
SELECT 
    discipulo_id,
    passo_numero,
    tipo_resposta,
    CASE 
        WHEN tipo_resposta = 'pergunta' THEN LEFT(resposta_pergunta, 50)
        WHEN tipo_resposta = 'missao' THEN LEFT(resposta_missao, 50)
    END as resposta_preview,
    situacao,
    xp_ganho
FROM historico_respostas_passo
ORDER BY discipulo_id, passo_numero, tipo_resposta;
