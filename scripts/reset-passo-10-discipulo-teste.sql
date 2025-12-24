-- Script para resetar o passo 10 do discípulo TESTE
-- Execute este script para limpar todos os dados do passo 10 e permitir novo teste

-- 1. Buscar o discipulo_id do usuário teste@gmail.com
DO $$
DECLARE
    v_discipulo_id UUID;
BEGIN
    -- Buscar o discipulo_id
    SELECT id INTO v_discipulo_id
    FROM discipulos
    WHERE user_id = (SELECT id FROM profiles WHERE email = 'teste@gmail.com');

    IF v_discipulo_id IS NULL THEN
        RAISE NOTICE 'Discípulo TESTE não encontrado';
        RETURN;
    END IF;

    RAISE NOTICE 'Discípulo TESTE encontrado: %', v_discipulo_id;

    -- 2. Deletar todas as perguntas reflexivas do passo 10
    DELETE FROM perguntas_reflexivas
    WHERE discipulo_id = v_discipulo_id
      AND fase_numero = 1
      AND passo_numero = 10;
    
    RAISE NOTICE 'Perguntas reflexivas do passo 10 deletadas';

    -- 3. Deletar todas as reflexões (artigos e vídeos) do passo 10
    DELETE FROM reflexoes_passo
    WHERE discipulo_id = v_discipulo_id
      AND fase_numero = 1
      AND passo_numero = 10;
    
    RAISE NOTICE 'Reflexões (artigos/vídeos) do passo 10 deletadas';

    -- 4. Deletar notificações relacionadas ao passo 10
    DELETE FROM notificacoes
    WHERE discipulo_id = v_discipulo_id
      AND (
        mensagem LIKE '%Passo 10%'
        OR mensagem LIKE '%passo 10%'
      );
    
    RAISE NOTICE 'Notificações do passo 10 deletadas';

    -- Corrigido para usar atribuição única com ARRAY_REMOVE aninhado
    -- 5. Resetar o progresso do passo 10
    UPDATE progresso_fases
    SET 
        videos_assistidos = ARRAY_REMOVE(
            ARRAY_REMOVE(
                ARRAY_REMOVE(
                    ARRAY_REMOVE(videos_assistidos, 'video_passo_10_1'),
                'video_passo_10_2'),
            'video_passo_10_3'),
        'video_passo_10_4'),
        artigos_lidos = ARRAY_REMOVE(
            ARRAY_REMOVE(
                ARRAY_REMOVE(
                    ARRAY_REMOVE(artigos_lidos, 'artigo_passo_10_1'),
                'artigo_passo_10_2'),
            'artigo_passo_10_3'),
        'artigo_passo_10_4'),
        passo_atual = 10,
        celebracao_vista = false,
        enviado_para_validacao = false,
        pontuacao_passo_atual = 0,
        data_inicio_passo = NOW()
    WHERE discipulo_id = v_discipulo_id;

    RAISE NOTICE 'Progresso do passo 10 resetado';

    -- 6. Atualizar o discípulo para estar no passo 10
    UPDATE discipulos
    SET 
        passo_atual = 10,
        xp_total = GREATEST(0, xp_total - 150) -- Remover XP do passo 10 (150 XP)
    WHERE id = v_discipulo_id;
    
    RAISE NOTICE 'Discípulo resetado para o passo 10';

    -- 7. Mostrar status final
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESET COMPLETO DO PASSO 10';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Passo atual: %', (SELECT passo_atual FROM discipulos WHERE id = v_discipulo_id);
    RAISE NOTICE 'XP total: %', (SELECT xp_total FROM discipulos WHERE id = v_discipulo_id);
    RAISE NOTICE '========================================';
    
END $$;
