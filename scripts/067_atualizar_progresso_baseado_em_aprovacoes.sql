-- Script para atualizar progresso_fases do discípulo d4d131f7-de70-48e6-943b-840f6fe7c51d
-- baseado nas aprovações em historico_respostas_passo e reflexoes_conteudo

-- Passo 1: Verificar reflexões aprovadas
DO $$
DECLARE
    v_discipulo_id UUID := 'd4d131f7-de70-48e6-943b-840f6fe7c51d';
    v_fase_numero INT := 1;
    v_passo_numero INT := 1;
    v_xp_reflexoes INT := 0;
    v_xp_respostas INT := 0;
    v_xp_total INT := 0;
    v_reflexoes_aprovadas INT := 0;
    v_respostas_aprovadas INT := 0;
    v_videos_array TEXT[];
    v_artigos_array TEXT[];
    v_completado BOOLEAN := false;
BEGIN
    -- Somar XP de reflexões aprovadas
    SELECT 
        COALESCE(SUM(xp_ganho), 0),
        COUNT(*),
        ARRAY_AGG(conteudo_id) FILTER (WHERE tipo = 'video'),
        ARRAY_AGG(conteudo_id) FILTER (WHERE tipo = 'artigo')
    INTO 
        v_xp_reflexoes,
        v_reflexoes_aprovadas,
        v_videos_array,
        v_artigos_array
    FROM reflexoes_conteudo
    WHERE discipulo_id = v_discipulo_id
      AND fase_numero = v_fase_numero
      AND passo_numero = v_passo_numero
      AND situacao = 'aprovado';

    -- Somar XP de respostas aprovadas (pergunta + missão)
    SELECT 
        COALESCE(SUM(xp_ganho), 0),
        COUNT(*)
    INTO 
        v_xp_respostas,
        v_respostas_aprovadas
    FROM historico_respostas_passo
    WHERE discipulo_id = v_discipulo_id
      AND fase_numero = v_fase_numero
      AND passo_numero = v_passo_numero
      AND situacao = 'aprovado';

    -- Calcular XP total
    v_xp_total := v_xp_reflexoes + v_xp_respostas;

    -- Verificar se está completo (6 reflexões + 2 respostas = 8 itens)
    v_completado := (v_reflexoes_aprovadas >= 6 AND v_respostas_aprovadas >= 2);

    -- Removido updated_at que não existe em progresso_fases
    -- Atualizar progresso_fases
    UPDATE progresso_fases
    SET 
        pontuacao_total = v_xp_total,
        reflexoes_concluidas = v_reflexoes_aprovadas,
        videos_assistidos = COALESCE(v_videos_array, ARRAY[]::TEXT[]),
        artigos_lidos = COALESCE(v_artigos_array, ARRAY[]::TEXT[]),
        completado = v_completado,
        data_completado = CASE 
            WHEN v_completado AND data_completado IS NULL THEN NOW()
            ELSE data_completado
        END
    WHERE discipulo_id = v_discipulo_id
      AND fase_numero = v_fase_numero
      AND passo_numero = v_passo_numero;

    -- Se completou, atualizar passo_atual do discípulo
    IF v_completado THEN
        UPDATE discipulos
        SET 
            passo_atual = 2,
            xp_total = xp_total + v_xp_total,
            updated_at = NOW()
        WHERE id = v_discipulo_id
          AND passo_atual = 1;
    END IF;

    -- Exibir relatório
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RELATÓRIO DE ATUALIZAÇÃO DE PROGRESSO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Discípulo ID: %', v_discipulo_id;
    RAISE NOTICE 'Fase: %, Passo: %', v_fase_numero, v_passo_numero;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Reflexões Aprovadas: % de 6', v_reflexoes_aprovadas;
    RAISE NOTICE 'XP de Reflexões: %', v_xp_reflexoes;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Respostas Aprovadas: % de 2', v_respostas_aprovadas;
    RAISE NOTICE 'XP de Respostas: %', v_xp_respostas;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'XP Total do Passo: %', v_xp_total;
    RAISE NOTICE 'Passo Completo: %', v_completado;
    RAISE NOTICE '========================================';
    
    IF v_completado THEN
        RAISE NOTICE '✅ PASSO 1 COMPLETADO! PASSO 2 LIBERADO!';
    ELSE
        RAISE NOTICE '⚠️ Faltam % reflexões e % respostas', 
            GREATEST(0, 6 - v_reflexoes_aprovadas),
            GREATEST(0, 2 - v_respostas_aprovadas);
    END IF;
    RAISE NOTICE '========================================';

END $$;

-- Verificar resultado final
SELECT 
    d.nome_completo_temp AS discipulo,
    d.passo_atual,
    pf.fase_numero,
    pf.passo_numero,
    pf.reflexoes_concluidas,
    pf.pontuacao_total,
    pf.completado,
    pf.data_completado,
    ARRAY_LENGTH(pf.videos_assistidos, 1) AS videos,
    ARRAY_LENGTH(pf.artigos_lidos, 1) AS artigos
FROM progresso_fases pf
JOIN discipulos d ON d.id = pf.discipulo_id
WHERE pf.discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND pf.fase_numero = 1
  AND pf.passo_numero = 1;
