-- Script para aprovar as 3 perguntas reflexivas do Pr. Marcus no Passo 1
-- e adicionar 90 XP (30 XP por pergunta reflexiva)

DO $$
DECLARE
    v_discipulo_id uuid := 'd4d131f7-de70-48e6-943b-840f6fe7c51d'; -- ID direto do Pr. Marcus
    v_perguntas_id uuid;
    v_progresso_id uuid;
    v_pontuacao_atual integer;
    v_user_id uuid;
BEGIN
    -- Buscar user_id do discípulo ao invés de discipulador
    SELECT user_id INTO v_user_id
    FROM discipulos
    WHERE id = v_discipulo_id;

    RAISE NOTICE 'Discípulo Pr. Marcus ID: %', v_discipulo_id;

    -- 2. Buscar a entrada de perguntas reflexivas do Passo 1
    SELECT id INTO v_perguntas_id
    FROM perguntas_reflexivas
    WHERE discipulo_id = v_discipulo_id
    AND passo_numero = 1
    AND situacao = 'enviado';

    IF v_perguntas_id IS NULL THEN
        RAISE EXCEPTION 'Perguntas reflexivas do Passo 1 não encontradas ou já aprovadas';
    END IF;

    RAISE NOTICE 'Perguntas reflexivas encontradas: %', v_perguntas_id;

    -- Removido updated_at da tabela perguntas_reflexivas
    -- 3. Aprovar as perguntas reflexivas e adicionar 90 XP (30 por pergunta)
    UPDATE perguntas_reflexivas
    SET 
        situacao = 'aprovado',
        xp_ganho = 90,
        feedback_discipulador = 'Parabéns! Suas respostas às perguntas reflexivas demonstram excelente compreensão do conteúdo.'
    WHERE id = v_perguntas_id;

    RAISE NOTICE 'Perguntas reflexivas aprovadas com 90 XP';

    -- 4. Atualizar o progresso_fases - adicionar 90 XP à pontuação total
    SELECT id, pontuacao_total INTO v_progresso_id, v_pontuacao_atual
    FROM progresso_fases
    WHERE discipulo_id = v_discipulo_id
    AND fase_numero = 1
    AND passo_numero = 1;

    IF v_progresso_id IS NULL THEN
        RAISE EXCEPTION 'Progresso do Passo 1 não encontrado';
    END IF;

    -- Removido updated_at da tabela progresso_fases e adicionado data_completado
    UPDATE progresso_fases
    SET 
        pontuacao_total = COALESCE(v_pontuacao_atual, 0) + 90,
        completado = true,
        data_completado = NOW()
    WHERE id = v_progresso_id;

    RAISE NOTICE 'Progresso atualizado: % + 90 XP = % XP total', v_pontuacao_atual, COALESCE(v_pontuacao_atual, 0) + 90;

    -- 5. Criar notificação para o discípulo
    INSERT INTO notificacoes (
        user_id,
        discipulo_id,
        tipo,
        titulo,
        mensagem,
        lida,
        created_at
    ) VALUES (
        v_user_id,
        v_discipulo_id,
        'perguntas_reflexivas',
        'Perguntas Reflexivas Aprovadas! 🎉',
        'Suas 3 perguntas reflexivas do Passo 1 foram aprovadas! Você ganhou 90 XP (30 XP por pergunta). Continue seu progresso no próximo passo!',
        false,
        NOW()
    );

    RAISE NOTICE 'Notificação criada para o discípulo';

    -- 6. Exibir resumo final
    RAISE NOTICE '=== RESUMO DA APROVAÇÃO ===';
    RAISE NOTICE 'Discípulo: Pr. Marcus (ID: %)', v_discipulo_id;
    RAISE NOTICE 'Passo: 1';
    RAISE NOTICE 'XP Ganho: 90 (30 por pergunta)';
    RAISE NOTICE 'Status: Aprovado e Passo Completado';
    RAISE NOTICE '===========================';

END $$;

-- Removido updated_at do SELECT final
-- Verificar o resultado
SELECT 
    pr.passo_numero,
    pr.situacao,
    pr.xp_ganho,
    pr.data_envio,
    pf.pontuacao_total,
    pf.completado,
    pf.data_completado
FROM perguntas_reflexivas pr
JOIN progresso_fases pf ON pf.discipulo_id = pr.discipulo_id 
    AND pf.passo_numero = pr.passo_numero
WHERE pr.discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
AND pr.passo_numero = 1;
