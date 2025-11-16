-- Adicionar campos de avatar e foto ao perfil
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS foto_perfil_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Atualizar política de update para incluir novos campos
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
