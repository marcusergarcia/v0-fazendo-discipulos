-- Script para deletar COMPLETAMENTE todos os dados do discípulo TESTE
-- ATENÇÃO: Esta operação é IRREVERSÍVEL!

DO $$
DECLARE
    v_discipulo_id UUID;
    v_user_id UUID;
BEGIN
    -- 1. Encontrar o ID do discípulo TESTE
    SELECT id, user_id INTO v_discipulo_id, v_user_id
    FROM discipulos
    WHERE nome_completo_temp ILIKE '%teste%'
    LIMIT 1;

    IF v_discipulo_id IS NULL THEN
        RAISE NOTICE 'Discípulo TESTE não encontrado!';
        RETURN;
    END IF;

    RAISE NOTICE 'Deletando dados do discípulo: %', v_discipulo_id;

    -- 2. Deletar notificações
    DELETE FROM notificacoes WHERE discipulo_id = v_discipulo_id;
    RAISE NOTICE 'Notificações deletadas';

    -- 3. Deletar perguntas reflexivas
    DELETE FROM perguntas_reflexivas WHERE discipulo_id = v_discipulo_id;
    RAISE NOTICE 'Perguntas reflexivas deletadas';

    -- 4. Deletar reflexões conteúdo (tabela antiga)
    DELETE FROM reflexoes_conteudo WHERE discipulo_id = v_discipulo_id;
    RAISE NOTICE 'Reflexões conteúdo deletadas';

    -- 5. Deletar reflexões passo (tabela nova otimizada)
    DELETE FROM reflexoes_passo WHERE discipulo_id = v_discipulo_id;
    RAISE NOTICE 'Reflexões passo deletadas';

    -- 6. Deletar mensagens
    DELETE FROM mensagens WHERE discipulo_id = v_discipulo_id OR remetente_id = v_discipulo_id;
    RAISE NOTICE 'Mensagens deletadas';

    -- 7. Deletar leituras de capítulos
    DELETE FROM leituras_capitulos WHERE discipulo_id = v_discipulo_id;
    RAISE NOTICE 'Leituras de capítulos deletadas';

    -- 8. Deletar highlights da bíblia
    IF v_user_id IS NOT NULL THEN
        DELETE FROM highlights_biblia WHERE usuario_id = v_user_id;
        RAISE NOTICE 'Highlights bíblia deletados';
    END IF;

    -- 9. Deletar progresso de fases
    DELETE FROM progresso_fases WHERE discipulo_id = v_discipulo_id;
    RAISE NOTICE 'Progresso fases deletado';

    -- 10. Deletar recompensas
    DELETE FROM recompensas WHERE discipulo_id = v_discipulo_id;
    RAISE NOTICE 'Recompensas deletadas';

    -- 11. Deletar convites usados pelo discípulo
    UPDATE convites 
    SET usado_por = NULL, usado = false, data_uso = NULL 
    WHERE usado_por = v_discipulo_id;
    RAISE NOTICE 'Convites resetados';

    -- 12. Deletar o perfil do usuário
    IF v_user_id IS NOT NULL THEN
        DELETE FROM profiles WHERE id = v_user_id;
        RAISE NOTICE 'Profile deletado';
    END IF;

    -- 13. Deletar o registro do discípulo
    DELETE FROM discipulos WHERE id = v_discipulo_id;
    RAISE NOTICE 'Registro do discípulo deletado';

    RAISE NOTICE '✓ TODOS os dados do discípulo TESTE foram deletados com sucesso!';
    
END $$;

-- Verificação final: contar registros restantes
SELECT 
  'discipulos' as tabela,
  COUNT(*) as registros_restantes
FROM discipulos
WHERE nome_completo_temp ILIKE '%teste%'

UNION ALL

SELECT 'progresso_fases', COUNT(*)
FROM progresso_fases pf
WHERE NOT EXISTS (SELECT 1 FROM discipulos d WHERE d.id = pf.discipulo_id)

UNION ALL

SELECT 'reflexoes_conteudo', COUNT(*)
FROM reflexoes_conteudo rc
WHERE NOT EXISTS (SELECT 1 FROM discipulos d WHERE d.id = rc.discipulo_id)

UNION ALL

SELECT 'perguntas_reflexivas', COUNT(*)
FROM perguntas_reflexivas pr
WHERE NOT EXISTS (SELECT 1 FROM discipulos d WHERE d.id = pr.discipulo_id);
