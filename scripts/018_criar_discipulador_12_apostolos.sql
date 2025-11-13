-- Script para criar o discipulador de referência "12 Apóstolos"
-- Este é um discipulador simbólico que representa a base apostólica
-- Serve como referência para os líderes principais do ministério

-- Criar usuário no Auth (se não existir)
DO $$
DECLARE
  v_user_id uuid;
  v_marcus_user_id uuid;
BEGIN
  -- Gerar um UUID fixo para 12 Apóstolos
  v_user_id := '00000000-0000-0000-0000-000000000012'::uuid;
  
  -- Buscar o user_id do Marcus pelo email
  SELECT id INTO v_marcus_user_id
  FROM auth.users
  WHERE email = 'marcus.macintel@terra.com.br'
  LIMIT 1;
  
  -- Criar perfil para 12 Apóstolos (se não existir)
  INSERT INTO public.profiles (
    id,
    nome_completo,
    email,
    status,
    bio,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    '12 Apóstolos',
    '12apostolos@ministerio.com',
    'ativo',
    'Base apostólica do ministério - Representação simbólica dos 12 apóstolos de Jesus Cristo',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    bio = EXCLUDED.bio,
    status = 'ativo';
  
  -- Criar registro de discípulo para 12 Apóstolos com nível máximo
  INSERT INTO public.discipulos (
    user_id,
    discipulador_id,
    nivel_atual,
    xp_total,
    fase_atual,
    passo_atual,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    NULL, -- Não tem discipulador acima
    'Multiplicador', -- Nível máximo
    10000, -- XP máximo
    3, -- Fase 3
    10, -- Passo final
    'ativo',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nivel_atual = 'Multiplicador',
    xp_total = 10000,
    fase_atual = 3,
    passo_atual = 10,
    status = 'ativo';
  
  -- Associar Marcus aos 12 Apóstolos (se Marcus existir)
  IF v_marcus_user_id IS NOT NULL THEN
    UPDATE public.discipulos
    SET 
      discipulador_id = v_user_id,
      status = 'ativo'
    WHERE user_id = v_marcus_user_id;
    
    RAISE NOTICE 'Marcus foi associado aos 12 Apóstolos como discipulador';
  ELSE
    RAISE NOTICE 'Usuário Marcus não encontrado no sistema';
  END IF;
  
END $$;
