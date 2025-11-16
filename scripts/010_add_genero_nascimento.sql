-- Adicionar campos de gênero e data de nascimento ao perfil
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS genero VARCHAR(20) CHECK (genero IN ('masculino', 'feminino')),
ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- Índice para melhorar performance em queries por gênero
CREATE INDEX IF NOT EXISTS idx_profiles_genero ON public.profiles(genero);
