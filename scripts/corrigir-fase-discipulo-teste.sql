-- Corrigir fase do discípulo TESTE
-- O discípulo está no passo 10 da fase 1, mas o campo fase_atual está errado

DO $$
DECLARE
  v_discipulo_id uuid;
BEGIN
  -- Buscar o discipulo TESTE
  SELECT d.id INTO v_discipulo_id
  FROM discipulos d
  JOIN profiles p ON p.id = d.user_id
  WHERE p.nome_completo ILIKE '%TESTE%'
  LIMIT 1;

  IF v_discipulo_id IS NOT NULL THEN
    -- Corrigir fase_atual para 1 (O Evangelho)
    UPDATE discipulos
    SET fase_atual = 1
    WHERE id = v_discipulo_id;

    -- Garantir que progresso_fases também está correto
    UPDATE progresso_fases
    SET 
      fase_atual = 1,
      passo_atual = 10,
      fase_1_completa = false
    WHERE discipulo_id = v_discipulo_id;

    RAISE NOTICE 'Fase do discípulo TESTE corrigida para Fase 1';
  ELSE
    RAISE NOTICE 'Discípulo TESTE não encontrado';
  END IF;
END $$;
