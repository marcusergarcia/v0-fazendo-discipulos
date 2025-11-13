-- Fix RLS para permitir leitura de perfis de discipuladores
-- O problema é que RLS está bloqueando a leitura do perfil do discipulador

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Usuários podem ver perfis de discipuladores" ON profiles;

-- Criar política que permite usuários autenticados lerem qualquer perfil
CREATE POLICY "Usuários podem ver todos os perfis"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Verificar as políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
