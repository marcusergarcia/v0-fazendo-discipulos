-- Script para criar um discipulador de referência "12 apostolos"
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

  -- Criar usuário "12 apostolos" no auth (se não existir)
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
  )
  VALUES (
    gen_random_uuid(),
    '12apostolos@fazendodiscipulos.com.br',
    crypt('SenhaSegura123!', gen_salt('bf')), -- Senha: SenhaSegura123!
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO v_apostolos_user_id;

  -- Se já existia, pegar o ID
  IF v_apostolos_user_id IS NULL THEN
    SELECT id INTO v_apostolos_user_id
    FROM auth.users
    WHERE email = '12apostolos@fazendodiscipulos.com.br'
    LIMIT 1;
  END IF;

  -- Criar perfil para "12 apostolos"
  INSERT INTO public.profiles (
    id,
    nome_completo,
    email,
    telefone,
    data_nascimento,
    genero,
    etnia,
    igreja,
    bio,
    status,
    created_at,
    updated_at
  )
  VALUES (
    v_apostolos_user_id,
    '12 Apóstolos',
    '12apostolos@fazendodiscipulos.com.br',
    '(00) 00000-0000',
    '0001-01-01',
    'Masculino',
    'Não informada',
    'Igreja Primitiva',
    'Grupo de referência dos 12 apóstolos de Jesus Cristo - fundamento da fé cristã',
    'ativo',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    status = 'ativo';

  -- Criar registro em discipulos para "12 apostolos" (sem discipulador acima)
  INSERT INTO public.discipulos (
    user_id,
    discipulador_id,
    nivel_atual,
    xp_total,
    fase_atual,
    passo_atual,
    status,
    aprovado_discipulador,
    data_aprovacao_discipulador,
    created_at,
    updated_at
  )
  VALUES (
    v_apostolos_user_id,
    NULL, -- Sem discipulador acima
    'Multiplicador', -- Nível máximo
    10000, -- Total de pontos
    1,
    1,
    'ativo',
    TRUE,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nivel_atual = 'Multiplicador',
    xp_total = 10000,
    status = 'ativo',
    aprovado_discipulador = TRUE;

  -- Atualizar o Marcus para ter "12 apostolos" como discipulador
  IF v_marcus_user_id IS NOT NULL THEN
    UPDATE public.discipulos
    SET 
      discipulador_id = v_apostolos_user_id,
      updated_at = NOW()
    WHERE user_id = v_marcus_user_id;

    RAISE NOTICE 'Discipulador "12 Apóstolos" criado e associado ao Marcus com sucesso!';
  ELSE
    RAISE NOTICE 'Usuário Marcus não encontrado. Discipulador "12 Apóstolos" criado, mas não associado.';
  END IF;

END $$;

-- Comentário
COMMENT ON SCRIPT IS 'Cria o discipulador de referência "12 Apóstolos" e o associa ao Marcus';
