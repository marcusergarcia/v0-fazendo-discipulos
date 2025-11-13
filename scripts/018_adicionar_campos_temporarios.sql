-- Script para adicionar campos temporários na tabela discipulos
-- Estes campos guardam os dados do cadastro até a aprovação do discipulador

-- Adicionar campos temporários para guardar dados antes da criação do usuário auth
ALTER TABLE public.discipulos 
ADD COLUMN IF NOT EXISTS email_temporario TEXT,
ADD COLUMN IF NOT EXISTS senha_temporaria TEXT,
ADD COLUMN IF NOT EXISTS nome_completo_temp TEXT,
ADD COLUMN IF NOT EXISTS telefone_temp TEXT,
ADD COLUMN IF NOT EXISTS igreja_temp TEXT,
ADD COLUMN IF NOT EXISTS genero_temp VARCHAR(20),
ADD COLUMN IF NOT EXISTS etnia_temp VARCHAR(50),
ADD COLUMN IF NOT EXISTS data_nascimento_temp DATE,
ADD COLUMN IF NOT EXISTS foto_perfil_url_temp TEXT;

-- Adicionar comentários explicativos
COMMENT ON COLUMN public.discipulos.email_temporario IS 'Email guardado temporariamente até aprovação do discipulador';
COMMENT ON COLUMN public.discipulos.senha_temporaria IS 'Senha guardada temporariamente até aprovação (será usada para criar auth.user)';
COMMENT ON COLUMN public.discipulos.user_id IS 'NULL até aprovação. Após aprovação, referencia o usuário criado em auth.users';
COMMENT ON COLUMN public.discipulos.status IS 'inativo = aguardando aprovação, ativo = aprovado e pode fazer login';
