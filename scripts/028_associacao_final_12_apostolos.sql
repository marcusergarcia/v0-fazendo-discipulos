-- Script FINAL para garantir que Marcus está associado ao 12 Apóstolos
-- Este script usa apenas UPDATE para associar o discipulador

DO $$
DECLARE
  v_12apostolos_id UUID;
  v_marcus_id UUID;
BEGIN
  -- Buscar ID do 12 Apóstolos na tabela discipulos
  SELECT user_id INTO v_12apostolos_id
  FROM discipulos
  WHERE id = 'ac30ff05-cefa-49ec-ae4d-cf95469ecf21'::UUID;

  -- Buscar ID do Marcus na tabela discipulos  
  SELECT user_id INTO v_marcus_id
  FROM discipulos
  WHERE id = 'd4d13f7-de70-48e6-943b-840f6fe7c51d'::UUID;

  -- Verificar se encontrou ambos
  IF v_12apostolos_id IS NULL THEN
    RAISE EXCEPTION '12 Apóstolos não encontrado na tabela discipulos';
  END IF;

  IF v_marcus_id IS NULL THEN
    RAISE EXCEPTION 'Marcus não encontrado na tabela discipulos';
  END IF;

  -- Atualizar Marcus para ter 12 Apóstolos como discipulador
  UPDATE discipulos
  SET discipulador_id = v_12apostolos_id
  WHERE user_id = v_marcus_id;

  -- Garantir que o perfil do 12 Apóstolos existe
  INSERT INTO profiles (id, nome_completo, email, created_at, updated_at)
  VALUES (
    v_12apostolos_id,
    '12 Apóstolos',
    (SELECT email FROM auth.users WHERE id = v_12apostolos_id),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET nome_completo = '12 Apóstolos',
      updated_at = NOW();

  RAISE NOTICE 'Associação concluída: Marcus (%) -> 12 Apóstolos (%)', v_marcus_id, v_12apostolos_id;
END $$;

-- Verificar o resultado
SELECT 
  d.id as discipulo_id,
  p.nome_completo as discipulo_nome,
  d.discipulador_id,
  pd.nome_completo as discipulador_nome
FROM discipulos d
JOIN profiles p ON p.id = d.user_id
LEFT JOIN profiles pd ON pd.id = d.discipulador_id
WHERE d.id IN ('ac30ff05-cefa-49ec-ae4d-cf95469ecf21'::UUID, 'd4d13f7-de70-48e6-943b-840f6fe7c51d'::UUID)
ORDER BY d.discipulador_id NULLS FIRST;
