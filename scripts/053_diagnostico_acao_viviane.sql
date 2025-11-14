-- Ver exatamente o que a Viviane fez: missão ou reflexão?

DO $$
DECLARE
  viviane_user_id uuid := 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';
  viviane_discipulo_id uuid;
BEGIN
  RAISE NOTICE '=== DIAGNÓSTICO DA AÇÃO DA VIVIANE ===';
  
  -- Pegar o discipulo_id
  SELECT id INTO viviane_discipulo_id
  FROM public.discipulos
  WHERE user_id = viviane_user_id;
  
  RAISE NOTICE 'Viviane discipulo_id: %', viviane_discipulo_id;
  
  -- Verificar progresso_fases (MISSÕES)
  RAISE NOTICE '';
  RAISE NOTICE '--- PROGRESSO_FASES (Missões) ---';
  
  SELECT 
    'Passo: ' || passo_numero || 
    ', Enviado: ' || COALESCE(enviado_para_validacao::text, 'false') ||
    ', Status: ' || COALESCE(status_validacao, 'null') ||
    ', Resposta Pergunta: ' || COALESCE(SUBSTRING(resposta_pergunta, 1, 50), 'null') ||
    ', Resposta Missao: ' || COALESCE(SUBSTRING(resposta_missao, 1, 50), 'null')
  FROM public.progresso_fases
  WHERE discipulo_id = viviane_discipulo_id
    AND fase_numero = 1
    AND (
      enviado_para_validacao = true 
      OR resposta_pergunta IS NOT NULL 
      OR resposta_missao IS NOT NULL
    );
  
  -- Verificar reflexoes_conteudo (REFLEXÕES DE VÍDEO/ARTIGO)
  RAISE NOTICE '';
  RAISE NOTICE '--- REFLEXOES_CONTEUDO (Reflexões de vídeo/artigo) ---';
  
  SELECT 
    'Passo: ' || passo_numero ||
    ', Tipo: ' || tipo ||
    ', Título: ' || titulo ||
    ', Reflexão: ' || COALESCE(SUBSTRING(reflexao, 1, 50), 'null')
  FROM public.reflexoes_conteudo
  WHERE discipulo_id = viviane_discipulo_id;
  
  -- Verificar mensagens enviadas
  RAISE NOTICE '';
  RAISE NOTICE '--- MENSAGENS NO CHAT ---';
  
  SELECT 
    'ID: ' || id ||
    ', Mensagem: ' || SUBSTRING(mensagem, 1, 80) ||
    ', Criado em: ' || created_at
  FROM public.mensagens
  WHERE discipulo_id = viviane_discipulo_id
  ORDER BY created_at DESC
  LIMIT 3;
  
  -- Verificar notificações criadas
  RAISE NOTICE '';
  RAISE NOTICE '--- NOTIFICAÇÕES CRIADAS ---';
  
  SELECT 
    'Tipo: ' || tipo ||
    ', Título: ' || titulo ||
    ', Mensagem: ' || mensagem ||
    ', Criado em: ' || created_at
  FROM public.notificacoes
  WHERE user_id = (SELECT discipulador_id FROM public.discipulos WHERE id = viviane_discipulo_id)
  ORDER BY created_at DESC
  LIMIT 3;
  
END $$;
