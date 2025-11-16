-- Criar bucket de avatars se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Removendo IF NOT EXISTS das policies (não suportado no Supabase)
-- Deletar policies existentes antes de criar novas
DROP POLICY IF EXISTS "Usuários podem fazer upload de seus avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars são publicamente acessíveis" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatars" ON storage.objects;

-- Política para permitir usuários autenticados fazer upload de suas próprias fotos
CREATE POLICY "Usuários podem fazer upload de seus avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'user-' || auth.uid()::text
);

-- Política para permitir leitura pública dos avatars
CREATE POLICY "Avatars são publicamente acessíveis"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política para permitir usuários deletarem seus próprios avatars
CREATE POLICY "Usuários podem deletar seus próprios avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'user-' || auth.uid()::text
);

-- Política para permitir usuários atualizarem seus próprios avatars
CREATE POLICY "Usuários podem atualizar seus próprios avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'user-' || auth.uid()::text
);
