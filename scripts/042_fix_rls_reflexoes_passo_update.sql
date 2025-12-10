-- Permitir que discípulos atualizem suas próprias reflexões
-- Corrige o problema onde UPDATE retorna sucesso mas RLS bloqueia silenciosamente

-- Remover a política antiga que só permite discipuladores
DROP POLICY IF EXISTS "Discipuladores podem atualizar reflexões de seus discípulos" ON reflexoes_passo;

-- Criar nova política que permite TANTO discípulos quanto discipuladores
CREATE POLICY "Discípulos e discipuladores podem atualizar reflexões"
ON reflexoes_passo
FOR UPDATE
USING (
  -- O usuário é o próprio discípulo OU
  auth.uid() = discipulo_id
  OR
  -- O usuário é o discipulador do discípulo
  auth.uid() IN (
    SELECT d.discipulador_id
    FROM discipulos d
    WHERE d.id = reflexoes_passo.discipulo_id
  )
);

-- Verificar as políticas atuais
SELECT 
  policyname,
  cmd,
  qual::text as using_expression
FROM pg_policies
WHERE tablename = 'reflexoes_passo'
  AND cmd IN ('UPDATE', 'ALL');
