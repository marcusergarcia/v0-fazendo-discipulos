-- Script para corrigir completamente o discipulador "12 Apóstolos"
-- Remove duplicados e garante consistência entre auth.users, profiles e discipulos

DO $$
DECLARE
  v_apostolos_user_id UUID;
  v_marcus_user_id UUID;
BEGIN
  RAISE NOTICE '=== INICIANDO LIMPEZA COMPLETA ===';
  
  -- 1. Buscar o user_id do Marcus
  SELECT id INTO v_marcus_user_id
  FROM auth.users
  WHERE email = 'marcus.macintel@terra.com.br'
  LIMIT 1;
  
  RAISE NOTICE 'Marcus user_id: %', v_marcus_user_id;
  
  -- 2. Deletar TODOS os registros de 12apostolos de todas as tabelas
  RAISE NOTICE 'Deletando registros antigos de 12apostolos...';
  
  -- Deletar de discipulos (usando os emails conhecidos)
  DELETE FROM public.discipulos
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%12apostolos%'
  );
  
  -- Deletar de profiles
  DELETE FROM public.profiles
  WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%12apostolos%'
  );
  
  -- Deletar de auth.users
  DELETE FROM auth.users
  WHERE email LIKE '%12apostolos%';
  
  RAISE NOTICE 'Registros antigos deletados';
  
  -- 3. Criar NOVO usuário 12 Apóstolos em auth.users
  RAISE NOTICE 'Criando novo usuário 12 Apóstolos...';
  
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
    role
  )
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    '12apostolos@fazendodiscipulos.com',
    crypt('SenhaSegura12Apostolos!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"12 Apóstolos"}',
    false,
    'authenticated'
  )
  RETURNING id INTO v_apostolos_user_id;
  
  RAISE NOTICE '12 Apóstolos user_id criado: %', v_apostolos_user_id;
  
  -- 4. Criar registro em profiles
  RAISE NOTICE 'Criando registro em profiles...';
  
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    created_at,
    updated_at
  )
  VALUES (
    v_apostolos_user_id,
    '12apostolos@fazendodiscipulos.com',
    '12 Apóstolos',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Registro em profiles criado';
  
  -- 5. Criar registro em discipulos com nível máximo
  RAISE NOTICE 'Criando registro em discipulos...';
  
  INSERT INTO public.discipulos (
    id,
    user_id,
    discipulador_id,
    nivel_atual,
    total_xp,
    fase_atual,
    created_at,
    updated_at,
    status
  )
  VALUES (
    gen_random_uuid(),
    v_apostolos_user_id,
    NULL, -- Sem discipulador acima dele
    'Multiplicador',
    10000,
    1,
    NOW(),
    NOW(),
    'ativo'
  );
  
  RAISE NOTICE 'Registro em discipulos criado com nível Multiplicador';
  
  -- 6. Atualizar o registro de Marcus para apontar para o novo 12 Apóstolos
  RAISE NOTICE 'Atualizando discipulador do Marcus...';
  
  UPDATE public.discipulos
  SET 
    discipulador_id = v_apostolos_user_id,
    updated_at = NOW()
  WHERE user_id = v_marcus_user_id;
  
  RAISE NOTICE 'Marcus agora aponta para 12 Apóstolos como discipulador';
  
  RAISE NOTICE '=== CORREÇÃO COMPLETA FINALIZADA ===';
  RAISE NOTICE 'Resumo:';
  RAISE NOTICE '- 12 Apóstolos user_id: %', v_apostolos_user_id;
  RAISE NOTICE '- Marcus user_id: %', v_marcus_user_id;
  RAISE NOTICE '- Marcus discipulador_id: %', v_apostolos_user_id;
  
END $$;
