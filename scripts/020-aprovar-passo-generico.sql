-- ============================================================================
-- SCRIPT GENÉRICO DE APROVAÇÃO DE PASSO
-- ============================================================================
-- USO: Substitua DISCIPULO_ID e PASSO_NUMERO pelos valores desejados
-- EXEMPLO: Para aprovar o Passo 3 do Pr. Marcus, use:
--   'd4d131f7-de70-48e6-943b-840f6fe7c51d' e 3
-- ============================================================================

DO $$
DECLARE
    v_discipulo_id UUID := 'd4d131f7-de70-48e6-943b-840f6fe7c51d'; -- SUBSTITUIR
    v_passo_numero INT := 3; -- SUBSTITUIR
    
    v_user_id UUID;
    v_reflexoes_aprovadas INT := 0;
    v_total_xp INT := 0;
    v_mensagem_motivadora TEXT;
    v_mensagens TEXT[] := ARRAY[
        'Excelente progresso! Seu compromisso com o crescimento espiritual é inspirador! Continue assim! 🌟',
        'Parabéns! Cada passo que você dá o aproxima mais de Cristo e do cumprimento de Seu chamado! 🙏',
        'Maravilhoso! Deus está moldando você como um verdadeiro discípulo multiplicador! Continue firme! 💪',
        'Que benção acompanhar seu crescimento! Suas reflexões mostram maturidade espiritual! Glória a Deus! ✨',
        'Extraordinário! Você está se tornando um discipulador de excelência! Deus tem grandes planos para você! 🎯',
        'Muito bem! Cada conquista é um testemunho da graça de Deus operando em sua vida! Continue avançando! 🚀'
    ];
    v_feedback_discipulador TEXT[] := ARRAY[
        'Reflexão profunda e bem fundamentada!',
        'Excelente aplicação prática dos conceitos!',
        'Percebo crescimento genuíno em seu entendimento!',
        'Suas respostas demonstram maturidade espiritual!',
        'Continue refletindo com essa profundidade!',
        'Deus está trabalhando poderosamente em você!'
    ];
BEGIN
    -- 1. Buscar dados do discípulo
    SELECT user_id
    INTO v_user_id
    FROM discipulos
    WHERE id = v_discipulo_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Discípulo não encontrado!';
    END IF;

    -- Selecionar mensagem motivadora aleatória
    v_mensagem_motivadora := v_mensagens[1 + floor(random() * array_length(v_mensagens, 1))::int];

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Aprovando Passo % para discípulo ID: %', v_passo_numero, v_discipulo_id;
    RAISE NOTICE '========================================';

    -- 2. Aprovar REFLEXÕES DE VÍDEOS E ARTIGOS (30 XP cada)
    WITH reflexoes_aprovadas AS (
        UPDATE reflexoes_conteudo
        SET 
            situacao = 'aprovado',
            xp_ganho = 30,
            data_aprovacao = NOW(),
            feedback_discipulador = v_feedback_discipulador[1 + floor(random() * array_length(v_feedback_discipulador, 1))::int]
        WHERE discipulo_id = v_discipulo_id
        AND passo_numero = v_passo_numero
        AND situacao = 'enviado'
        RETURNING id, tipo, xp_ganho
    )
    SELECT COUNT(*), COALESCE(SUM(xp_ganho), 0)
    INTO v_reflexoes_aprovadas, v_total_xp
    FROM reflexoes_aprovadas;

    RAISE NOTICE 'Reflexões aprovadas: % (% XP)', v_reflexoes_aprovadas, v_total_xp;

    -- 3. Aprovar PERGUNTAS REFLEXIVAS (90 XP = 3 perguntas x 30 XP)
    UPDATE perguntas_reflexivas
    SET 
        situacao = 'aprovado',
        xp_ganho = 90,
        data_aprovacao = NOW(),
        feedback_discipulador = 'Respostas reflexivas excelentes! ' || v_feedback_discipulador[1 + floor(random() * array_length(v_feedback_discipulador, 1))::int]
    WHERE discipulo_id = v_discipulo_id
    AND passo_numero = v_passo_numero
    AND situacao = 'enviado';

    IF FOUND THEN
        v_total_xp := v_total_xp + 90;
        RAISE NOTICE 'Perguntas reflexivas aprovadas: 3 (90 XP)';
    END IF;

    -- 4. Atualizar PROGRESSO_FASES
    UPDATE progresso_fases
    SET 
        pontuacao_total = pontuacao_total + v_total_xp,
        completado = TRUE,
        data_completado = NOW(),
        reflexoes_concluidas = (
            SELECT COUNT(*) 
            FROM reflexoes_conteudo 
            WHERE discipulo_id = v_discipulo_id 
            AND passo_numero = v_passo_numero 
            AND situacao = 'aprovado'
        )
    WHERE discipulo_id = v_discipulo_id
    AND passo_numero = v_passo_numero;

    RAISE NOTICE 'XP total adicionado: %', v_total_xp;

    -- 4.1 ATUALIZAR DISCÍPULO: XP Total e Passo Atual
    UPDATE discipulos
    SET 
        xp_total = COALESCE(xp_total, 0) + v_total_xp,
        passo_atual = v_passo_numero + 1,
        updated_at = NOW()
    WHERE id = v_discipulo_id;

    RAISE NOTICE 'Discípulo atualizado: XP total acumulado, avançado para passo %', v_passo_numero + 1;

    -- 4.2 ZERAR PONTUAÇÃO DO PRÓXIMO PASSO
    INSERT INTO progresso_fases (
        discipulo_id,
        fase_numero,
        passo_numero,
        pontuacao_total,
        completado,
        reflexoes_concluidas
    )
    VALUES (
        v_discipulo_id,
        1, -- Assumindo fase 1
        v_passo_numero + 1,
        0, -- Zerar pontuação para começar limpo
        FALSE,
        0
    )
    ON CONFLICT (discipulo_id, fase_numero, passo_numero) 
    DO UPDATE SET
        pontuacao_total = 0,
        completado = FALSE,
        reflexoes_concluidas = 0;

    RAISE NOTICE 'Próximo passo (%) preparado: pontuação zerada', v_passo_numero + 1;

    -- 5. Criar NOTIFICAÇÃO de aprovação
    INSERT INTO notificacoes (
        user_id,
        tipo,
        titulo,
        mensagem,
        lida
    ) VALUES (
        v_user_id,
        'validacao', -- Alterado de 'aprovacao' para 'validacao' (valor válido no check constraint)
        '🎉 Passo ' || v_passo_numero || ' Aprovado!',
        v_mensagem_motivadora || ' Você conquistou ' || v_total_xp || ' XP neste passo! Total de itens aprovados: ' || 
        v_reflexoes_aprovadas || '.',
        FALSE
    );

    RAISE NOTICE 'Notificação criada!';

    -- 6. LIBERAR PRÓXIMO PASSO (se leituras estiverem completas)
    -- Desbloquear efetivamente o próximo passo
    UPDATE discipulos
    SET 
        passo_atual = v_passo_numero + 1
    WHERE id = v_discipulo_id;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'APROVAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE 'Total XP adicionado: %', v_total_xp;
    RAISE NOTICE 'Reflexões aprovadas: %', v_reflexoes_aprovadas;
    RAISE NOTICE 'Perguntas reflexivas: %', CASE WHEN FOUND THEN '3 (aprovadas)' ELSE 'N/A' END;
    RAISE NOTICE 'Próximo passo: %', v_passo_numero + 1;
    RAISE NOTICE '========================================';

END $$;
