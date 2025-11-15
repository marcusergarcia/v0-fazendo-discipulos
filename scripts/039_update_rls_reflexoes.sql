-- Atualizar políticas RLS para usar discipulador_id
-- Remover a política antiga de discipuladores
DROP POLICY IF EXISTS "Discipuladores podem ver reflexões de seus discípulos" ON reflexoes_conteudo;

-- Criar nova política usando discipulador_id diretamente
CREATE POLICY "Discipuladores podem ver reflexões diretas"
ON reflexoes_conteudo FOR SELECT
USING (
  auth.uid() = discipulador_id
);

-- Verificar as políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'reflexoes_conteudo';
