-- Corrigir progresso_fases para o discípulo TESTE
-- Garantir que fase_atual seja 1 (O Evangelho) e passo_atual seja 10

DO $$
DECLARE
    v_discipulo_id UUID;
BEGIN
    -- Buscar o discipulo TESTE
    SELECT d.id INTO v_discipulo_id
    FROM discipulos d
    JOIN profiles p ON d.user_id = p.id
    WHERE p.nome_completo ILIKE '%TESTE%'
    LIMIT 1;

    IF v_discipulo_id IS NOT NULL THEN
        -- Atualizar progresso_fases
        UPDATE progresso_fases
        SET 
            fase_atual = 1,
            passo_atual = 10,
            fase_1_completa = false,
            celebracao_vista = false
        WHERE discipulo_id = v_discipulo_id;

        RAISE NOTICE 'Progresso_fases corrigido para discípulo TESTE - fase_atual: 1, passo_atual: 10';
    ELSE
        RAISE NOTICE 'Discípulo TESTE não encontrado';
    END IF;
END $$;
