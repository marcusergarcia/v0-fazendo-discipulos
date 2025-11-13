-- Script para adicionar campo senha_temporaria na tabela discipulos
-- Este campo guarda a senha até o discipulador aprovar o cadastro

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'discipulos' 
    AND column_name = 'senha_temporaria'
  ) THEN
    ALTER TABLE public.discipulos 
    ADD COLUMN senha_temporaria TEXT;
    
    COMMENT ON COLUMN public.discipulos.senha_temporaria IS 'Senha temporária guardada até aprovação do discipulador';
  END IF;
END $$;
