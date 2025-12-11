-- Script para remover completamente o discípulo TESTE e todos os seus dados
-- Isso permite testar o fluxo completo desde o início

-- 1. Buscar o ID do discípulo TESTE
DO $$
DECLARE
  v_discipulo_id UUID;
  v_user_id UUID;
BEGIN
  -- Usando nome_completo_temp e email_temporario ao invés de nome
  -- Buscar o discípulo TESTE
  SELECT id, user_id INTO v_discipulo_id, v_user_id
  FROM discipulos
  WHERE nome_completo_temp = 'TESTE' OR email_temporario = 'teste@teste.com';

  IF v_discipulo_id IS NULL THEN
    RAISE NOTICE 'Discípulo TESTE não encontrado.';
    RETURN;
  END IF;

  RAISE NOTICE 'Removendo discípulo TESTE (ID: %)', v_discipulo_id;

  -- 2. Remover notificações relacionadas
  DELETE FROM notificacoes
  WHERE discipulo_id = v_discipulo_id;
  RAISE NOTICE 'Notificações removidas';

  -- 3. Remover reflexões de passo
  DELETE FROM reflexoes_passo
  WHERE discipulo_id = v_discipulo_id;
  RAISE NOTICE 'Reflexões de passo removidas';

  -- 4. Remover perguntas reflexivas
  DELETE FROM perguntas_reflexivas
  WHERE discipulo_id = v_discipulo_id;
  RAISE NOTICE 'Perguntas reflexivas removidas';

  -- Usando leituras_capitulos ao invés de leituras_biblicas
  -- 5. Remover leituras de capítulos
  DELETE FROM leituras_capitulos
  WHERE discipulo_id = v_discipulo_id;
  RAISE NOTICE 'Leituras de capítulos removidas';

  -- Adicionando remoção de highlights_biblia
  -- 6. Remover highlights da bíblia
  DELETE FROM highlights_biblia
  WHERE usuario_id = v_user_id;
  RAISE NOTICE 'Highlights da bíblia removidos';

  -- 7. Remover progresso das fases
  DELETE FROM progresso_fases
  WHERE discipulo_id = v_discipulo_id;
  RAISE NOTICE 'Progresso das fases removido';

  -- Adicionando remoção de recompensas
  -- 8. Remover recompensas
  DELETE FROM recompensas
  WHERE discipulo_id = v_discipulo_id;
  RAISE NOTICE 'Recompensas removidas';

  -- Adicionando remoção de mensagens
  -- 9. Remover mensagens
  DELETE FROM mensagens
  WHERE discipulo_id = v_discipulo_id OR remetente_id = v_user_id;
  RAISE NOTICE 'Mensagens removidas';

  -- 10. Remover o discípulo
  DELETE FROM discipulos
  WHERE id = v_discipulo_id;
  RAISE NOTICE 'Discípulo removido';

  -- Adicionando remoção do perfil
  -- 11. Remover perfil
  IF v_user_id IS NOT NULL THEN
    DELETE FROM profiles
    WHERE id = v_user_id;
    RAISE NOTICE 'Perfil removido (ID: %)', v_user_id;
  END IF;

  -- 12. Remover usuário do auth (se existir)
  IF v_user_id IS NOT NULL THEN
    DELETE FROM auth.users
    WHERE id = v_user_id;
    RAISE NOTICE 'Usuário de autenticação removido (ID: %)', v_user_id;
  END IF;

  RAISE NOTICE '✅ Discípulo TESTE e todos os seus dados foram removidos com sucesso!';
END $$;
