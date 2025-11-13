DO $$
DECLARE
  v_apostolos_user_id UUID;
  v_apostolos_profile_exists BOOLEAN;
  v_apostolos_discipulo_exists BOOLEAN;
  v_marcus_user_id UUID;
  v_marcus_discipulador_id UUID;
BEGIN
  -- 1. Buscar o user_id do "12 Apóstolos" em auth.users
  SELECT id INTO v_apostolos_user_id
  FROM auth.users
  WHERE email = '12apostolos@fazendodiscipulos.com'
  LIMIT 1;
  
  RAISE NOTICE 'User ID de 12 Apóstolos: %', v_apostolos_user_id;
  
  IF v_apostolos_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário 12 Apóstolos não encontrado em auth.users. Execute o script 023 primeiro.';
  END IF;
  
  -- 2. Verificar se existe em profiles (usando coluna id, não user_id)
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = v_apostolos_user_id
  ) INTO v_apostolos_profile_exists;
  
  RAISE NOTICE 'Perfil de 12 Apóstolos existe: %', v_apostolos_profile_exists;
  
  -- 3. Se não existe em profiles, criar
  IF NOT v_apostolos_profile_exists THEN
    RAISE NOTICE 'Criando perfil de 12 Apóstolos...';
    
    INSERT INTO public.profiles (
      id,
      email, 
      nome_completo,
      genero,
      data_nascimento,
      etnia,
      igreja,
      telefone,
      bio,
      created_at,
      updated_at
    ) VALUES (
      v_apostolos_user_id,
      '12apostolos@fazendodiscipulos.com',
      '12 Apóstolos',
      'masculino',
      '0001-01-01',
      NULL,
      'Igreja Primitiva',
      NULL,
      'Discipulador referência do sistema',
      now(),
      now()
    );
    
    RAISE NOTICE 'Perfil de 12 Apóstolos criado com sucesso!';
  ELSE
    -- Atualizar nome_completo se já existir
    UPDATE public.profiles
    SET nome_completo = '12 Apóstolos',
        igreja = 'Igreja Primitiva',
        bio = 'Discipulador referência do sistema',
        updated_at = now()
    WHERE id = v_apostolos_user_id;
    
    RAISE NOTICE 'Perfil de 12 Apóstolos atualizado.';
  END IF;
  
  -- 4. Verificar se existe em discipulos
  SELECT EXISTS(
    SELECT 1 FROM public.discipulos WHERE user_id = v_apostolos_user_id
  ) INTO v_apostolos_discipulo_exists;
  
  RAISE NOTICE 'Registro de discípulo de 12 Apóstolos existe: %', v_apostolos_discipulo_exists;
  
  -- 5. Se não existe em discipulos, criar
  IF NOT v_apostolos_discipulo_exists THEN
    RAISE NOTICE 'Criando registro de discípulo de 12 Apóstolos...';
    
    INSERT INTO public.discipulos (
      user_id,
      discipulador_id,
      nivel_atual,
      fase_atual,
      xp_total,
      created_at,
      updated_at
    ) VALUES (
      v_apostolos_user_id,
      NULL, -- 12 Apóstolos não tem discipulador acima dele
      'Multiplicador',
      5,
      10000,
      now(),
      now()
    );
    
    RAISE NOTICE 'Registro de discípulo de 12 Apóstolos criado com sucesso!';
  ELSE
    -- Atualizar registro existente
    UPDATE public.discipulos
    SET nivel_atual = 'Multiplicador',
        fase_atual = 5,
        xp_total = 10000,
        discipulador_id = NULL,
        updated_at = now()
    WHERE user_id = v_apostolos_user_id;
    
    RAISE NOTICE 'Registro de discípulo de 12 Apóstolos atualizado.';
  END IF;
  
  -- 6. Buscar o user_id do Marcus
  SELECT id INTO v_marcus_user_id
  FROM auth.users
  WHERE email = 'marcus.macintel@terra.com.br'
  LIMIT 1;
  
  RAISE NOTICE 'User ID de Marcus: %', v_marcus_user_id;
  
  IF v_marcus_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário Marcus não encontrado em auth.users.';
  END IF;
  
  -- 7. Verificar o discipulador atual do Marcus
  SELECT discipulador_id INTO v_marcus_discipulador_id
  FROM public.discipulos
  WHERE user_id = v_marcus_user_id;
  
  RAISE NOTICE 'Discipulador atual de Marcus: %', v_marcus_discipulador_id;
  
  -- 8. Atualizar o discipulador do Marcus para 12 Apóstolos
  IF v_marcus_discipulador_id IS NULL OR v_marcus_discipulador_id != v_apostolos_user_id THEN
    RAISE NOTICE 'Atualizando discipulador de Marcus para 12 Apóstolos...';
    
    UPDATE public.discipulos
    SET discipulador_id = v_apostolos_user_id,
        updated_at = now()
    WHERE user_id = v_marcus_user_id;
    
    RAISE NOTICE 'Discipulador de Marcus atualizado com sucesso!';
  ELSE
    RAISE NOTICE 'Marcus já tem 12 Apóstolos como discipulador.';
  END IF;
  
  RAISE NOTICE '=== PROCESSO CONCLUÍDO COM SUCESSO ===';
  RAISE NOTICE 'Agora recarregue a página de perfil para ver 12 Apóstolos como discipulador!';
  
END $$;
