-- Script para garantir que o discipulador "12 Apóstolos" existe e está associado ao Marcus

DO $$
DECLARE
  v_apostolos_user_id UUID;
  v_marcus_user_id UUID;
  v_apostolos_profile_exists BOOLEAN;
  v_apostolos_discipulo_exists BOOLEAN;
BEGIN
  -- 1. Buscar o user_id do Marcus
  SELECT id INTO v_marcus_user_id
  FROM auth.users
  WHERE email = 'marcus.macintel@terra.com.br'
  LIMIT 1;

  IF v_marcus_user_id IS NULL THEN
    RAISE NOTICE 'Usuário Marcus não encontrado';
    RETURN;
  END IF;

  RAISE NOTICE 'Marcus user_id encontrado: %', v_marcus_user_id;

  -- 2. Buscar ou criar o usuário "12 Apóstolos" no auth.users
  SELECT id INTO v_apostolos_user_id
  FROM auth.users
  WHERE email = '12apostolos@fazendodiscipulos.com'
  LIMIT 1;

  IF v_apostolos_user_id IS NULL THEN
    -- Criar usuário no auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      '12apostolos@fazendodiscipulos.com',
      crypt('12apostolos_senha_forte', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      'authenticated'
    )
    RETURNING id INTO v_apostolos_user_id;
    
    RAISE NOTICE '12 Apóstolos user criado com ID: %', v_apostolos_user_id;
  ELSE
    RAISE NOTICE '12 Apóstolos user já existe com ID: %', v_apostolos_user_id;
  END IF;

  -- 3. Verificar e criar profile para "12 Apóstolos"
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = v_apostolos_user_id
  ) INTO v_apostolos_profile_exists;

  IF NOT v_apostolos_profile_exists THEN
    -- Adicionado campo email obrigatório
    INSERT INTO profiles (
      id,
      email,
      nome_completo,
      genero,
      data_nascimento,
      telefone,
      igreja,
      bio,
      etnia,
      status
    ) VALUES (
      v_apostolos_user_id,
      '12apostolos@fazendodiscipulos.com',
      '12 Apóstolos',
      'masculino',
      '0001-01-01',
      '',
      'Igreja Universal',
      'Representando os primeiros discípulos de Cristo',
      NULL,
      'ativo'
    );
    RAISE NOTICE 'Profile 12 Apóstolos criado';
  ELSE
    -- Atualizar se já existe
    UPDATE profiles
    SET nome_completo = '12 Apóstolos',
        status = 'ativo'
    WHERE id = v_apostolos_user_id;
    RAISE NOTICE 'Profile 12 Apóstolos atualizado';
  END IF;

  -- 4. Verificar e criar discipulo para "12 Apóstolos"
  SELECT EXISTS(
    SELECT 1 FROM discipulos WHERE user_id = v_apostolos_user_id
  ) INTO v_apostolos_discipulo_exists;

  IF NOT v_apostolos_discipulo_exists THEN
    INSERT INTO discipulos (
      user_id,
      nivel_atual,
      xp_total,
      discipulador_id,
      status
    ) VALUES (
      v_apostolos_user_id,
      'Multiplicador',
      10000,
      NULL,
      'ativo'
    );
    RAISE NOTICE 'Discipulo 12 Apóstolos criado com nível Multiplicador';
  ELSE
    -- Atualizar se já existe
    UPDATE discipulos
    SET nivel_atual = 'Multiplicador',
        xp_total = 10000,
        discipulador_id = NULL,
        status = 'ativo'
    WHERE user_id = v_apostolos_user_id;
    RAISE NOTICE 'Discipulo 12 Apóstolos atualizado';
  END IF;

  -- 5. Atualizar o discipulo do Marcus para ter "12 Apóstolos" como discipulador
  UPDATE discipulos
  SET discipulador_id = v_apostolos_user_id,
      status = 'ativo'
  WHERE user_id = v_marcus_user_id;

  RAISE NOTICE 'Marcus agora tem 12 Apóstolos como discipulador';

  -- 6. Garantir que o profile do Marcus tenha status ativo
  UPDATE profiles
  SET status = 'ativo'
  WHERE id = v_marcus_user_id;

  RAISE NOTICE 'Setup completo!';
END $$;
