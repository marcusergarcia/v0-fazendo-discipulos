-- Adicionar campo status para controlar ativação de usuários
-- Usuários começam como 'inativo' e ficam 'ativo' apenas após aprovação do discipulador

-- Adicionar coluna status na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'inativo' CHECK (status IN ('ativo', 'inativo'));

-- Adicionar coluna status na tabela discipulos  
ALTER TABLE public.discipulos
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'inativo' CHECK (status IN ('ativo', 'inativo'));

-- Atualizar o discipulador master para ativo
UPDATE public.profiles 
SET status = 'ativo'
WHERE email = (SELECT email FROM auth.users LIMIT 1);

UPDATE public.discipulos
SET status = 'ativo', aprovado_discipulador = TRUE
WHERE discipulador_id IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.status IS 'Status do usuário: inativo (aguardando aprovação) ou ativo (aprovado pelo discipulador)';
COMMENT ON COLUMN public.discipulos.status IS 'Status do discípulo: inativo (aguardando aprovação) ou ativo (aprovado e pode acessar o sistema)';
