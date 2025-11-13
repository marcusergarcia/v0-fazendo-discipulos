-- Script para criar o discipulador de referência "12 Apóstolos"
-- Este será o discipulador do usuário marcus.macintel@terra.com.br

DO $$
DECLARE
  v_apostolos_user_id UUID;
  v_marcus_user_id UUID;
BEGIN
  -- Buscar o user_id do Marcus
  SELECT id INTO v_marcus_user_id
  FROM auth.users
  WHERE email = 'marcus.macintel@terra.com.br'
  LIMIT 1;

  IF v_marcus_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário Marcus não encontrado';
  END IF;

  RAISE NOTICE 'Marcus user_id encontrado: %', v_marcus_user_id;

  -- Gerar UUID para o usuário "12 Apóstolos"
  v_apostolos_user_id := gen_random_uuid();
  RAISE NOTICE 'Novo UUID para 12 Apóstolos: %', v_apostolos_user_id;

  -- 1. Criar usuário no auth.users
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
    v_apostolos_user_id,
    '12apostolos@fazendodiscipulos.com.br',
    crypt('senha_sistema_nao_usado', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nome_completo":"12 Apóstolos"}'::jsonb,
    false,
    'authenticated'
  );

  RAISE NOTICE '✓ Usuário criado no auth.users';

  -- 2. Criar perfil na tabela profiles
  INSERT INTO public.profiles (
    id,
    email,
    nome_completo,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_apostolos_user_id,
    '12apostolos@fazendodiscipulos.com.br',
    '12 Apóstolos',
    'ativo',
    NOW(),
    NOW()
  );

  RAISE NOTICE '✓ Perfil criado na tabela profiles';

  -- 3. Criar registro na tabela discipulos com nível Multiplicador e 10.000 XP
  INSERT INTO public.discipulos (
    id,
    user_id,
    nivel_atual,
    xp_total,
    fase_atual,
    passo_atual,
    status,
    discipulador_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_apostolos_user_id,
    'Multiplicador',
    10000,
    1,
    1,
    'ativo',
    NULL, -- Não tem discipulador acima dele
    NOW(),
    NOW()
  );

  RAISE NOTICE '✓ Discípulo criado com nível Multiplicador e 10.000 XP';

  -- 4. Atualizar o perfil do Marcus para ter "12 Apóstolos" como discipulador
  UPDATE public.discipulos
  SET discipulador_id = v_apostolos_user_id,
      updated_at = NOW()
  WHERE user_id = v_marcus_user_id;

  RAISE NOTICE '✓ Marcus agora tem "12 Apóstolos" como discipulador';

  RAISE NOTICE '✅ Script concluído com sucesso!';
  RAISE NOTICE 'Discipulador "12 Apóstolos" criado e associado ao Marcus';

END $$;
