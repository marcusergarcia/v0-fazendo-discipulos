-- Script para remover completamente os dois usuários 12apostolos duplicados
-- Este script limpa todas as tabelas relacionadas

DO $$
BEGIN
  RAISE NOTICE 'Iniciando remoção dos usuários 12apostolos...';
  
  -- Deletar da tabela discipulos primeiro (por causa das foreign keys)
  DELETE FROM discipulos 
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '12apostolos@%'
  );
  RAISE NOTICE 'Registros removidos da tabela discipulos';
  
  -- Deletar da tabela profiles
  DELETE FROM profiles 
  WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '12apostolos@%'
  );
  RAISE NOTICE 'Registros removidos da tabela profiles';
  
  -- Atualizar discipulos que apontavam para 12apostolos (remover o discipulador_id)
  UPDATE discipulos 
  SET discipulador_id = NULL 
  WHERE discipulador_id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '12apostolos@%'
  );
  RAISE NOTICE 'Referencias ao discipulador removidas da tabela discipulos';
  
  -- Deletar da tabela auth.users por último
  DELETE FROM auth.users 
  WHERE email LIKE '12apostolos@%';
  RAISE NOTICE 'Registros removidos da tabela auth.users';
  
  RAISE NOTICE 'Remoção concluída com sucesso!';
END $$;
