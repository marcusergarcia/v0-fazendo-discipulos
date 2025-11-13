-- Script para garantir que user_id em discipulos seja nullable
-- Necessário para permitir cadastro sem criação de usuário auth

DO $$ 
BEGIN
  -- Remover constraint NOT NULL se existir
  ALTER TABLE public.discipulos 
    ALTER COLUMN user_id DROP NOT NULL;
  
  RAISE NOTICE 'Coluna user_id agora permite NULL';
  
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Coluna user_id já permite NULL ou erro: %', SQLERRM;
END $$;

-- Comentário explicativo
COMMENT ON COLUMN public.discipulos.user_id IS 
  'UUID do usuário em auth.users. NULL durante cadastro inicial, preenchido após aprovação do discipulador';
