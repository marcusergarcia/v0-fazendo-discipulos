-- Script DEFINITIVO usando EMAIL para encontrar Marcus
-- Não depende de UUIDs fixos que podem estar errados

DO $$
DECLARE
  v_12apostolos_id UUID;
  v_marcus_id UUID;
BEGIN
  -- Buscar ID do 12 Apóstolos pelo email
  SELECT id INTO v_12apostolos_id
  FROM auth.users
  WHERE email LIKE '%12apostolos%' OR email LIKE '%apostolos%'
  LIMIT 1;

  -- Buscar ID do Marcus pelo email
  SELECT id INTO v_marcus_id
  FROM auth.users
  WHERE email = 'marcus.macintel@terra.com.br'
  LIMIT 1;

  -- Verificar se encontrou ambos
  IF v_12apostolos_id IS NULL THEN
    RAISE EXCEPTION '12 Apóstolos não encontrado em auth.users';
  END IF;

  IF v_marcus_id IS NULL THEN
    RAISE EXCEPTION 'Marcus não encontrado em auth.users';
  END IF;

  RAISE NOTICE '12 Apóstolos ID: %', v_12apostolos_id;
  RAISE NOTICE 'Marcus ID: %', v_marcus_id;

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

  RAISE NOTICE 'Associação concluída com sucesso!';
END $$;

-- Verificar o resultado
SELECT 
  p.nome_completo as discipulo,
  p.email as discipulo_email,
  pd.nome_completo as discipulador,
  d.nivel_atual as nivel,
  d.xp_total as xp
FROM discipulos d
JOIN profiles p ON p.id = d.user_id
LEFT JOIN profiles pd ON pd.id = d.discipulador_id
WHERE p.email IN ('marcus.macintel@terra.com.br', '12apostolos@fazendodiscipulos.com')
ORDER BY d.discipulador_id NULLS FIRST;
