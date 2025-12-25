-- Adicionar a insígnia do Passo 10 que está faltando para o discípulo TESTE
DO $$
DECLARE
  v_discipulo_id uuid;
  v_recompensa_id uuid;
  v_insignias_atuais text[];
BEGIN
  -- Buscar o discípulo TESTE
  SELECT d.id INTO v_discipulo_id
  FROM discipulos d
  JOIN profiles p ON p.id = d.user_id
  WHERE p.nome_completo ILIKE '%TESTE%'
  LIMIT 1;
  
  IF v_discipulo_id IS NOT NULL THEN
    -- Buscar a recompensa atual
    SELECT id, insignias INTO v_recompensa_id, v_insignias_atuais
    FROM recompensas
    WHERE discipulo_id = v_discipulo_id
    LIMIT 1;
    
    -- Verificar se a insígnia do Passo 10 já existe
    IF NOT ('Passo 10 Concluído' = ANY(v_insignias_atuais)) THEN
      -- Adicionar a insígnia do Passo 10
      UPDATE recompensas
      SET insignias = array_append(insignias, 'Passo 10 Concluído'),
          updated_at = now()
      WHERE id = v_recompensa_id;
      
      RAISE NOTICE 'Insígnia do Passo 10 adicionada com sucesso';
    ELSE
      RAISE NOTICE 'Insígnia do Passo 10 já existe';
    END IF;
  ELSE
    RAISE NOTICE 'Discípulo TESTE não encontrado';
  END IF;
END $$;
