-- Script para limpar duplicados de "12 Apóstolos" e garantir associação correta
-- Este script mantém apenas um registro e corrige a relação com Marcus

DO $$
DECLARE
  v_apostolos_user_id UUID;
  v_apostolos_profile_exists BOOLEAN;
  v_marcus_user_id UUID;
  v_count INT;
BEGIN
  RAISE NOTICE 'Iniciando limpeza de duplicados...';
  
  -- 1. Contar quantos "12apostolos@fazendodiscipulos.com" existem
  SELECT COUNT(*) INTO v_count
  FROM auth.users
  WHERE email = '12apostolos@fazendodiscipulos.com';
  
  RAISE NOTICE 'Encontrados % registros de 12 Apóstolos em auth.users', v_count;
  
  -- 2. Deletar TODOS os registros existentes (auth.users, profiles, discipulos)
  -- Primeiro deletar de discipulos e profiles (dependências)
  DELETE FROM discipulos 
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = '12apostolos@fazendodiscipulos.com'
  );
  
  DELETE FROM profiles 
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = '12apostolos@fazendodiscipulos.com'
  );
  
  -- Depois deletar de auth.users
  DELETE FROM auth.users WHERE email = '12apostolos@fazendodiscipulos.com';
  
  RAISE NOTICE 'Registros duplicados removidos';
  
  -- 3. Criar um NOVO registro único
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    '12apostolos@fazendodiscipulos.com',
    crypt('12apostolos_senha_segura', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    ''
  )
  RETURNING id INTO v_apostolos_user_id;
  
  RAISE NOTICE 'Novo usuário 12 Apóstolos criado com ID: %', v_apostolos_user_id;
  
  -- 4. Criar profile para 12 Apóstolos
  INSERT INTO profiles (
    id,
    email,
    nome_completo,
    genero,
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
    NULL,
    'Igreja Primitiva',
    'Discipulador de referência do sistema',
    NULL,
    'ativo'
  );
  
  RAISE NOTICE 'Profile de 12 Apóstolos criado';
  
  -- 5. Criar registro de discípulo para 12 Apóstolos (sem discipulador, ele é o topo)
  INSERT INTO discipulos (
    user_id,
    discipulador_id,
    nivel_atual,
    xp_total,
    status
  ) VALUES (
    v_apostolos_user_id,
    NULL, -- Sem discipulador, ele é o topo da hierarquia
    'Multiplicador',
    10000,
    'ativo'
  );
  
  RAISE NOTICE 'Registro de discípulo de 12 Apóstolos criado';
  
  -- 6. Buscar o ID do Marcus
  SELECT id INTO v_marcus_user_id
  FROM auth.users
  WHERE email = 'marcus.macintel@terra.com.br'
  LIMIT 1;
  
  IF v_marcus_user_id IS NULL THEN
    RAISE NOTICE 'Usuário Marcus não encontrado';
  ELSE
    RAISE NOTICE 'Marcus encontrado com ID: %', v_marcus_user_id;
    
    -- 7. Atualizar o discipulador do Marcus para 12 Apóstolos
    UPDATE discipulos
    SET discipulador_id = v_apostolos_user_id
    WHERE user_id = v_marcus_user_id;
    
    RAISE NOTICE 'Marcus agora tem 12 Apóstolos como discipulador';
  END IF;
  
  RAISE NOTICE 'Limpeza e associação concluídas com sucesso!';
  
END $$;
