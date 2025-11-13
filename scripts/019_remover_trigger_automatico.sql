-- Script para remover o trigger automático de criação de perfil
-- Isso evita conflitos com a criação manual via Server Action

-- Remover o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Atualizar a função para não fazer nada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Função desabilitada - criação de perfil é feita manualmente
  RETURN NEW;
END;
$$;
