-- Diagnosticar por que a tarefa da Viviane não aparece em "Pendentes de Validação"
-- User ID da Viviane: a0e1c579-92f5-42a8-84cc-faf1bbebd73c

DO $$
DECLARE
  viviane_user_id uuid := 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';
  viviane_discipulo_id uuid;
  marcus_user_id uuid := 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';
  
  count_reflexoes int;
  count_progresso_pendente int;
  count_notificacoes int;
  count_mensagens int;
  discipulador_correto boolean;
BEGIN
  RAISE NOTICE '=== DIAGNÓSTICO COMPLETO DA VIVIANE ===';
  
  -- 1. Buscar o discipulo_id
  SELECT id INTO viviane_discipulo_id
  FROM public.discipulos
  WHERE user_id = viviane_user_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '1. IDs:';
  RAISE NOTICE '   - Viviane user_id: %', viviane_user_id;
  RAISE NOTICE '   - Viviane discipulo_id: %', viviane_discipulo_id;
  RAISE NOTICE '   - Marcus user_id (discipulador): %', marcus_user_id;
  
  -- 2. Reflexões
  SELECT COUNT(*) INTO count_reflexoes
  FROM public.reflexoes_conteudo
  WHERE discipulo_id = viviane_discipulo_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '2. Total de reflexões: %', count_reflexoes;
  
  -- 3. Progresso pendente
  SELECT COUNT(*) INTO count_progresso_pendente
  FROM public.progresso_fases
  WHERE discipulo_id = viviane_discipulo_id
    AND status_validacao = 'pendente';
  
  RAISE NOTICE '3. Progressos com missão pendente: %', count_progresso_pendente;
  
  -- 4. Relação discípulo-discipulador
  SELECT EXISTS(
    SELECT 1 FROM public.discipulos
    WHERE user_id = viviane_user_id
      AND discipulador_id = marcus_user_id
  ) INTO discipulador_correto;
  
  RAISE NOTICE '';
  RAISE NOTICE '4. Relação Discípulo-Discipulador:';
  IF discipulador_correto THEN
    RAISE NOTICE '   ✓ Viviane é discípula do Marcus';
  ELSE
    RAISE NOTICE '   ✗ Viviane NÃO é discípula do Marcus!';
  END IF;
  
  -- 5. Notificações
  SELECT COUNT(*) INTO count_notificacoes
  FROM public.notificacoes
  WHERE user_id = marcus_user_id
    AND lida = false;
  
  RAISE NOTICE '';
  RAISE NOTICE '5. Notificações não lidas para Marcus: %', count_notificacoes;
  
  -- 6. Mensagens
  SELECT COUNT(*) INTO count_mensagens
  FROM public.mensagens
  WHERE discipulo_id = viviane_discipulo_id;
  
  RAISE NOTICE '6. Total de mensagens no chat: %', count_mensagens;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== FIM DO DIAGNÓSTICO ===';
  
END $$;
