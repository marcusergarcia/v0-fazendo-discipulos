-- Script para criar o perfil do "12 Apóstolos" na tabela profiles
-- O usuário já existe em auth.users e discipulos, falta apenas em profiles

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar o user_id do 12 Apóstolos na tabela discipulos
  SELECT user_id INTO v_user_id
  FROM discipulos
  WHERE nivel_atual = 'Multiplicador' 
  AND discipulador_id IS NULL
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Criar o perfil apenas se não existir
    INSERT INTO profiles (
      id,
      nome_completo,
      email,
      genero,
      data_nascimento,
      etnia,
      igreja,
      bio,
      updated_at
    )
    VALUES (
      v_user_id,
      '12 Apóstolos',
      '12apostolos@fazendodiscipulos.com',
      'masculino',
      '2000-01-01',
      'Não informada',
      'Fazendo Discípulos',
      'Discipulador de referência com nível Multiplicador',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      nome_completo = '12 Apóstolos',
      email = '12apostolos@fazendodiscipulos.com',
      updated_at = NOW();

    RAISE NOTICE 'Perfil do 12 Apóstolos criado/atualizado com sucesso! ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário 12 Apóstolos não encontrado na tabela discipulos';
  END IF;
END $$;
