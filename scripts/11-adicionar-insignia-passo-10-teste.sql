-- Adicionar insígnia faltante do Passo 10 para o discípulo TESTE
DO $$
DECLARE
  v_discipulo_id uuid;
  v_insignias text[];
BEGIN
  -- Buscar o discípulo TESTE
  SELECT d.id INTO v_discipulo_id
  FROM discipulos d
  JOIN profiles p ON d.user_id = p.id
  WHERE p.nome_completo ILIKE '%TESTE%'
  LIMIT 1;

  IF v_discipulo_id IS NULL THEN
    RAISE NOTICE 'Discípulo TESTE não encontrado';
    RETURN;
  END IF;

  -- Buscar as insígnias atuais
  SELECT insignias INTO v_insignias
  FROM recompensas
  WHERE discipulo_id = v_discipulo_id;

  -- Verificar se já tem a insígnia do Passo 10
  IF NOT ('Passo 10 Concluído' = ANY(v_insignias)) THEN
    -- Adicionar a insígnia do Passo 10
    UPDATE recompensas
    SET 
      insignias = array_append(insignias, 'Passo 10 Concluído'),
      updated_at = NOW()
    WHERE discipulo_id = v_discipulo_id;
    
    RAISE NOTICE 'Insígnia do Passo 10 adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Insígnia do Passo 10 já existe';
  END IF;
END $$;
