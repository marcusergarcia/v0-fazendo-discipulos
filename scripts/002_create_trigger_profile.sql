-- Função para criar perfil automaticamente quando usuário se registra
-- DESABILITADA: A criação de perfil agora é manual via Server Action
-- para ter mais controle sobre o status (ativo/inativo) e aprovação
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trigger desabilitado - criação manual de perfil via código
  -- Não faz nada, apenas retorna NEW para não causar erro
  RETURN NEW;
END;
$$;

-- Remover o trigger se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Não recriar o trigger - deixar a criação ser manual
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();
