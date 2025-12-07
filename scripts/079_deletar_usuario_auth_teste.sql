-- Deletar usuário de autenticação do TESTE
-- Este script remove o usuário do Supabase Auth para permitir recriar

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Buscar o user_id do auth.users pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'teste@gmail.com';

  IF v_user_id IS NOT NULL THEN
    -- Deletar o usuário do auth (isso vai cascadear para identities e outras tabelas auth)
    DELETE FROM auth.users WHERE id = v_user_id;
    
    RAISE NOTICE 'Usuário Auth deletado com sucesso: %', v_user_id;
  ELSE
    RAISE NOTICE 'Nenhum usuário Auth encontrado com email teste@gmail.com';
  END IF;

  -- Também deletar qualquer registro órfão na tabela discipulos
  DELETE FROM discipulos WHERE email = 'teste@gmail.com';
  
  RAISE NOTICE 'Registros de discipulos deletados para email teste@gmail.com';
END $$;
